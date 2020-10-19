/**
 * External dependencies
 */
import config from 'config';
import page from 'page';

/**
 * Internal dependencies
 */
import { setSection, setSectionLoading } from 'state/ui/actions';
import { activateNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { bumpStat } from 'state/analytics/actions';
import * as LoadingError from 'layout/error';
import * as controller from './controller/index.web';
import { pathToRegExp } from './utils';
import { receiveSections, load } from './sections-helper';
import isSectionEnabled from './sections-filter';
import { addReducerToStore } from 'state/add-reducer';
import { performanceTrackerStart } from 'lib/performance-tracking';

import sections from './sections';
receiveSections( sections );

function activateSection( section, context ) {
	context.section = section;
	context.store.dispatch( setSection( section ) );
	context.store.dispatch( activateNextLayoutFocus() );
}

async function loadSection( context, sectionDefinition ) {
	context.store.dispatch( setSectionLoading( true ) );

	// If the section chunk is not loaded within 400ms, report it to analytics
	const loadReportTimeout = setTimeout( () => {
		context.store.dispatch( bumpStat( 'calypso_chunk_waiting', sectionDefinition.name ) );
	}, 400 );

	try {
		// load the section module, i.e., its webpack chunk
		const requiredModule = await load( sectionDefinition.name, sectionDefinition.module );
		// call the module initialization function (possibly async, registers page.js handlers etc.)
		await requiredModule.default( controller.clientRouter, addReducerToStore( context.store ) );
	} finally {
		context.store.dispatch( setSectionLoading( false ) );

		// If the load was faster than the timeout, this will cancel the analytics reporting
		clearTimeout( loadReportTimeout );
	}
}

/**
 * Cache of already loaded or loading section modules. Every section module is in one of
 * three states regarding the cache:
 * - no record in the cache: not loaded or not currently loading
 * - record value is `true`: already loaded and initialized
 * - record value is a `Promise`: is currently loading, the promise will fulfill when done.
 *   Don't start a second load with `loadSection` but rather wait for the existing promise.
 */
const _loadedSections = {};

function createPageDefinition( path, sectionDefinition ) {
	// skip this section if it's not enabled in current environment
	const { envId } = sectionDefinition;
	if ( envId && ! envId.includes( config( 'env_id' ) ) ) {
		return;
	}

	const pathRegex = pathToRegExp( path );

	// if the section doesn't support logged-out views, redirect to login if user is not logged in
	if ( ! sectionDefinition.enableLoggedOut ) {
		page( pathRegex, controller.redirectLoggedOut );
	}

	// Install navigation performance tracking.
	if ( sectionDefinition.trackLoadPerformance ) {
		page( pathRegex, performanceTrackerStart( sectionDefinition.name ) );
	}

	page( pathRegex, async function ( context, next ) {
		try {
			const loadedSection = _loadedSections[ sectionDefinition.module ];
			if ( loadedSection ) {
				// wait for the promise if loading, do nothing when already loaded
				if ( loadedSection !== true ) {
					await loadedSection;
				}
			} else {
				// start loading the section and record the `Promise` in a map
				const loadingSection = loadSection( context, sectionDefinition );
				_loadedSections[ sectionDefinition.module ] = loadingSection;

				// wait until the section module is loaded and the set the map record to `true`
				await loadingSection;
				_loadedSections[ sectionDefinition.module ] = true;
			}

			// activate the section after ensuring it's fully loaded
			activateSection( sectionDefinition, context );
			next();
		} catch ( error ) {
			// delete the cache record on failure; next attempt to load will start from scratch
			delete _loadedSections[ sectionDefinition.module ];

			console.error( error ); // eslint-disable-line
			if ( ! LoadingError.isRetry() && process.env.NODE_ENV !== 'development' ) {
				LoadingError.retry( sectionDefinition.name );
			} else {
				LoadingError.show( context, sectionDefinition.name );
			}
		}
	} );
}

export const setupRoutes = () => {
	for ( const section of sections ) {
		if ( ! isSectionEnabled( section ) ) {
			continue;
		}

		for ( const path of section.paths ) {
			createPageDefinition( path, section );
		}
	}
};
