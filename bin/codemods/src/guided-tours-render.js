/**
 * Guided Tours Rendering Codemod
 * Transform directly inlined JSX markup into render props. That makes initial load
 * faster and the Guided Tours get properly translated.
 */

const config = require( './config' );
const prettier = require( 'prettier' );

export default function transformer( file, api ) {
	const j = api.jscodeshift;
	const root = j( file.source );

	/* Does the file have any <Step> JSX instances? */
	const stepEls = root.findJSXElements( 'Step' );
	if ( stepEls.size() === 0 ) {
		// nothing to transform here
		return null;
	}

	stepEls.forEach( ( stepEl ) => {
		/* Extract the children */
		const stepElValue = stepEl.get().value;
		const { children } = stepElValue;

		/* Wrap them in a functional component with Fragment */
		const trIden = j.identifier( 'translate' );
		const trProp = j.property( 'init', trIden, trIden );
		trProp.shorthand = true;
		const fragmentIden = j.jsxIdentifier( 'Fragment' );
		const childrenFunc = j.arrowFunctionExpression(
			[ j.objectPattern( [ trProp ] ) ],
			j.jsxElement(
				j.jsxOpeningElement( fragmentIden ),
				j.jsxClosingElement( fragmentIden ),
				children
			)
		);

		/* Replace the children JSX with the functional component */
		stepElValue.children = [ j.jsxExpressionContainer( childrenFunc ) ];
	} );

	/* Add `Fragment` to React imports */
	const reactImport = root.find( j.ImportDeclaration, { source: { value: 'react' } } );
	reactImport.get().value.specifiers.push( j.importSpecifier( j.identifier( 'Fragment' ) ) );

	/* Remove the i18n import */
	const i18nImport = root.find( j.ImportDeclaration, { source: { value: 'i18n-calypso' } } );
	i18nImport.remove();

	return prettier.format( root.toSource( config.recastOptions ), {} );
}
