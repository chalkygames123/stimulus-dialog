const rules = {
	'capitalized-comments': 'off',
	'class-methods-use-this': 'error',
	'unicorn/prevent-abbreviations': 'off',
};

module.exports = {
	root: true,
	extends: ['xo', 'plugin:unicorn/recommended', 'prettier'],
	rules: {
		...rules,
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
			rules: {
				...rules,
			},
		},
	],
};
