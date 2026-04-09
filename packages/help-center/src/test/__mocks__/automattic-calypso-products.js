// Minimal stub for @automattic/calypso-products.
// The real package imports @automattic/components → @wordpress/rich-text which
// calls combineReducers() before @wordpress/data is ready in Jest.
module.exports = {
	getPlan: () => null,
	getPlanTermLabel: () => '',
};
