module.exports = {
  semi: false,
  singleQuote: true,
  overrides: [
    {
      files: '*.html',
      options: {
        printWidth: Number.POSITIVE_INFINITY,
      },
    },
  ],
}
