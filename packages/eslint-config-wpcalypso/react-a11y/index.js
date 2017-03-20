module.exports = {
	'extends': '../react/index.js',
	plugins: [
		'jsx-a11y'
	],
	rules: {
		'jsx-a11y/accessible-emoji': 2,
		// 'jsx-a11y/anchor-has-content' doesn't handle our translation system
		'jsx-a11y/aria-activedescendant-has-tabindex': 2,
		'jsx-a11y/aria-props': 2,
		'jsx-a11y/aria-proptypes': 2,
		'jsx-a11y/aria-role': 2,
		'jsx-a11y/aria-unsupported-elements': 2,
		'jsx-a11y/click-events-have-key-events': 2,
		'jsx-a11y/heading-has-content': 2,
		'jsx-a11y/href-no-hash': 2,
		'jsx-a11y/html-has-lang': 2,
		'jsx-a11y/iframe-has-title': 2,
		'jsx-a11y/img-has-alt': 2,
		'jsx-a11y/img-redundant-alt': 2,
		'jsx-a11y/label-has-for': 2,
		'jsx-a11y/lang': 2,
		'jsx-a11y/mouse-events-have-key-events': 2,
		'jsx-a11y/no-access-key': 2,
		// 'jsx-a11y/no-autofocus' Replace this with a rule that detects if all autofocus have a describedby
		'jsx-a11y/no-distracting-elements': 2,
		'jsx-a11y/no-onchange': 2,
		'jsx-a11y/no-redundant-roles': 2,
		// 'jsx-a11y/no-static-element-interactions' Not needed right now if the following two rules are set
		'jsx-a11y/onclick-has-focus': 2,
		'jsx-a11y/onclick-has-role': 2,
		'jsx-a11y/role-has-required-aria-props': 2,
		'jsx-a11y/role-supports-aria-props': 2,
		'jsx-a11y/scope': 2,
		'jsx-a11y/tabindex-no-positive': 2,
	}
};
