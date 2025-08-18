import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { fetchTwoStep } from '../../data/me';
import { profileQuery } from '../queries/me-profile';
import { userPurchasesQuery } from '../queries/me-purchases';
import { sitesQuery } from '../queries/sites';
import { queryClient } from '../query-client';
import { rootRoute } from './root';

export const meRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'me',
	loader: () => queryClient.ensureQueryData( profileQuery() ),
	beforeLoad: async ( { cause } ) => {
		if ( cause !== 'enter' ) {
			return;
		}
		const twoStep = await fetchTwoStep();
		if ( twoStep.two_step_reauthorization_required ) {
			const currentPath = window.location.pathname;
			const loginUrl = `/me/reauth-required?redirect_to=${ encodeURIComponent( currentPath ) }`;
			window.location.href = loginUrl;
		}
	},
} ).lazy( () =>
	import( '../../me' ).then( ( d ) =>
		createLazyRoute( 'me' )( {
			component: d.default,
		} )
	)
);

export const profileRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'profile',
} ).lazy( () =>
	import( '../../me/profile' ).then( ( d ) =>
		createLazyRoute( 'profile' )( {
			component: d.default,
		} )
	)
);

export const billingRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'billing',
} ).lazy( () =>
	import( '../../me/billing' ).then( ( d ) =>
		createLazyRoute( 'billing' )( {
			component: d.default,
		} )
	)
);

export const billingHistoryRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'billing/billing-history',
} ).lazy( () =>
	import( '../../me/billing-history' ).then( ( d ) =>
		createLazyRoute( 'billing-history' )( {
			component: d.default,
		} )
	)
);

export const purchasesRoute = createRoute( {
	getParentRoute: () => meRoute,
	loader: async () => {
		queryClient.ensureQueryData( userPurchasesQuery() );
		queryClient.ensureQueryData( sitesQuery() );
	},
	validateSearch: ( search ): { site: string | undefined } => {
		return {
			site: typeof search.site === 'string' ? search.site : undefined,
		};
	},
	path: 'billing/purchases',
} ).lazy( () =>
	import( '../../me/billing-purchases' ).then( ( d ) =>
		createLazyRoute( 'purchases' )( {
			component: d.default,
		} )
	)
);

export const paymentMethodsRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'billing/payment-methods',
} ).lazy( () =>
	import( '../../me/payment-methods' ).then( ( d ) =>
		createLazyRoute( 'payment-methods' )( {
			component: d.default,
		} )
	)
);

export const taxDetailsRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'billing/tax-details',
} ).lazy( () =>
	import( '../../me/tax-details' ).then( ( d ) =>
		createLazyRoute( 'tax-details' )( {
			component: d.default,
		} )
	)
);

export const securityRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'security',
} ).lazy( () =>
	import( '../../me/security' ).then( ( d ) =>
		createLazyRoute( 'security' )( {
			component: d.default,
		} )
	)
);

export const privacyRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'privacy',
} ).lazy( () =>
	import( '../../me/privacy' ).then( ( d ) =>
		createLazyRoute( 'privacy' )( {
			component: d.default,
		} )
	)
);

export const notificationsRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'notifications',
} ).lazy( () =>
	import( '../../me/notifications' ).then( ( d ) =>
		createLazyRoute( 'notifications' )( {
			component: d.default,
		} )
	)
);

export const createMeRoutes = () => {
	return [
		meRoute.addChildren( [
			profileRoute,
			billingRoute,
			billingHistoryRoute,
			purchasesRoute,
			paymentMethodsRoute,
			taxDetailsRoute,
			securityRoute,
			privacyRoute,
			notificationsRoute,
		] ),
	];
};
