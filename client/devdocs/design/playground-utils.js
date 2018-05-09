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

	return jsxToString( ExampleComponent.props.exampleCode, { useFunctionCode: true } ).replace(
		/Localized\((\w+)\)/g,
		'$1'
	);
};
