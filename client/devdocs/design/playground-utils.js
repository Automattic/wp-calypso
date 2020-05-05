/**
 * External dependencies
 */
import { findKey } from 'lodash';
import format from 'react-element-to-jsx-string';

/**
 * Internal dependencies
 */
import * as scope from './playground-scope';

// Figure out a React element's display name, with the help of the `playground-scope` map.
function displayName( element ) {
	// if `type` is a string, then it's a DOM element like `div`
	if ( typeof element.type === 'string' ) {
		return element.type;
	}

	// find the component (by value) in the `playground-scope` map
	const scopeName = findKey( scope, ( type ) => element.type === type );
	if ( scopeName ) {
		return scopeName;
	}

	// fall back to classic (potentially minified) constructor function name
	if ( typeof element.type === 'function' ) {
		return element.type.displayName || element.type.name;
	}

	return 'No Display Name';
}

export const getExampleCodeFromComponent = ( ExampleComponent ) => {
	if ( ! ExampleComponent.props.exampleCode ) {
		return null;
	}

	if ( typeof ExampleComponent.props.exampleCode === 'string' ) {
		return ExampleComponent.props.exampleCode;
	}

	return format( ExampleComponent.props.exampleCode, {
		showDefaultProps: false,
		displayName,
	} ).replace( /Localized\((\w+)\)/g, '$1' );
};
