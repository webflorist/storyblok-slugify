#!/usr/bin/env node
/* eslint-disable no-console */
import slugify from '@sindresorhus/slugify'
import minimist from 'minimist'
import StoryblokClient from 'storyblok-js-client'
import { performance } from 'perf_hooks'

const startTime = performance.now()

const args = minimist(process.argv.slice(2))

if ('help' in args) {
	console.log(`USAGE
  $ npx storyblok-slugify
  
OPTIONS
  --token <token>                (required) Personal OAuth access token created
                                 in the account settings of a Stoyblok user.
                                 (NOT the Access Token of a Space!)
  --space <space_id>             (required) ID of the space to process
  --slug-field <field>           (required) Target field to write the slug to (e.g. 'slug').
  --source-field <field>         (required) Source field to generate the slug from (e.g. 'title').
  --content-type <content-type>  Content/component type to process. Defaults to 'page'.
  --skip-stories <stories>       Comma seperated list of the full-slugs of stories to skip.
                                 (e.g. --skip-stories "home,about-us")
  --locales <locales>            Comma seperated languages to process. Use 'default' for default locale.
                                 (e.g. --locales "default,de,fr")
                                 Defaults to 'default'.
  --force                        Creates new slug, even if slug-field already has content. Defaults to false.
  --publish                      Publish stories after updating. Defaults to false.
  --help                         Show this help

MINIMAL EXAMPLE
  $ npx storyblok-slugify --token 1234567890abcdef --space 12345 --slug-field "slug" --source-field "title"

MAXIMAL EXAMPLE
  $ npx storyblok-slugify \\
      --token 1234567890abcdef \\
      --slug-field "slug" \\
      --source-field "title" \\
      --content-type "page,news-article" \\
      --skip-stories "home" \\
      --locales "default,de,fr" \\
      --force \\
      --publish
`)
	process.exit(0)
}

if (!('token' in args)) {
	console.log(
		'Error: State your oauth token via the --token argument. Use --help to find out more.'
	)
	process.exit(1)
}

if (!('space' in args)) {
	console.log('Error: State your space id via the --space argument. Use --help to find out more.')
	process.exit(1)
}

if (!('slug-field' in args)) {
	console.log(
		'Error: State the name of the slug field via the --slug-field argument. Use --help to find out more.'
	)
	process.exit(1)
}

if (!('source-field' in args)) {
	console.log(
		'Error: State the name of the source field via the --source-field argument. Use --help to find out more.'
	)
	process.exit(1)
}

const spaceId = args.space

const contentType = args['content-type'] || 'page'

const locales = args['locales'] ? args['locales'].split(',') : ['default']

const skipStories = args['skip-stories'] ? args['skip-stories'].split(',') : []

console.log(
	`Creating slugs for stories with content type "${contentType}" and locales "${locales.join(
		', '
	)}" of space "${spaceId}":`
)

// Init Management API
const StoryblokMAPI = new StoryblokClient({
	oauthToken: args.token,
})

// Function to perform a default fetch
const defaultFetch = async (type, folder, fileField) => {
	await StoryblokMAPI.getAll(`spaces/${spaceId}/${type}`)
		.then((items) => {
			items.forEach((item) => writeJson(folder, item[fileField], item))
		})
		.catch((error) => {
			throw error
		})
}

// Fetch all stories
console.log(`Fetching stories...`)
const stories = []
await StoryblokMAPI.getAll(`spaces/${spaceId}/stories`)
	.then(async (storyList) => {
		for (const story of storyList) {
			if (
				!story.is_folder &&
				story.content_type === contentType &&
				!skipStories.includes(story.full_slug)
			) {
				await StoryblokMAPI.get(`spaces/${spaceId}/stories/${story.id}`)
					.then((response) => {
						stories.push(response.data.story)
					})
					.catch((error) => {
						throw error
					})
			}
		}
	})
	.catch((error) => {
		throw error
	})

for (let i = 0; i < stories.length; i++) {
	const story = stories[i]
	for (let j = 0; j < locales.length; j++) {
		const locale = locales[j]
		const sourceField =
			locale !== 'default' && `${args['source-field']}__i18n__${locale}` in story.content
				? `${args['source-field']}__i18n__${locale}`
				: args['source-field']

		if (!(sourceField in story.content)) {
			console.log(
				`Error: Source field "${sourceField}" not found in story "${story.full_slug}".`
			)
			process.exit(1)
		}

		const sourceText = story.content[sourceField]

		if (sourceText.length === 0) {
			console.log(
				`Error: Source field "${sourceField}" is empty for story "${story.full_slug}".`
			)
			process.exit(1)
		}

		if (!(args['slug-field'] in story.content)) {
			console.log(
				`Error: Slug field "${args['slug-field']} not found in story "${story.full_slug}".`
			)
			process.exit(1)
		}

		const slugField =
			locale === 'default' ? args['slug-field'] : `${args['slug-field']}__i18n__${locale}`

		if (story.content[slugField] && story.content[slugField].length > 0 && !args.force) {
			console.log(
				`Skipped story "${story.full_slug}", because it already has slug for locale "${locale}" ("${story.content[slugField]}") and --force is not set.`
			)
			continue
		}

		const slug = slugify(sourceText)

		const conflictingStory = stories.find(
			(tmpStory) => tmpStory.id !== story.id && tmpStory.content[slugField] === slug
		)

		if (conflictingStory) {
			console.log(
				`Error: Cannot set slug "${slug}" for locale "${locale}" and story "${story.full_slug}", because different story ("${conflictingStory.full_slug}) already has the same slug.`
			)
			process.exit(1)
		}

		// Update slug in main stories array, so check for unique slug works above.
		stories[i].content[slugField] = slug

		await StoryblokMAPI.put(`spaces/${spaceId}/stories/${story.id}`, {
			story: stories[i],
			...(args.publish ? { publish: 1 } : {}),
		})
			.then((response) => {
				console.log(
					`Updated story "${story.full_slug}" and language "${locale}" with slug "${slug}".`
				)
			})
			.catch((error) => {
				throw error
			})
	}
}

const endTime = performance.now()

console.log(`Process successfully finished in ${Math.round((endTime - startTime) / 1000)} seconds.`)
process.exit(0)
