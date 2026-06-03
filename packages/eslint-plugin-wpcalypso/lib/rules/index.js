function adapt( rule ) {
	if ( typeof rule !== 'function' ) {
		return rule;
	}
	const meta = { ...( rule.meta || {} ) };
	if ( rule.schema && meta.schema === undefined ) {
		meta.schema = rule.schema;
	}
	if ( meta.fixable === true ) {
		meta.fixable = 'code';
	}
	return { meta, create: rule };
}

module.exports = {
	'i18n-ellipsis': adapt( require( './i18n-ellipsis' ) ),
	'i18n-mismatched-placeholders': adapt( require( './i18n-mismatched-placeholders' ) ),
	'i18n-named-placeholders': adapt( require( './i18n-named-placeholders' ) ),
	'i18n-no-collapsible-whitespace': adapt( require( './i18n-no-collapsible-whitespace' ) ),
	'i18n-no-placeholders-only': adapt( require( './i18n-no-placeholders-only' ) ),
	'i18n-no-this-translate': adapt( require( './i18n-no-this-translate' ) ),
	'i18n-no-variables': adapt( require( './i18n-no-variables' ) ),
	'i18n-translate-identifier': adapt( require( './i18n-translate-identifier' ) ),
	'i18n-unlocalized-url': adapt( require( './i18n-unlocalized-url' ) ),
	'jsx-async-load-require-top-level': adapt( require( './jsx-async-load-require-top-level' ) ),
	'jsx-classname-namespace': adapt( require( './jsx-classname-namespace' ) ),
	'jsx-gridicon-size': adapt( require( './jsx-gridicon-size' ) ),
	'post-message-no-wildcard-targets': adapt( require( './post-message-no-wildcard-targets' ) ),
	'redux-no-bound-selectors': adapt( require( './redux-no-bound-selectors' ) ),
	'no-unsafe-wp-apis': adapt( require( './no-unsafe-wp-apis' ) ),
};
