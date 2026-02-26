import { fetchTwoStep } from '@automattic/api-core';
import {
	accountRecoveryQuery,
	allowedPaymentMethodsQuery,
	allSitesQuery,
	connectedApplicationsQuery,
	countryListQuery,
	geoLocationQuery,
	isAutomatticianQuery,
	monetizeSubscriptionsQuery,
	plansQuery,
	productsQuery,
	purchaseQuery,
	queryClient,
	rawUserPreferencesQuery,
	receiptQuery,
	siteBySlugQuery,
	siteFeaturesQuery,
	siteMediaStorageQuery,
	sitePurchasesQuery,
	smsCountryCodesQuery,
	sshKeysQuery,
	twoStepAuthAppSetupQuery,
	userNotificationsDevicesQuery,
	userNotificationsSettingsQuery,
	userPaymentMethodsQuery,
	userPurchasesQuery,
	userReceiptsQuery,
	userSettingsQuery,
	userTaxDetailsQuery,
	userTransferredPurchasesQuery,
} from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { createRoute, createLazyRoute, redirect } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { getMonetizeSubscriptionsPageTitle } from '../../me/billing-monetize-subscriptions/title';
import { reauthRequiredLink } from '../../utils/link';
import {
	isTemporarySitePurchase,
	getTitleForDisplay,
	getPurchaseCancellationFlowType,
	isDotcomPlan,
	CANCEL_FLOW_TYPE,
} from '../../utils/purchase';
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
			window.location.href = reauthRequiredLink();
		}
	},
} ).lazy( () =>
	import( '../../me' ).then( ( d ) =>
		createLazyRoute( 'me' )( {
			component: d.default,
		} )
	)
);

export const meIndexRoute = createRoute( {
	getParentRoute: () => meRoute,
	path: '/',
	beforeLoad: () => {
		throw redirect( { to: '/me/profile' } );
	},
} );

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
	loader: async () => {
		await Promise.all( [
			queryClient.ensureQueryData( userSettingsQuery() ),
			queryClient.ensureQueryData( isAutomatticianQuery() ),
		] );
	},
} ).lazy( () =>
	import( '../../me/profile' ).then( ( d ) =>
		createLazyRoute( 'profile' )( {
			component: d.default,
		} )
	)
);

export const preferencesRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Preferences' ),
			},
		],
	} ),
	getParentRoute: () => meRoute,
	path: 'preferences',
	loader: async () => {
		await Promise.all( [
			queryClient.ensureQueryData( userSettingsQuery() ),
			queryClient.ensureQueryData( rawUserPreferencesQuery() ),
		] );
	},
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
	path: '/history',
} );

export const billingHistoryIndexRoute = createRoute( {
	getParentRoute: () => billingHistoryRoute,
	path: '/',
	loader: () => {
		queryClient.prefetchQuery( userReceiptsQuery() );
	},
} ).lazy( () =>
	import( '../../me/billing-history' ).then( ( d ) =>
		createLazyRoute( 'billing-history' )( {
			component: d.default,
		} )
	)
);

export const receiptRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Receipt' ),
			},
		],
	} ),
	getParentRoute: () => billingHistoryRoute,
	loader: async ( { params: { receiptId } } ) => {
		await Promise.all( [
			queryClient.ensureQueryData( receiptQuery( parseInt( receiptId ) ) ),
			queryClient.ensureQueryData( userTaxDetailsQuery() ),
		] );
	},
	path: '$receiptId',
} ).lazy( () =>
	import( '../../me/billing-history/receipt' ).then( ( d ) =>
		createLazyRoute( 'billing-history-receipt' )( {
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
	path: '/purchases',
} );

export const purchasesIndexRoute = createRoute( {
	getParentRoute: () => purchasesRoute,
	path: '/',
	loader: () => {
		queryClient.prefetchQuery( userPurchasesQuery() );
		queryClient.prefetchQuery( userTransferredPurchasesQuery() );
		queryClient.prefetchQuery( userPaymentMethodsQuery( {} ) );
		queryClient.prefetchQuery( allSitesQuery() );
	},
	validateSearch: ( search ): { page?: number; search?: string; site?: number } => {
		return {
			page: typeof search.page === 'number' ? search.page : undefined,
			search: typeof search.search === 'string' ? search.search : undefined,
			site: typeof search.site === 'number' ? search.site : undefined,
		};
	},
} ).lazy( () =>
	import( '../../me/billing-purchases' ).then( ( d ) =>
		createLazyRoute( 'purchases' )( {
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
	getParentRoute: () => purchasesRoute,
	loader: async ( { params: { purchaseId } } ) => {
		const purchase = await queryClient.ensureQueryData( purchaseQuery( parseInt( purchaseId ) ) );
		return {
			purchase,
		};
	},
	path: '$purchaseId',
} );

export const purchaseSettingsIndexRoute = createRoute( {
	getParentRoute: () => purchaseSettingsRoute,
	path: '/',
	loader: async ( { params: { purchaseId } } ) => {
		const purchase = await queryClient.ensureQueryData( purchaseQuery( parseInt( purchaseId ) ) );

		// Preload site and storage data for wpcom plans
		if ( purchase.site_slug && purchase.blog_id && ! isTemporarySitePurchase( purchase ) ) {
			await Promise.all( [
				queryClient.ensureQueryData( siteBySlugQuery( purchase.site_slug ) ).catch( () => {
					// Some sites cannot be reached; like disconnected Jetpack sites. We can safely ignore those.
				} ),
				isDotcomPlan( purchase )
					? queryClient.ensureQueryData( siteMediaStorageQuery( purchase.blog_id ) )
					: undefined,
			] );
		}
	},
} ).lazy( () =>
	import( '../../me/billing-purchases/purchase-settings' ).then( ( d ) =>
		createLazyRoute( 'purchases-purchase-settings' )( {
			component: d.default,
		} )
	)
);

export const changePaymentMethodRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Update payment method' ),
			},
		],
	} ),
	getParentRoute: () => purchaseSettingsRoute,
	path: 'payment-method/change',
	loader: () => {
		queryClient.prefetchQuery( allowedPaymentMethodsQuery() );
		queryClient.prefetchQuery( userPaymentMethodsQuery( { type: 'card' } ) );
	},
	validateSearch: ( search ): { redirect_to?: string } => {
		return {
			redirect_to: typeof search.redirect_to === 'string' ? search.redirect_to : undefined,
		};
	},
} ).lazy( () =>
	import( '../../me/billing-purchases/change-payment-method' ).then( ( d ) =>
		createLazyRoute( 'purchases-purchase-settings-change-payment-method' )( {
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
	path: 'payment-methods',
} );

export const paymentMethodsIndexRoute = createRoute( {
	getParentRoute: () => paymentMethodsRoute,
	path: '/',
	loader: () => {
		queryClient.prefetchQuery(
			userPaymentMethodsQuery( {
				expired: true,
			} )
		);
	},
} ).lazy( () =>
	import( '../../me/billing-payment-methods' ).then( ( d ) =>
		createLazyRoute( 'payment-methods' )( {
			component: d.default,
		} )
	)
);

export const addPaymentMethodRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Add payment method' ),
			},
		],
	} ),
	getParentRoute: () => paymentMethodsRoute,
	path: 'add',
} ).lazy( () =>
	import( '../../me/billing-purchases/add-payment-method' ).then( ( d ) =>
		createLazyRoute( 'purchases-purchase-settings-add-payment-method' )( {
			component: d.default,
		} )
	)
);

export const cancelPurchaseRoute = createRoute( {
	head: ( { loaderData }: { loaderData?: { purchase?: Purchase } } ) => {
		const purchase = loaderData?.purchase;
		const title =
			purchase && getPurchaseCancellationFlowType( purchase ) === CANCEL_FLOW_TYPE.REMOVE
				? __( 'Remove' )
				: __( 'Cancel' );
		return {
			meta: [
				{
					title,
				},
			],
		};
	},
	getParentRoute: () => purchaseSettingsRoute,
	path: 'cancel',
	loader: async ( { parentMatchPromise } ) => {
		const parentMatch = await parentMatchPromise;
		const purchase = parentMatch.loaderData?.purchase;
		if ( ! purchase ) {
			return { purchase: undefined };
		}
		await Promise.all( [
			queryClient.ensureQueryData( sitePurchasesQuery( purchase.blog_id ) ),
			queryClient.ensureQueryData( productsQuery() ),
			queryClient.ensureQueryData( siteFeaturesQuery( purchase.blog_id ) ),
			queryClient.ensureQueryData( plansQuery() ),
		] );
		return { purchase };
	},
} ).lazy( () =>
	import( '../../me/billing-purchases/cancel-purchase' ).then( ( d ) =>
		createLazyRoute( 'cancel-purchase' )( {
			component: d.default,
		} )
	)
);

export const monetizeSubscriptionsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: getMonetizeSubscriptionsPageTitle(),
			},
		],
	} ),
	getParentRoute: () => billingRoute,
	path: 'monetize-subscriptions',
} );

export const monetizeSubscriptionsIndexRoute = createRoute( {
	getParentRoute: () => monetizeSubscriptionsRoute,
	path: '/',
	loader: () => {
		queryClient.prefetchQuery( monetizeSubscriptionsQuery() );
	},
} ).lazy( () =>
	import( '../../me/billing-monetize-subscriptions' ).then( ( d ) =>
		createLazyRoute( 'monetize-subscriptions' )( {
			component: d.default,
		} )
	)
);

export const monetizeSubscriptionRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: getMonetizeSubscriptionsPageTitle(),
			},
		],
	} ),
	getParentRoute: () => monetizeSubscriptionsRoute,
	path: '$subscriptionId',
} ).lazy( () =>
	import( '../../me/billing-monetize-subscriptions/monetize-subscription' ).then( ( d ) =>
		createLazyRoute( 'monetize-subscription' )( {
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
	loader: async () => {
		await Promise.all( [
			queryClient.ensureQueryData( geoLocationQuery() ),
			queryClient.ensureQueryData( countryListQuery() ),
			queryClient.ensureQueryData( userTaxDetailsQuery() ),
		] );
	},
} ).lazy( () =>
	import( '../../me/billing-tax-details' ).then( ( d ) =>
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
	loader: async () => {
		await Promise.all( [
			queryClient.ensureQueryData( userSettingsQuery() ),
			queryClient.ensureQueryData( accountRecoveryQuery() ),
			queryClient.ensureQueryData( connectedApplicationsQuery() ),
			queryClient.ensureQueryData( sshKeysQuery() ),
		] );
	},
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
} );

export const securityTwoStepAuthIndexRoute = createRoute( {
	getParentRoute: () => securityTwoStepAuthRoute,
	path: '/',
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
	getParentRoute: () => securityTwoStepAuthRoute,
	path: '/app',
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
	getParentRoute: () => securityTwoStepAuthRoute,
	path: '/sms',
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
	getParentRoute: () => securityTwoStepAuthRoute,
	path: '/backup-codes',
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
	validateSearch: ( search ): { back_to?: 'site-settings-sftp-ssh' } => {
		return {
			back_to: search.back_to === 'site-settings-sftp-ssh' ? 'site-settings-sftp-ssh' : undefined,
		};
	},
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
	loader: () =>
		Promise.all( [
			queryClient.ensureQueryData( userNotificationsSettingsQuery() ),
			queryClient.ensureQueryData( userNotificationsDevicesQuery() ),
		] ),
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
	loader: () => queryClient.ensureQueryData( userNotificationsSettingsQuery() ),
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

export const mcpRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'MCP Account Settings' ),
			},
		],
	} ),
	getParentRoute: () => meRoute,
	path: 'mcp',
	loader: async () => {
		await queryClient.ensureQueryData( userSettingsQuery() );
	},
} );

export const mcpIndexRoute = createRoute( {
	getParentRoute: () => mcpRoute,
	path: '/',
} ).lazy( () =>
	import( '../../me/mcp' ).then( ( d ) =>
		createLazyRoute( 'mcp' )( {
			component: d.default,
		} )
	)
);

export const mcpSetupRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'MCP Client Setup' ),
			},
		],
	} ),
	getParentRoute: () => mcpRoute,
	path: 'setup',
} ).lazy( () =>
	import( '../../me/mcp/setup' ).then( ( d ) =>
		createLazyRoute( 'mcp-setup' )( {
			component: d.default,
		} )
	)
);

export const createMeRoutes = ( config: AppConfig ) => {
	if ( ! config.supports.me ) {
		return [];
	}

	const meRoutes: AnyRoute[] = [ meIndexRoute, profileRoute, preferencesRoute ];

	meRoutes.push(
		billingRoute.addChildren( [
			billingIndexRoute,
			billingHistoryRoute.addChildren( [ billingHistoryIndexRoute, receiptRoute ] ),
			...( config.supports.me.billing && config.supports.me.billing.monetizeSubscriptions
				? [
						monetizeSubscriptionsRoute.addChildren( [
							monetizeSubscriptionsIndexRoute,
							monetizeSubscriptionRoute,
						] ),
				  ]
				: [] ),
			purchasesRoute.addChildren( [
				purchasesIndexRoute,
				purchaseSettingsRoute.addChildren( [
					purchaseSettingsIndexRoute,
					changePaymentMethodRoute,
					cancelPurchaseRoute,
				] ),
			] ),
			paymentMethodsRoute.addChildren( [ paymentMethodsIndexRoute, addPaymentMethodRoute ] ),
			taxDetailsRoute,
		] )
	);

	meRoutes.push(
		securityRoute.addChildren( [
			securityIndexRoute,
			securityPasswordRoute,
			securityAccountRecoveryRoute,
			securityTwoStepAuthRoute.addChildren( [
				securityTwoStepAuthIndexRoute,
				securityTwoStepAuthAppRoute,
				securityTwoStepAuthSMSRoute,
				securityTwoStepAuthBackupCodesRoute,
			] ),
			...( config.supports.me.security && config.supports.me.security.sshKey
				? [ securitySshKeyRoute ]
				: [] ),
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

	if ( isEnabled( 'mcp-settings' ) ) {
		meRoutes.push( mcpRoute.addChildren( [ mcpIndexRoute, mcpSetupRoute ] ) );
	}

	if ( config.supports.me.apps ) {
		meRoutes.push( appsRoute );
	}

	return [ meRoute.addChildren( meRoutes ) ];
};
