/** @format */
/**
 * External dependencies
 */
import config from 'config';
import page from 'page';
import { find, filter, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { activateNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { bumpStat } from 'state/analytics/actions';
import * as LoadingError from 'layout/error';
import * as controller from './controller/index.web';
import { restoreLastSession } from 'lib/restore-last-path';
import { hub as preloadHub } from 'sections-preload';
import { switchCSS } from 'lib/i18n-utils/switch-locale';
import { pathToRegExp } from './utils';

import sections from './sections';

const _loadedSections = {};

function maybeLoadCSS( sectionName ) {
	//eslint-disable-line no-unused-vars
	const section = find( sections, { name: sectionName } );

	if ( ! ( section && section.css ) ) {
		return;
	}

	const url =
		typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
			? section.css.urls.rtl
			: section.css.urls.ltr;

	switchCSS( 'section-css-' + section.css.id, url );
}

function preload( sectionName ) {
	maybeLoadCSS( sectionName );
	const filteredSections = filter( sections, { name: sectionName } );
	if ( isEmpty( filteredSections ) ) {
		return Promise.reject( `Attempting to load non-existent section: ${ sectionName }` );
	}
	return Promise.all( filteredSections.map( section => section.load() ) );
}

preloadHub.on( 'preload', preload );

function activateSection( sectionDefinition, context, next ) {
	const dispatch = context.store.dispatch;

	controller.setSection( sectionDefinition )( context );
	dispatch( { type: 'SECTION_SET', isLoading: false } );
	dispatch( activateNextLayoutFocus() );
	next();
}

function createPageDefinition( path, sectionDefinition ) {
	const pathRegex = pathToRegExp( path );

	page( pathRegex, function( context, next ) {
		const envId = sectionDefinition.envId;
		const dispatch = context.store.dispatch;

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

		// If the section chunk is not loaded within 400ms, report it to analytics
		const loadReportTimeout = setTimeout(
			() => dispatch( bumpStat( 'calypso_chunk_waiting', sectionDefinition.name ) ),
			400
		);

		preload( sectionDefinition.name )
			.then( requiredModules => {
				if ( ! _loadedSections[ sectionDefinition.module ] ) {
					requiredModules.forEach( mod => mod.default( controller.clientRouter ) );
					_loadedSections[ sectionDefinition.module ] = true;
				}
				return activateSection( sectionDefinition, context, next );
			} )
			.catch( error => {
				console.error( error ); // eslint-disable-line
				if ( ! LoadingError.isRetry() && process.env.NODE_ENV !== 'development' ) {
					LoadingError.retry( sectionDefinition.name );
				} else {
					dispatch( { type: 'SECTION_SET', isLoading: false } );
					LoadingError.show( context, sectionDefinition.name );
				}
			} )
			.then( () => {
				// If the load was faster than the timeout, this will cancel the analytics reporting
				clearTimeout( loadReportTimeout );
			} );
	} );
}

export const getSections = () => sections;

export const setupRoutes = () => {
	sections.forEach( section =>
		section.paths.forEach( path => createPageDefinition( path, section ) )
	);
};
