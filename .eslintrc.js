module.exports = {
  root: true,
  extends: ['xo', 'plugin:unicorn/recommended', 'prettier'],
  rules: {
    'unicorn/prefer-module': 'off',
    'unicorn/prevent-abbreviations': 'off',
  },
  overrides: [
    {
      files: 'src/**',
      extends: ['xo/browser', 'prettier'],
    },
  ],
}
