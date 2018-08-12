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
