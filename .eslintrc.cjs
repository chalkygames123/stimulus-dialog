module.exports = {
  root: true,
  extends: ['xo', 'plugin:unicorn/recommended', 'prettier'],
  rules: {
    'unicorn/prevent-abbreviations': 'off',
  },
  overrides: [
    {
      files: 'src/**',
      extends: ['xo/browser', 'prettier'],
    },
  ],
}
