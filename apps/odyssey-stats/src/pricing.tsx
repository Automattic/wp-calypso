/**
 * Entry point for the Stats pricing screen a site sees before it is connected.
 *
 * Kept separate from `app.tsx` because there is no blog ID and no WordPress.com token
 * yet, and the dashboard's store, routing and site-data boot all assume both. Prices come
 * straight from the public API for the same reason: the wp-admin proxy the dashboard reads
 * through needs a blog token this site does not have.
 */

// `init-pricing-config` has to be the first import, because there could be packages that
// reference it in their side effects.
// eslint-disable-next-line import/order
import './lib/init-pricing-config';
// The section stylesheets must be evaluated before the pricing grid's own, so that the
// grid's container padding outranks the `.stats > *` centring rule. The dashboard gets
// this ordering for free because it loads the grid as an async chunk.
/* eslint-disable import/order */
import 'calypso/assets/stylesheets/style.scss';
import 'calypso/my-sites/stats/style.scss';
import './app.scss';
/* eslint-enable import/order */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { createStore, applyMiddleware, compose, Store, Middleware } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import PricingGrid from 'calypso/my-sites/stats/pricing-grid/pricing-grid';
import { WithAddReducer } from 'calypso/state/add-reducer';
import currentUser from 'calypso/state/current-user/reducer';
import documentHead from 'calypso/state/document-head/reducer';
import notices from 'calypso/state/notices/reducer';
import { receiveProductsList } from 'calypso/state/products-list/actions';
import productsList from 'calypso/state/products-list/reducer';
import purchases from 'calypso/state/purchases/reducer';
import sites from 'calypso/state/sites/reducer';
import ui from 'calypso/state/ui/reducer';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';
import Layout from './components/layout';
import PricingPurchase from './components/pricing-purchase';
import config from './lib/config-api';
import loadWpComponentsStyle from './lib/load-wp-components-style';
import setLocale from './lib/set-locale';

const MOUNT_ID = 'jp-stats-pricing';
const PRODUCTS_ENDPOINT = 'https://public-api.wordpress.com/rest/v1.1/products?type=jetpack';

/**
 * Tell the site the visitor has picked a plan, so the dashboard does not open with its own
 * pricing grid and ask the same question once the site connects.
 *
 * Sent with `sendBeacon` because every caller navigates away in the same tick — a normal
 * request would be cancelled in flight, losing the choice at the exact moment it is made.
 * Recorded on the site rather than on WordPress.com: there is no blog ID to key it against
 * until the connection exists.
 */
function recordPlanChoice() {
	const url = `${ config( 'api_root' ) }jetpack/v4/stats-app/pricing-choice?_wpnonce=${ config(
		'nonce'
	) }`;

	navigator.sendBeacon?.( url );
}

/**
 * The visitor has not chosen yet, so the screen owns which of the two views is showing.
 * A router would buy nothing here: neither view is linkable from outside wp-admin.
 */
function PricingApp() {
	const [ view, setView ] = useState< 'grid' | 'purchase' >( 'grid' );

	// "Start for free" and "I will do it later" both mean the same thing before a connection
	// exists: take the free plan, which needs the site linked to WordPress.com first.
	const goToConnection = () => {
		recordPlanChoice();
		window.location.href = config( 'connect_url' );
	};

	if ( view === 'purchase' ) {
		return <PricingPurchase onPostpone={ goToConnection } onBeforeCheckout={ recordPlanChoice } />;
	}

	return (
		<PricingGrid onSelectFree={ goToConnection } onSelectPaid={ () => setView( 'purchase' ) } />
	);
}

/**
 * Fill the products store from the public API.
 *
 * Unauthenticated on purpose: the product catalogue is public, and the site has no token
 * to sign a request with. A failure is not fatal — the grid renders without the price and
 * both calls to action still work.
 */
async function loadProducts( store: Store ) {
	try {
		const response = await globalThis.fetch( PRODUCTS_ENDPOINT );

		if ( ! response.ok ) {
			return;
		}

		store.dispatch( receiveProductsList( await response.json(), 'jetpack' ) );
	} catch {
		// Leaves the price block out; see above.
	}
}

async function AppBoot() {
	const root = document.getElementById( MOUNT_ID );

	if ( ! root ) {
		return;
	}

	// Awaited before anything renders so components are never painted unstyled on the WP
	// versions that need it. Resolves immediately without a request on WP 7.0+.
	await loadWpComponentsStyle();

	const localeSlug = config( 'i18n_locale_slug' ) || config( 'i18n_default_locale_slug' ) || 'en';

	const store = createStore(
		combineReducers( {
			currentUser,
			documentHead,
			notices,
			productsList,
			purchases,
			sites,
			ui,
		} ),
		compose( addReducerEnhancer, applyMiddleware( thunkMiddleware as Middleware ) )
	) as Store & WithAddReducer;

	await Promise.all( [ loadProducts( store ), setLocale( localeSlug, false ) ] );

	createRoot( root ).render(
		<CalypsoI18nProvider>
			<QueryClientProvider client={ new QueryClient() }>
				<ReduxProvider store={ store }>
					<Layout
						primary={ <PricingApp /> }
						secondary={ null }
						sectionName="stats"
						sectionGroup="sites"
					/>
				</ReduxProvider>
			</QueryClientProvider>
		</CalypsoI18nProvider>
	);
}

AppBoot();
