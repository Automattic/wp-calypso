/**
 * External dependencies
 */
import { Provider as ReduxProvider } from 'react-redux';
import page from 'page';
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal Dependencies
 */

import { getSiteFragment, sectionify } from 'lib/route';
import { requestSites } from 'state/sites/actions';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { setSelectedSiteId } from 'state/ui/actions';
import getSites from 'state/selectors/get-sites';
import hasLoadedSites from 'state/selectors/has-loaded-sites';
import JetpackCloudLayout from './layout';
import JetpackCloudSidebar from './components/sidebar';
import SitesComponent from 'my-sites/sites';

export const makeLayout = ( context, next ) => {
	const { primary, secondary, store } = context;

	context.layout = (
		<ReduxProvider store={ store }>
			<JetpackCloudLayout primary={ primary } secondary={ secondary } />
		</ReduxProvider>
	);

	next();
};

export const clientRender = context => {
	ReactDom.render( context.layout, document.getElementById( 'wpcom' ) );
};

export function setupSidebar( context, next ) {
	context.secondary = <JetpackCloudSidebar path={ context.path } />;
	next();
}

export async function siteSelection( context, next ) {
	const getState = () => context.store.getState();
	const dispatch = action => context.store.dispatch( action );

	const siteFragment = context.params.site || getSiteFragment( context.path );

	// 1. request all sites ( or get them if they already are present)
	const allSites = await ( async () => {
		if ( hasLoadedSites( getState() ) ) {
			return getSites( getState() );
		}

		return dispatch( requestSites() ).then( () => {
			return getSites( getState() );
		} );
	} )();

	// 2. filter to our preferred list ( non-atomic, jetpack )
	const eligibleSites = allSites.filter(
		site => site.jetpack && ! site.options.is_automated_transfer
	);

	// 3. use that list to determine the correct way to render ( 0, 1, or a list )
	if ( eligibleSites.length === 1 && ! siteFragment ) {
		const { name } = eligibleSites[ 0 ];

		let redirectPath = `${ context.pathname }/${ name }`;
		if ( context.querystring ) {
			redirectPath += `?${ context.querystring }`;
		}
		page.redirect( redirectPath );
	} else if ( eligibleSites.length > 0 ) {
		// figure out if the siteFragment matched one of the eligible sites

		for ( const { ID, name } of eligibleSites ) {
			if ( siteFragment === ID || siteFragment === name ) {
				dispatch( setSelectedSiteId( ID ) );
				next();
			}
		}
	} else {
		// zero sites, or no matching site above
	}
}

/**
 * Returns the site-picker react element.
 *  * extended from my-sites/controller to only allow non-atomic jetpack sites
 *
 * @param {object} context -- Middleware context
 * @returns {object} A site-picker React element
 */
function createSitesComponent( context ) {
	const contextPath = sectionify( context.path );

	return (
		<SitesComponent
			siteBasePath={ contextPath }
			getSiteSelectionHeaderText={ context.getSiteSelectionHeaderText }
			fromSite={ context.query.site }
		/>
	);
}

/**
 * Middleware that adds the site selector screen to the layout.
 * extended from my-sites/controller to only allow non-atomic jetpack sites
 *
 * @param {object} context -- Middleware context
 * @param {Function} next -- Call next middleware in chain
 */
export function sites( context, next ) {
	context.store.dispatch( setLayoutFocus( 'content' ) );
	// removeSidebar( context );
	context.primary = createSitesComponent( context );
	next();
}
