/**
 * External dependencies
 */
import format from 'react-element-to-jsx-string';

export const getExampleCodeFromComponent = ExampleComponent => {
	if ( ! ExampleComponent.props.exampleCode ) {
		return null;
	}

	if ( typeof ExampleComponent.props.exampleCode === 'string' ) {
		return ExampleComponent.props.exampleCode;
	}

	return format( ExampleComponent.props.exampleCode, {
		showDefaultProps: false,
	} ).replace( /Localized\((\w+)\)/g, '$1' );
};
