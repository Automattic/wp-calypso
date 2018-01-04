/*eslint-disable no-var */
var config = require( 'config' ),
	page = require( 'page' ),
	React = require( 'react' ),
	find = require( 'lodash/find' ),
	activateNextLayoutFocus = require( 'state/ui/layout-focus/actions' ).activateNextLayoutFocus,
	LoadingError = require( 'layout/error' ),
	controller = require( 'controller' ),
	restoreLastSession = require( 'lib/restore-last-path' ).restoreLastSession,
	preloadHub = require( 'sections-preload' ).hub,
	switchCSS = require( 'lib/i18n-utils/switch-locale' ).switchCSS;

var sections = ___SECTIONS_DEFINITION___;

var _loadedSections = {};

function loadCSS( sectionName ) {
	var section = find( sections, function ( section ) {
		return section.name === sectionName;
	} );

	if ( ! ( section && section.css ) ) {
		return;
	}

	var url = section.css.urls.ltr;

	if ( typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ) {
		url = section.css.urls.rtl;
	}

	switchCSS( 'section-css-' + section.css.id, url );
};

function preload( sectionName ) {
	switch ( sectionName ) {
		___LOADERS___
	}
}
preloadHub.on( 'preload', preload );

function pathToRegExp( path ) {
	// Prevents root level double dash urls from being validated.
	if ( path === '/' ) {
		return path;
	}

	//TODO: Escape path
	return new RegExp( '^' + path + '(/.*)?$' );
}

function createPageDefinition( path, sectionDefinition ) {
	var pathRegex = pathToRegExp( path );

	page( pathRegex, function( context, next ) {
		var envId = sectionDefinition.envId;
		if ( envId && envId.indexOf( config( "env_id" ) ) === -1 ) {
			return next();
		}
		if ( _loadedSections[ sectionDefinition.module ] ) {
			controller.setSection( sectionDefinition )( context );
			context.store.dispatch( activateNextLayoutFocus() );
			return next();
		}
		if ( config.isEnabled( "restore-last-location" ) && restoreLastSession( context.path ) ) {
			return;
		}
		context.store.dispatch( { type: "SECTION_SET", isLoading: true } );
		preload( sectionDefinition.name ).then( function( requiredModule ) {
			context.store.dispatch( { type: "SECTION_SET", isLoading: false } );
			controller.setSection( sectionDefinition )( context );
			if ( ! _loadedSections[ sectionDefinition.module ] ) {
				requiredModule( controller.clientRouter );
				_loadedSections[ sectionDefinition.module ] = true;
			}
			context.store.dispatch( activateNextLayoutFocus() );
			next();
		},
		function onError( error ) {
			if ( ! LoadingError.isRetry() ) {
				console.warn( error );
				LoadingError.retry( sectionDefinition.name );
			} else {
				console.error( error );
				context.store.dispatch( { type: "SECTION_SET", isLoading: false } );
				LoadingError.show( sectionDefinition.name );
			}
		} );
	} );
}

module.exports = {
	get: function() {
		return sections;
	},
	load: function() {
		sections.forEach( sectionDefinition => {
			sectionDefinition.paths.forEach( path => createPageDefinition( path, sectionDefinition ) );
		} );
	}
};