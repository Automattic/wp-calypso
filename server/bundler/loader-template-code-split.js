/*eslint-disable no-var */
var config = require( 'config' ),
	page = require( 'page' ),
	React = require( 'react' ), //eslint-disable-line no-unused-vars
	find = require( 'lodash/find' ),
	sectionsUtils = require( 'lib/sections-utils' ),
	activateNextLayoutFocus = require( 'state/ui/layout-focus/actions' ).activateNextLayoutFocus,
	LoadingError = require( 'layout/error' ),
	controller = require( 'controller' ),
	restoreLastSession = require( 'lib/restore-last-path' ).restoreLastSession,
	preloadHub = require( 'sections-preload' ).hub,
	switchCSS = require( 'lib/i18n-utils/switch-locale' ).switchCSS;

var sections = /*___SECTIONS_DEFINITION___*/[];

var _loadedSections = {};

function maybeLoadCSS( sectionName ) { //eslint-disable-line no-unused-vars
	var section = find( sections, function finder( currentSection ) {
		return currentSection.name === sectionName;
	} );

	if ( ! ( section && section.css ) ) {
		return;
	}

	var url = ( typeof document !== 'undefined' && document.documentElement.dir === 'rtl' )
		? section.css.urls.rtl
		: section.css.urls.ltr;

	switchCSS( 'section-css-' + section.css.id, url );
}

function preload( sectionName ) {
	maybeLoadCSS( sectionName );
	switch ( sectionName ) { //eslint-disable-line no-empty
		/*___LOADERS___*/
	}
}
preloadHub.on( 'preload', preload );

function activateSection( sectionDefinition, context, next ) {
	var dispatch = context.store.dispatch;

	controller.setSection( sectionDefinition )( context );
	dispatch( { type: 'SECTION_SET', isLoading: false } );
	dispatch( activateNextLayoutFocus() );
	next();
}

function createPageDefinition( path, sectionDefinition ) {
	var pathRegex = sectionsUtils.pathToRegExp( path );

	page( pathRegex, function( context, next ) {
		var envId = sectionDefinition.envId,
			dispatch = context.store.dispatch;

		if ( envId && envId.indexOf( config( 'env_id' ) ) === -1 ) {
			return next();
		}
		if ( _loadedSections[ sectionDefinition.module ] ) {
			return activateSection( sectionDefinition, context, next );
		}
		if ( config.isEnabled( 'restore-last-location' ) && restoreLastSession( context.path ) ) {
			return;
		}
		dispatch( { type: 'SECTION_SET', isLoading: true } );
		preload( sectionDefinition.name ).then( function( requiredModule ) {
			var loadedModules = Array.isArray( requiredModule ) ? requiredModule : [ requiredModule ];
			if ( ! _loadedSections[ sectionDefinition.module ] ) {
				loadedModules.forEach( mod => mod( controller.clientRouter ) );
				_loadedSections[ sectionDefinition.module ] = true;
			}
			return activateSection( sectionDefinition, context, next );
		},
		function onError( error ) {
			if ( ! LoadingError.isRetry() ) {
				console.warn( error );
				LoadingError.retry( sectionDefinition.name );
			} else {
				console.error( error );
				dispatch( { type: 'SECTION_SET', isLoading: false } );
				LoadingError.show( sectionDefinition.name );
			}
		} );
	} );
}

module.exports = {
	get: sectionsUtils.getSectionsFactory( sections ),
	load: sectionsUtils.loadSectionsFactory( sections, createPageDefinition ),
};
