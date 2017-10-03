var config = require( 'config' ),
	page = require( 'page' ),
	activateNextLayoutFocus = require( 'state/ui/layout-focus/actions' ).activateNextLayoutFocus,
	LoadingError = require( 'layout/error' ),
	controller = require( 'controller' ),
	restoreLastSession = require( 'lib/restore-last-path' ).restoreLastSession,
	preloadHub = require( 'sections-preload' ).hub;

var sections = ___DEFINITION___;
var _loadedSections = {};

function preload( sectionName ) {
	console.log( sectionName );

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
	const pathRegex = pathToRegExp( path );

	page( pathRegex, function( context, next ) {
		const envId = sectionDefinition.envId;

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

		preload( sectionDefinition.name ).then( module => {
			context.store.dispatch( { type: "SECTION_SET", isLoading: false } );
			controller.setSection( sectionDefinition )( context );

			if ( ! _loadedSections[ sectionDefinition.module ] ) {
				module( controller.clientRouter );
				_loadedSections[ sectionDefinition.module ] = true;
			}

			context.store.dispatch( activateNextLayoutFocus() );

			next();
		}, error => {
			if ( ! LoadingError.isRetry() ) {
				LoadingError.retry( sectionDefinition.name );
			} else {
				console.error( error );
				context.store.dispatch( { type: "SECTION_SET", isLoading: false } );
				LoadingError.show( sectionDefinition.name );
			}

			return Promise.reject( error );
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
