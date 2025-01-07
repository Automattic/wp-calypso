import page from '@automattic/calypso-router';
import { siteLaunchStatusGroupValues } from '@automattic/sites';
import { Global, css } from '@emotion/react';
import { removeQueryArgs } from '@wordpress/url';
import i18n from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { removeNotice, successNotice } from 'calypso/state/notices/actions';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import SitesDashboard from './components/sites-dashboard';
import { areHostingFeaturesSupported } from './hosting-features/features';
import type { Context, Context as PageJSContext } from '@automattic/calypso-router';

const getStatusFilterValue = ( status?: string ) => {
	return siteLaunchStatusGroupValues.find( ( value ) => value === status );
};

function getQueryParams( context: Context ) {
	return {
		page: context.query.page ? parseInt( context.query.page ) : undefined,
		perPage: context.query[ 'per-page' ] ? parseInt( context.query[ 'per-page' ] ) : undefined,
		search: context.query.search,
		status: context.query.status,
		siteType: context.query.siteType,
	};
}

export function sanitizeQueryParameters( context: PageJSContext, next: () => void ) {
	if ( context.pathname.startsWith( '/p2s' ) ) {
		context.query.siteType = 'p2';
	}
	/**
	 * We need a base case because `page.replace` triggers a re-render for every middleware
	 * in the route.
	 */
	if ( context.query.status === undefined ) {
		return next();
	}

	const status = context.query.status.trim();

	if ( status === '' ) {
		context.page.replace( removeQueryArgs( context.canonicalPath, 'status' ) );
		return;
	}

	const chosenStatus = getStatusFilterValue( status );

	if ( ! chosenStatus ) {
		context.page.replace( removeQueryArgs( context.canonicalPath, 'status' ) );
		return;
	}

	context.query.status = chosenStatus;
	next();
}

export function sitesDashboard( context: Context, next: () => void ) {
	const sitesDashboardGlobalStyles = css`
		body.is-group-sites-dashboard {
			background: var( --studio-gray-0 );

			.layout__content {
				// Add border around everything
				overflow: hidden;
				min-height: 100vh;
				padding: calc( var( --masterbar-height ) + 16px ) 16px 16px
					calc( var( --sidebar-width-max ) );

				@media only screen and ( max-width: 781px ) {
					padding: calc( var( --masterbar-height ) + 24px ) 24px 24px
						calc( var( --sidebar-width-max ) );
				}
			}

			.layout__secondary .global-sidebar {
				border: none;
			}
		}

		body.is-group-sites-dashboard.rtl .layout__content {
			padding: calc( var( --masterbar-height ) + 16px ) calc( var( --sidebar-width-max ) ) 16px 16px;

			@media only screen and ( max-width: 781px ) {
				padding: calc( var( --masterbar-height ) + 24px ) calc( var( --sidebar-width-max ) ) 24px
					24px;
			}
		}

		// Update body margin to account for the sidebar width
		@media only screen and ( min-width: 782px ) {
			div.layout.is-global-sidebar-visible {
				.layout__primary > main {
					background: var( --color-surface );
					border-radius: 8px;
					box-shadow: 0px 0px 17.4px 0px rgba( 0, 0, 0, 0.05 );
					height: calc( 100vh - 32px );
					overflow: auto;
				}
			}
		}

		@media only screen and ( max-width: 781px ) {
			div.layout.is-global-sidebar-visible {
				.layout__primary {
					overflow-x: auto;
				}
			}
		}
	`;

	context.primary = (
		<>
			<Global styles={ sitesDashboardGlobalStyles } />
			<PageViewTracker path="/sites" title="Sites Management Page" delay={ 500 } />
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
			<SitesDashboard queryParams={ getQueryParams( context ) } />
		</>
	);

	// By definition, Sites Dashboard does not select any one specific site
	context.store.dispatch( setAllSitesSelected() );

	next();
}

export function siteDashboard( feature: string | undefined ) {
	return ( context: Context, next: () => void ) => {
		context.primary = (
			<SitesDashboard
				initialSiteFeature={ feature }
				selectedSiteFeaturePreview={ context.primary }
				queryParams={ getQueryParams( context ) }
				isOnlyLayoutView={ context.inSiteContext }
			/>
		);
		next();
	};
}

export function maybeRemoveCheckoutSuccessNotice( context: PageJSContext, next: () => void ) {
	if ( context.query[ 'new-site' ] ) {
		// `?new-site` shows a site creation notice and we don't want to show a double notice,
		// so hide the checkout success notice if it's there.
		context.store.dispatch( removeNotice( 'checkout-thank-you-success' ) );
	}
	next();
}

export function redirectToHostingFeaturesIfNotAtomic( context: PageJSContext, next: () => void ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	if ( ! areHostingFeaturesSupported( site ) ) {
		return page.redirect( `/sites/tools/${ site?.slug }` );
	}

	next();
}

export function showHostingFeaturesNoticeIfPresent( context: PageJSContext, next: () => void ) {
	// Update the url and show the notice after a redirect
	if ( context.query && context.query.hosting_features === 'activated' ) {
		context.store.dispatch(
			successNotice( i18n.translate( 'Hosting features activated successfully!' ), {
				displayOnNextPage: true,
			} )
		);
		// Remove query param without triggering a re-render
		window.history.replaceState(
			null,
			'',
			removeQueryArgs( window.location.href, 'hosting_features' )
		);
	}

	next();
}
