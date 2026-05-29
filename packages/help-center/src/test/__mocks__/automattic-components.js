// Minimal stub for @automattic/components.
// The real package imports @wordpress/rich-text which calls combineReducers()
// before @wordpress/data is ready in Jest.
const React = require( 'react' );

module.exports = {
	FormInputValidation: ( { text } ) => React.createElement( 'p', null, text ),
};
