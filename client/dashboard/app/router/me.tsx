import { fetchTwoStep } from '@automattic/api-core';
import {
	userSettingsQuery,
	userPurchasesQuery,
	rawUserPreferencesQuery,
	purchaseQuery,
	sitesQuery,
	queryClient,
	accountRecoveryQuery,
	smsCountryCodesQuery,
	twoStepAuthAppSetupQuery,
	sshKeysQuery,
	connectedApplicationsQuery,
} from '@automattic/api-queries';
import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { getTitleForDisplay } from '../../utils/purchase';
import { rootRoute } from './root';
import type { AppConfig } from '../context';
import type { Purchase } from '@automattic/api-core';
import type { AnyRoute } from '@tanstack/react-router';

export const meRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Account' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'me',
	loader: () => queryClient.ensureQueryData( userSettingsQuery() ),
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
	head: () => ( {
		meta: [
			{
				title: __( 'Profile' ),
			},
		],
	} ),
	getParentRoute: () => meRoute,
	path: 'profile',
} ).lazy( () =>
	import( '../../me/profile' ).then( ( d ) =>
		createLazyRoute( 'profile' )( {
			component: d.default,
		} )
	)
);

const preferencesRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Preferences' ),
			},
		],
	} ),
	getParentRoute: () => meRoute,
	path: 'preferences',
	loader: () => queryClient.ensureQueryData( rawUserPreferencesQuery() ),
} ).lazy( () =>
	import( '../../me/preferences' ).then( ( d ) =>
		createLazyRoute( 'preferences' )( {
			component: d.default,
		} )
	)
);

export const billingRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Billing' ),
			},
		],
	} ),
	getParentRoute: () => meRoute,
	path: 'billing',
} );

export const billingIndexRoute = createRoute( {
	getParentRoute: () => billingRoute,
	path: '/',
} ).lazy( () =>
	import( '../../me/billing' ).then( ( d ) =>
		createLazyRoute( 'billing' )( {
			component: d.default,
		} )
	)
);

export const billingHistoryRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Billing history' ),
			},
		],
	} ),
	getParentRoute: () => billingRoute,
	path: '/billing-history',
} ).lazy( () =>
	import( '../../me/billing-history' ).then( ( d ) =>
		createLazyRoute( 'billing-history' )( {
			component: d.default,
		} )
	)
);

export const purchaseSettingsRoute = createRoute( {
	head: ( { loaderData }: { loaderData?: { purchase: Purchase } } ) => ( {
		meta: [
			{
				title: loaderData && getTitleForDisplay( loaderData.purchase ),
			},
		],
	} ),
	getParentRoute: () => billingRoute,
	loader: async ( { params: { purchaseId } } ) => {
		const purchase = await queryClient.ensureQueryData( purchaseQuery( parseInt( purchaseId ) ) );
		return {
			purchase,
		};
	},
	path: '/purchases/purchase/$purchaseId',
} ).lazy( () =>
	import( '../../me/billing-purchases/purchase-settings' ).then( ( d ) =>
		createLazyRoute( 'purchases-purchase-settings' )( {
			component: d.default,
		} )
	)
);

export const purchasesRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Active upgrades' ),
			},
		],
	} ),
	getParentRoute: () => billingRoute,
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
	path: '/purchases',
} ).lazy( () =>
	import( '../../me/billing-purchases' ).then( ( d ) =>
		createLazyRoute( 'purchases' )( {
			component: d.default,
		} )
	)
);

export const paymentMethodsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Payment methods' ),
			},
		],
	} ),
	getParentRoute: () => billingRoute,
	path: '/payment-methods',
} ).lazy( () =>
	import( '../../me/billing-payment-methods' ).then( ( d ) =>
		createLazyRoute( 'payment-methods' )( {
			component: d.default,
		} )
	)
);

export const taxDetailsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Tax details' ),
			},
		],
	} ),
	getParentRoute: () => billingRoute,
	path: '/tax-details',
} ).lazy( () =>
	import( '../../me/tax-details' ).then( ( d ) =>
		createLazyRoute( 'tax-details' )( {
			component: d.default,
		} )
	)
);

export const securityRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Security' ),
			},
		],
	} ),
	getParentRoute: () => meRoute,
	path: 'security',
} );

export const securityIndexRoute = createRoute( {
	getParentRoute: () => securityRoute,
	path: '/',
} ).lazy( () =>
	import( '../../me/security' ).then( ( d ) =>
		createLazyRoute( 'security' )( {
			component: d.default,
		} )
	)
);

export const securityPasswordRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Password' ),
			},
		],
	} ),
	getParentRoute: () => securityRoute,
	path: '/password',
} ).lazy( () =>
	import( '../../me/security-password' ).then( ( d ) =>
		createLazyRoute( 'security-password' )( {
			component: d.default,
		} )
	)
);

export const securityAccountRecoveryRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Account recovery' ),
			},
		],
	} ),
	getParentRoute: () => securityRoute,
	path: '/account-recovery',
	loader: async () => {
		await Promise.all( [
			queryClient.ensureQueryData( accountRecoveryQuery() ),
			queryClient.ensureQueryData( smsCountryCodesQuery() ),
		] );
	},
} ).lazy( () =>
	import( '../../me/security-account-recovery' ).then( ( d ) =>
		createLazyRoute( 'security-account-recovery' )( {
			component: d.default,
		} )
	)
);

export const securityTwoStepAuthRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Two-step authentication' ),
			},
		],
	} ),
	getParentRoute: () => securityRoute,
	path: '/two-step-auth',
	loader: async () => {
		await Promise.all( [
			queryClient.ensureQueryData( userSettingsQuery() ),
			queryClient.ensureQueryData( smsCountryCodesQuery() ),
		] );
	},
} ).lazy( () =>
	import( '../../me/security-two-step-auth' ).then( ( d ) =>
		createLazyRoute( 'security-two-step-auth' )( {
			component: d.default,
		} )
	)
);

export const securityTwoStepAuthAppRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Set up two-step authentication' ),
			},
		],
	} ),
	getParentRoute: () => securityRoute,
	path: '/two-step-auth/app',
	loader: async () => {
		await Promise.all( [
			queryClient.ensureQueryData( userSettingsQuery() ),
			queryClient.ensureQueryData( twoStepAuthAppSetupQuery() ),
		] );
	},
} ).lazy( () =>
	import( '../../me/security-two-step-auth-app' ).then( ( d ) =>
		createLazyRoute( 'security-two-step-auth-app' )( {
			component: d.default,
		} )
	)
);

export const securityTwoStepAuthSMSRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Set up two-step authentication' ),
			},
		],
	} ),
	getParentRoute: () => securityRoute,
	path: '/two-step-auth/sms',
	loader: async () => {
		await Promise.all( [
			queryClient.ensureQueryData( userSettingsQuery() ),
			queryClient.ensureQueryData( smsCountryCodesQuery() ),
		] );
	},
} ).lazy( () =>
	import( '../../me/security-two-step-auth-sms' ).then( ( d ) =>
		createLazyRoute( 'security-two-step-auth-sms' )( {
			component: d.default,
		} )
	)
);

export const securityTwoStepAuthBackupCodesRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Backup codes' ),
			},
		],
	} ),
	getParentRoute: () => securityRoute,
	path: '/two-step-auth/backup-codes',
	loader: () => queryClient.ensureQueryData( userSettingsQuery() ),
} ).lazy( () =>
	import( '../../me/security-two-step-auth-backup-codes' ).then( ( d ) =>
		createLazyRoute( 'security-two-step-auth-backup-codes' )( {
			component: d.default,
		} )
	)
);

export const securitySshKeyRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'SSH key' ),
			},
		],
	} ),
	getParentRoute: () => securityRoute,
	loader: async () => {
		await Promise.all( [
			queryClient.ensureQueryData( sshKeysQuery() ),
			queryClient.ensureQueryData( userSettingsQuery() ),
		] );
	},
	path: '/ssh-key',
} ).lazy( () =>
	import( '../../me/security-ssh-key' ).then( ( d ) =>
		createLazyRoute( 'security-ssh-key' )( {
			component: d.default,
		} )
	)
);

export const securityConnectedAppsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Connected applications' ),
			},
		],
	} ),
	getParentRoute: () => securityRoute,
	path: '/connected-apps',
	loader: () => queryClient.ensureQueryData( connectedApplicationsQuery() ),
} ).lazy( () =>
	import( '../../me/security-connected-apps' ).then( ( d ) =>
		createLazyRoute( 'security-connected-apps' )( {
			component: d.default,
		} )
	)
);

export const securitySocialLoginsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Social logins' ),
			},
		],
	} ),
	getParentRoute: () => securityRoute,
	path: '/social-logins',
} ).lazy( () =>
	import( '../../me/security-social-logins' ).then( ( d ) =>
		createLazyRoute( 'security-social-logins' )( {
			component: d.default,
		} )
	)
);

export const privacyRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Privacy' ),
			},
		],
	} ),
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
	head: () => ( {
		meta: [
			{
				title: __( 'Notifications' ),
			},
		],
	} ),
	getParentRoute: () => meRoute,
	path: 'notifications',
} );

export const notificationsIndexRoute = createRoute( {
	getParentRoute: () => notificationsRoute,
	path: '/',
} ).lazy( () =>
	import( '../../me/notifications' ).then( ( d ) =>
		createLazyRoute( 'notifications' )( {
			component: d.default,
		} )
	)
);

export const notificationsSitesRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Sites' ),
			},
		],
	} ),
	getParentRoute: () => notificationsRoute,
	path: '/sites',
} ).lazy( () =>
	import( '../../me/notifications-sites' ).then( ( d ) =>
		createLazyRoute( 'notifications-sites' )( {
			component: d.default,
		} )
	)
);

export const notificationsEmailsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Emails' ),
			},
		],
	} ),
	getParentRoute: () => notificationsRoute,
	path: '/emails',
} ).lazy( () =>
	import( '../../me/notifications-emails' ).then( ( d ) =>
		createLazyRoute( 'notifications-emails' )( {
			component: d.default,
		} )
	)
);

export const notificationsCommentsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Comments' ),
			},
		],
	} ),
	getParentRoute: () => notificationsRoute,
	path: '/comments',
} ).lazy( () =>
	import( '../../me/notifications-comments' ).then( ( d ) =>
		createLazyRoute( 'notifications-comments' )( {
			component: d.default,
		} )
	)
);

export const notificationsExtrasRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Extras' ),
			},
		],
	} ),
	getParentRoute: () => notificationsRoute,
	path: '/extras',
} ).lazy( () =>
	import( '../../me/notifications-extras' ).then( ( d ) =>
		createLazyRoute( 'notifications-extras' )( {
			component: d.default,
		} )
	)
);

export const blockedSitesRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Blocked sites' ),
			},
		],
	} ),
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
	head: () => ( {
		meta: [
			{
				title: __( 'Apps' ),
			},
		],
	} ),
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

	const meRoutes: AnyRoute[] = [ profileRoute, preferencesRoute ];

	meRoutes.push(
		billingRoute.addChildren( [
			billingIndexRoute,
			billingHistoryRoute,
			purchasesRoute,
			purchaseSettingsRoute,
			paymentMethodsRoute,
			taxDetailsRoute,
		] )
	);

	meRoutes.push(
		securityRoute.addChildren( [
			securityIndexRoute,
			securityPasswordRoute,
			securityAccountRecoveryRoute,
			securityTwoStepAuthRoute,
			securityTwoStepAuthAppRoute,
			securityTwoStepAuthSMSRoute,
			securityTwoStepAuthBackupCodesRoute,
			securitySshKeyRoute,
			securityConnectedAppsRoute,
			securitySocialLoginsRoute,
		] )
	);

	meRoutes.push(
		notificationsRoute.addChildren( [
			notificationsIndexRoute,
			notificationsSitesRoute,
			notificationsEmailsRoute,
			notificationsCommentsRoute,
			notificationsExtrasRoute,
		] )
	);

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
