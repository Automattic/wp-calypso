// Minimal stub for @automattic/data-stores.
// The real package imports @automattic/calypso-products → @automattic/components
// → @wordpress/rich-text, which calls combineReducers() before @wordpress/data
// is ready in the Jest environment.

const HelpCenter = {
	register: () => 'help-center',
};

module.exports = { HelpCenter };
