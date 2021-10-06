module.exports = {
	root: true,
	extends: ['xo', 'plugin:unicorn/recommended', 'prettier'],
	rules: {
		'unicorn/prevent-abbreviations': 'off',
	},
	overrides: [
		{
			files: '**/*.cjs',
		},
		{
			files: 'src/**',
			extends: ['xo/browser', 'prettier'],
			parser: '@babel/eslint-parser',
			plugins: ['@babel'],
		},
	],
};
