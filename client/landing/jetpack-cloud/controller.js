/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal Dependencies
 */
import { getSiteFragment } from 'lib/route';
import { isJetpackSite } from 'state/sites/selectors';
import { requestSite } from 'state/sites/actions';
import { setSelectedSiteId } from 'state/ui/actions';
import getSiteId from 'state/selectors/get-site-id';
import isAtomicSite from 'state/selectors/is-site-wpcom-atomic';
import JetpackCloudLayout from './layout';
import JetpackCloudSidebar from './components/sidebar';

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

	const siteId = await ( async () => {
		const firstTrySiteId = getSiteId( getState(), siteFragment );
		if ( firstTrySiteId ) {
			return firstTrySiteId;
		}

		return dispatch( requestSite( siteFragment ) ).then( () => {
			const secondTrySiteId = getSiteId( getState(), siteFragment );
			if ( secondTrySiteId ) {
				return secondTrySiteId;
			}
		} );
	} )();

	if ( siteId ) {
		const isJetpack = isJetpackSite( getState(), siteId );
		const isAtomic = isAtomicSite( getState(), siteId );

		if ( ! isJetpack || isAtomic ) {
			// TODO: redirect to not-a-jetpack site page
			next();
		}

		await dispatch( setSelectedSiteId( siteId ) );
	}

	next();
}
