/** @format */
const config = require( 'config' ),
	fs = require( 'fs' ),
	groupBy = require( 'lodash/groupBy' ),
	toPairs = require( 'lodash/toPairs' ),
	partial = require( 'lodash/partial' ),
	path = require( 'path' ),
	utils = require( './utils' );

function getSectionsModule( sections ) {
	const templateFile = config.isEnabled( 'code-splitting' )
		? 'loader-template-code-split.js'
		: 'loader-template.js';
	const loaderFactory = config.isEnabled( 'code-splitting' )
		? partial( getSectionsLoadersTemplate, true )
		: partial( getSectionsLoadersTemplate, false );

	return fs
		.readFileSync( path.join( __dirname, templateFile ), 'utf8' )
		.replace( '/*___SECTIONS_DEFINITION___*/', JSON.stringify( sections ) + ' || ' )
		.replace(
			'/*___LOADERS___*/',
			toPairs( groupBy( sections, 'name' ) )
				.map( loaderFactory )
				.join( '\n' )
		);
}

function getModuleLoader( async = false, section ) {
	return async
		? `import( /* webpackChunkName: ${ JSON.stringify( section.name ) } */ ${ JSON.stringify(
				section.module
			) } )`
		: `require( ${ JSON.stringify( section.module ) } )`;
}

function getSectionsLoadersTemplate( async = false, sectionsByName ) {
	const [ sectionName, sections ] = sectionsByName;

	const loadersArray = `[ ${ sections.map( sec => getModuleLoader( async, sec ) ).join( ',' ) } ]`;

	const finalLoader = async ? `Promise.all( ${ loadersArray } )` : loadersArray;

	return `case ${ JSON.stringify( sectionName ) }: return ${ finalLoader };`;
}

function sectionsWithCSSUrls( sections ) {
	return sections.map( section =>
		Object.assign(
			{},
			section,
			section.css && {
				css: {
					id: section.css,
					urls: utils.getCssUrls( section.css ),
				},
			}
		)
	);
}

module.exports = function( content ) {
	const sections = require( this.resourcePath );

	if ( ! Array.isArray( sections ) ) {
		this.emitError( 'Chunks module is not an array' );
		return content;
	}

	this.addDependency( 'page' );

	return getSectionsModule( sectionsWithCSSUrls( sections ) );
};
