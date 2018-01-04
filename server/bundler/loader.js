/** @format */
const config = require( 'config' ),
	fs = require( 'fs' ),
	groupBy = require( 'lodash/groupBy' ),
	toPairs = require( 'lodash/toPairs' ),
	path = require( 'path' ),
	utils = require( './utils' );

function getSectionsModule( sections ) {
	const templateFile = config.isEnabled( 'code-splitting' )
		? 'loader-template-code-split.js'
		: 'loader-template.js';
	const loaderFactory = config.isEnabled( 'code-splitting' )
		? getSectionPreLoaderTemplate
		: getSectionRequire;

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

function getSectionRequire( section ) {
	return `
		case ${ JSON.stringify( section.name ) }: return require( ${ JSON.stringify( section.module ) } );
	`;
}

function getSectionPreLoaderTemplate( sectionsByName ) {
	const [ sectionName, sections ] = sectionsByName;
	const sectionNameString = JSON.stringify( sectionName );

	const getModuleLoader = ( importSectionName, importModuleName ) =>
		`import( /* webpackChunkName: '${ importSectionName }' */ '${ importModuleName }' )`;

	const loader =
		sections.length === 1
			? `${ getModuleLoader( sectionName, sections[ 0 ].module ) }`
			: `Promise.all( [ ${ sections
					.map( sec => getModuleLoader( sectionName, sec.module ) )
					.join( ',' ) } ] )`;

	return `
		case ${ sectionNameString }:
			return ${ loader };
	`;
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
