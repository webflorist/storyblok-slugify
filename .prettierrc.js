module.exports = {
   semi: false,
   singleQuote: true,
   useTabs: false,
   tabWidth: 3,
   printWidth: 100,
   trailingComma: 'es5',
   overrides: [
      {
         files: ['**/*.md', '**/*.yaml', '**/*.yml'],
         options: {
            tabWidth: 2,
         },
      },
   ],
}
