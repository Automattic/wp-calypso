// Inherits Calypso's root config. Two deviations, both about the move itself:
//
// 1. The upstream config extended `plugin:@wordpress/eslint-plugin/recommended`.
//    Calypso pins @wordpress/eslint-plugin ^25, where that path resolves to a
//    flat config and blows up under ESLINT_USE_FLAT_CONFIG=false. Calypso's own
//    root config reaches the eslintrc-format rules via the `/eslintrc` subpath,
//    so inheriting it is enough.
// 2. This code was formatted with stock prettier; Calypso runs wp-prettier,
//    which adds paren spacing. Enforcing it here would mean reformatting the
//    whole package in the commit that moves it. Deferred to a follow-up.
module.exports = {
	rules: {
		'prettier/prettier': 'off',
		'import/order': 'off',
		'@wordpress/i18n-text-domain': [ 'error', { allowedTextDomain: 'a8c-agenttic' } ],
		'no-console': 'off',
	},
};
