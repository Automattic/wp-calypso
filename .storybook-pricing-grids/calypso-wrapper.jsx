import { ShoppingCartProvider, getEmptyResponseCart } from '@automattic/shopping-cart';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { setScenario } from './mock-wpcom-proxy-request';

export const SITE_ID = 1234;
export const SITE_SLUG = 'example.wordpress.com';

const emptyCart = { ...getEmptyResponseCart(), cart_key: SITE_ID, currency: 'USD' };

const cartManagerClient = {
	getCart: async () => emptyCart,
	setCart: async () => emptyCart,
};

/**
 * Builds the Redux state for a scenario: a logged-in owner and, for in-app stories,
 * one selected site on the given plan.
 */
function initialState( { siteId, currentPlanSlug, currentPlanProductId, siteOptions } ) {
	const state = {
		currentUser: {
			id: 1,
			user: {
				ID: 1,
				username: 'storybook',
				display_name: 'Storybook',
				localeSlug: 'en',
				primary_blog: siteId ?? null,
				site_count: siteId ? 1 : 0,
				visible_site_count: siteId ? 1 : 0,
			},
			capabilities: siteId ? { [ siteId ]: { manage_options: true, edit_posts: true } } : {},
			flags: [],
		},
	};

	if ( siteId ) {
		state.sites = {
			items: {
				[ siteId ]: {
					ID: siteId,
					slug: SITE_SLUG,
					URL: `https://${ SITE_SLUG }`,
					name: 'Example Site',
					jetpack: false,
					is_wpcom_atomic: false,
					capabilities: { manage_options: true },
					plan: { product_id: currentPlanProductId, product_slug: currentPlanSlug },
					options: {
						created_at: '2025-01-01T00:00:00+00:00',
						is_domain_only: false,
						...siteOptions,
					},
				},
			},
		};
	}

	return state;
}

/**
 * Renders a story inside a fresh Calypso store, query client and empty shopping cart.
 * Each story gets its own instances so scenarios don't leak into each other.
 */
export function CalypsoWrapper( { scenario = {}, children } ) {
	const { store, queryClient } = useMemo( () => {
		setScenario( scenario );
		const newStore = createReduxStore( initialState( scenario ) );
		setStore( newStore );
		// `ui` is registered lazily, so state passed to createReduxStore() would be dropped.
		if ( scenario.siteId ) {
			newStore.dispatch( setSelectedSiteId( scenario.siteId ) );
		}
		window.__pgStore = newStore;
		return {
			store: newStore,
			queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ),
		};
		// The scenario is fixed per story.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<ShoppingCartProvider managerClient={ cartManagerClient }>
					{ children }
				</ShoppingCartProvider>
			</QueryClientProvider>
		</ReduxProvider>
	);
}
