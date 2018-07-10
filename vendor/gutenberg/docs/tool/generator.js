/**
 * Node dependencies
 */
const path = require( 'path' );
const fs = require( 'fs' );
const { kebabCase } = require( 'lodash' );

/**
 * Generates the table of contents' markdown.
 *
 * @param {Object} parsedNamespaces Parsed Namespace Object
 *
 * @return {string} Markdown string
 */
function generateTableOfContent( parsedNamespaces ) {
	return [
		'# Data Module Reference',
		'',
		Object.values( parsedNamespaces ).map( ( parsedNamespace ) => {
			return ` - [**${ parsedNamespace.name }**: ${ parsedNamespace.title }](../../docs/data/data-${ kebabCase( parsedNamespace.name ) }.md)`;
		} ).join( '\n' ),
	].join( '\n' );
}

/**
 * Generates the table of contents' markdown.
 *
 * @param {Object}  parsedFunc            Parsed Function
 * @param {boolean} generateDocsForReturn Whether to generate docs for the return value.
 *
 * @return {string} Markdown string
 */
function generateFunctionDocs( parsedFunc, generateDocsForReturn = true ) {
	return [
		`### ${ parsedFunc.name }`,
		parsedFunc.description ? [
			'',
			parsedFunc.description,
		].join( '\n' ) : null,
		parsedFunc.params.length ? [
			'',
			'*Parameters*',
			'',
			parsedFunc.params.map( ( param ) => (
				` * ${ param.name }: ${ param.description }`
			) ).join( '\n' ),
		].join( '\n' ) : null,
		parsedFunc.return && generateDocsForReturn ? [
			'',
			'*Returns*',
			'',
			parsedFunc.return.description,
		].join( '\n' ) : null,
	].filter( ( row ) => row !== null ).join( '\n' );
}

/**
 * Generates the namespace selectors/actions markdown.
 *
 * @param {Object} parsedNamespace Parsed Namespace
 *
 * @return {string} Markdown string
 */
function generateNamespaceDocs( parsedNamespace ) {
	return [
		`# **${ parsedNamespace.name }**: ${ parsedNamespace.title }`,
		'',
		'## Selectors ',
		'',
		( parsedNamespace.selectors.map( generateFunctionDocs ) ).join( '\n\n' ),
		'',
		'## Actions',
		'',
		parsedNamespace.actions.map(
			( action ) => generateFunctionDocs( action, false )
		).join( '\n\n' ),
	].join( '\n' );
}

module.exports = function( parsedNamespaces, rootFolder ) {
	const tableOfContent = generateTableOfContent( parsedNamespaces );
	fs.writeFileSync(
		path.join( rootFolder, 'README.md' ),
		tableOfContent
	);

	Object.values( parsedNamespaces ).forEach( ( parsedNamespace ) => {
		const namespaceDocs = generateNamespaceDocs( parsedNamespace );
		fs.writeFileSync(
			path.join( rootFolder, 'data-' + kebabCase( parsedNamespace.name ) + '.md' ),
			namespaceDocs
		);
	} );
};
