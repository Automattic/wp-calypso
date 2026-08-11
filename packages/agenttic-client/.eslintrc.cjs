// Inherits Calypso's root config. The upstream config extended
// `plugin:@wordpress/eslint-plugin/recommended`, which resolves to a flat config under Calypso's
// pinned v25 and crashes eslintrc mode; Calypso's root already provides those rules.
module.exports = {
	rules: {
		// This package was formatted with stock prettier, Calypso runs wp-prettier (paren spacing).
		// Reformatting is a pending follow-up; see AGENTS.md.
		'prettier/prettier': 'off',
		'import/order': 'off',
		'@wordpress/i18n-text-domain': [ 'error', { allowedTextDomain: 'a8c-agenttic' } ],
		'no-console': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_',
				ignoreRestSiblings: true,
			},
		],
		// 16 undocumented `@ts-ignore`s came over with the move. Documenting them needs the original
		// authors; until then this stays relaxed rather than fabricating rationales.
		'@typescript-eslint/ban-ts-comment': [
			'error',
			{ 'ts-ignore': false, 'ts-expect-error': false },
		],
	},
};
