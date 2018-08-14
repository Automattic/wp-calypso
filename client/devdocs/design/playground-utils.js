/** @format */

/**
 * External dependencies
 */
import jsxToString from 'jsx-to-string';

export const getExampleCodeFromComponent = ExampleComponent => {
	if ( ! ExampleComponent.props.exampleCode ) {
		return null;
	}

	if ( typeof ExampleComponent.props.exampleCode === 'string' ) {
		return ExampleComponent.props.exampleCode;
	}

	// Overrides the value of the props used in any component rendered by the example with the value
	// of the props defined by the example component. Useful for defining dynamic props that need
	// to be injected to the components used in the example.
	const keyValueOverride = {};
	Object.keys( ExampleComponent.props ).forEach( prop => {
		const propValue = ExampleComponent.props[ prop ];
		switch ( typeof propValue ) {
			case 'string':
				keyValueOverride[ prop ] = `"${ propValue }"`;
				break;
			case 'object':
				keyValueOverride[ prop ] = JSON.stringify( propValue );
				break;
		}
	} );

	return jsxToString( ExampleComponent.props.exampleCode, {
		useFunctionCode: true,
		keyValueOverride,
	} ).replace( /Localized\((\w+)\)/g, '$1' );
};
