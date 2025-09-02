import { fetchTwoStep } from '@automattic/api-core';
import {
	profileQuery,
	userPurchasesQuery,
	purchaseQuery,
	sitesQuery,
	queryClient,
} from '@automattic/api-queries';
import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import type { AppConfig } from '../context';
import type { AnyRoute } from '@tanstack/react-router';

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

export const purchaseSettingsRoute = createRoute( {
	getParentRoute: () => meRoute,
	loader: async ( { params: { purchaseId } } ) => {
		await queryClient.ensureQueryData( purchaseQuery( parseInt( purchaseId ) ) );
	},
	path: 'billing/purchases/purchase/$purchaseId',
} ).lazy( () =>
	import( '../../me/billing-purchases/purchase-settings' ).then( ( d ) =>
		createLazyRoute( 'purchases-purchase-settings' )( {
			component: d.default,
		} )
	)
);

export const purchasesRoute = createRoute( {
	getParentRoute: () => meRoute,
	loader: async () => {
		await Promise.all( [
			queryClient.ensureQueryData( userPurchasesQuery() ),
			queryClient.ensureQueryData( sitesQuery() ),
		] );
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

export const securityPasswordRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'security/password',
} ).lazy( () =>
	import( '../../me/security-password' ).then( ( d ) =>
		createLazyRoute( 'security-password' )( {
			component: d.default,
		} )
	)
);

export const securityAccountRecoveryRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'security/account-recovery',
} ).lazy( () =>
	import( '../../me/security-account-recovery' ).then( ( d ) =>
		createLazyRoute( 'security-account-recovery' )( {
			component: d.default,
		} )
	)
);

export const securityTwoStepAuthRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'security/two-step-auth',
} ).lazy( () =>
	import( '../../me/security-two-step-auth' ).then( ( d ) =>
		createLazyRoute( 'security-two-step-auth' )( {
			component: d.default,
		} )
	)
);

export const securitySshKeyRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'security/ssh-key',
} ).lazy( () =>
	import( '../../me/security-ssh-key' ).then( ( d ) =>
		createLazyRoute( 'security-ssh-key' )( {
			component: d.default,
		} )
	)
);

export const securityConnectedAppsRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'security/connected-apps',
} ).lazy( () =>
	import( '../../me/security-connected-apps' ).then( ( d ) =>
		createLazyRoute( 'security-connected-apps' )( {
			component: d.default,
		} )
	)
);

export const securitySocialLoginsRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'security/social-logins',
} ).lazy( () =>
	import( '../../me/security-social-logins' ).then( ( d ) =>
		createLazyRoute( 'security-social-logins' )( {
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

export const notificationsSitesRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'notifications/sites',
} ).lazy( () =>
	import( '../../me/notifications-sites' ).then( ( d ) =>
		createLazyRoute( 'notifications-sites' )( {
			component: d.default,
		} )
	)
);

export const notificationsEmailsRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'notifications/emails',
} ).lazy( () =>
	import( '../../me/notifications-emails' ).then( ( d ) =>
		createLazyRoute( 'notifications-emails' )( {
			component: d.default,
		} )
	)
);

export const notificationsCommentsRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'notifications/comments',
} ).lazy( () =>
	import( '../../me/notifications-comments' ).then( ( d ) =>
		createLazyRoute( 'notifications-comments' )( {
			component: d.default,
		} )
	)
);

export const notificationsExtrasRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'notifications/extras',
} ).lazy( () =>
	import( '../../me/notifications-extras' ).then( ( d ) =>
		createLazyRoute( 'notifications-extras' )( {
			component: d.default,
		} )
	)
);

export const blockedSitesRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'blocked-sites',
} ).lazy( () =>
	import( '../../me/blocked-sites' ).then( ( d ) =>
		createLazyRoute( 'blocked-sites' )( {
			component: d.default,
		} )
	)
);

export const appsRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: 'apps',
} ).lazy( () =>
	import( '../../me/apps' ).then( ( d ) =>
		createLazyRoute( 'apps' )( {
			component: d.default,
		} )
	)
);

export const createMeRoutes = ( config: AppConfig ) => {
	if ( ! config.supports.me ) {
		return [];
	}

	const meRoutes: AnyRoute[] = [
		profileRoute,
		billingRoute,
		billingHistoryRoute,
		purchasesRoute,
		purchaseSettingsRoute,
		paymentMethodsRoute,
		taxDetailsRoute,
		securityRoute,
		securityPasswordRoute,
		securityAccountRecoveryRoute,
		securityTwoStepAuthRoute,
		securitySshKeyRoute,
		securityConnectedAppsRoute,
		securitySocialLoginsRoute,
		notificationsRoute,
		notificationsSitesRoute,
		notificationsEmailsRoute,
		notificationsCommentsRoute,
		notificationsExtrasRoute,
	];

	if ( config.supports.me.privacy ) {
		meRoutes.push( privacyRoute );
	}

	if ( config.supports.reader ) {
		meRoutes.push( blockedSitesRoute );
	}

	if ( config.supports.me.apps ) {
		meRoutes.push( appsRoute );
	}

	return [ meRoute.addChildren( meRoutes ) ];
};
