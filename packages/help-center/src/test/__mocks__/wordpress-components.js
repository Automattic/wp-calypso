// Minimal stub for @wordpress/components.
// The real package imports @wordpress/rich-text which calls combineReducers()
// before @wordpress/data is ready in Jest, crashing the entire test suite.
const React = require( 'react' );

module.exports = {
	Button: ( { children, onClick, disabled } ) =>
		React.createElement( 'button', { onClick, disabled }, children ),
	TextControl: ( { value, onChange, label } ) =>
		React.createElement( 'input', { value, onChange, 'aria-label': label } ),
	Tip: ( { children } ) => React.createElement( 'div', null, children ),
};
