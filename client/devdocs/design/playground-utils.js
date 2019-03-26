/** @format */

/**
 * External dependencies
 */
import prettyFormat from 'pretty-format';

export const getExampleCodeFromComponent = ExampleComponent => {
	if ( ! ExampleComponent.props.exampleCode ) {
		return null;
	}

	if ( typeof ExampleComponent.props.exampleCode === 'string' ) {
		return ExampleComponent.props.exampleCode;
	}

	return prettyFormat( ExampleComponent.props.exampleCode, {
		plugins: [ prettyFormat.plugins.ReactElement ],
		printFunctionName: false,
	} ).replace( /Localized\((\w+)\)/g, '$1' );
};
