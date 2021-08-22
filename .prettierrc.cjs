module.exports = {
	semi: false,
	singleQuote: true,
	useTabs: true,
	overrides: [
		{
			files: '*.html',
			options: {
				printWidth: Number.POSITIVE_INFINITY,
			},
		},
	],
}
