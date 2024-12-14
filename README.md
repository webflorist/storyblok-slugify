# Storyblok Slugify CLI

[![npm version](https://img.shields.io/npm/v/storyblok-slugify.svg)](https://www.npmjs.com/package/storyblok-slugify)
[![license](https://img.shields.io/github/license/webflorist/storyblok-slugify)](https://github.com/webflorist/storyblok-slugify/blob/main/LICENSE)

A npx CLI tool to automatically create slugs for stories of a space of the [Storyblok CMS](https://www.storyblok.com).

The script will use Storyblok's Management API to fetch all desired stories, create slugs from a configurable source field (e.g. 'title') and update the configurable slug-field of the story.

The script also checks for duplicate stories.

This script is specifically useful, if you do not use the "Translated Slugs" app of Storyblok.

## Installation

```shell

# simply auto-download and run via npx
$ npx storyblok-slugify

# or install globally
$ npm install -g storyblok-slugify

# or install for project using npm
$ npm install storyblok-slugify

# or install for project using yarn
$ yarn add storyblok-slugify

# or install for project using pnpm
$ pnpm add storyblok-slugify
```

## Usage

Call `npx storyblok-slugify` with the following options:

### Options

```text
--token <token>                (required) Personal OAuth access token created
                               in the account settings of a Stoyblok user.
                               (NOT the Access Token of a Space!)
--space <space_id>             (required) ID of the space to process
--slug-field <field>           (required) Target field to write the slug to (e.g. 'slug').
                               Use 'translatable-slugs', if you are using Storyblok's Translatable Slug app.
                               (Warning: Changes in Translatable Slugs will be published immediately!)
--source-field <field>         (required) Source field to generate the slug from (e.g. 'title').
--content-type <content-type>  Content/component type to process. Defaults to 'page'.
--skip-stories <stories>       Comma seperated list of the full-slugs of stories to skip.
                               (e.g. --skip-stories "home,about-us")
--only-stories <stories>       Comma seperated list of the full-slugs of stories you want to limit processing to.
                               (e.g. --only-stories "about-us")
--locales <locales>            Comma seperated languages to process. Use 'default' for default locale.
                               (e.g. --locales "default,de,fr")
                               Defaults to 'default'.
--force                        Creates new slug, even if slug-field already has content. Defaults to false.
--publish                      Publish stories after updating. Defaults to false.
                               WARNING: May publish previously unpublished stories.
--dry-run                      Only display the changes instead of performing them. Defaults to false.
--help                         Show this help
```

### Minimal example

```shell
npx storyblok-slugify --token 1234567890abcdef --space 12345 --slug-field "slug" --source-field "title"
```

### Maximal example

```shell
npx storyblok-slugify \\
    --token 1234567890abcdef \\
    --slug-field "slug" \\
    --source-field "title" \\
    --content-type "page,news-article" \\
    --skip-stories "home" \\
    --locales "default,de,fr" \\
    --force \\
    --publish \\
    --dry-run
```

## License

This package is open-sourced software licensed under the [MIT license](https://github.com/webflorist/storyblok-slugify/blob/main/LICENSE.).
