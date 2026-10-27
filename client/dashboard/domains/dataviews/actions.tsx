import { DomainSubtype, DomainStatus } from '@automattic/api-core';
import { purchaseQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useMemo, Suspense, lazy } from 'react';
import { useAnalytics } from '../../app/analytics';
import {
	domainOverviewRoute,
	domainConnectionSetupRoute,
	domainTransferRoute,
} from '../../app/router/domains';
import ComponentViewTracker from '../../components/component-view-tracker';
import { isDomainRenewable } from '../../utils/domain';
import { getRenewalUrlFromPurchase } from '../../utils/purchase';
import type { DomainSummary, Site } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

const SiteChangeAddressContent = lazy(
	() =>
		import(
			/* webpackChunkName: "async-load-site-change-address-content" */ '../../sites/site-change-address-modal/content'
		)
);

const noop = () => {};

/**
 * Row actions for the domains lists. Every action is a primary action, so they render as inline
 * links and DataViews never shows the "more actions" menu. Everything else (renewal before expiry,
 * DNS, contact information, auto-renew, email, transfers) lives on the domain's Settings page.
 */
export const useActions = ( { sites }: { sites?: Site[] } ) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { recordTracksEvent } = useAnalytics();
	const hasEnTranslation = useHasEnTranslation();

	const sitesByBlogId: Record< number, Site > = useMemo( () => {
		if ( ! sites ) {
			return {};
		}
		return sites.reduce(
			( acc, site ) => {
				acc[ site.ID ] = site;
				return acc;
			},
			{} as Record< number, Site >
		);
	}, [ sites ] );

	const actions: Action< DomainSummary >[] = useMemo(
		() => [
			{
				id: 'setup',
				isPrimary: true,
				label: __( 'Set up' ),
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];

					recordTracksEvent( 'calypso_dashboard_domains_action_click', {
						action: 'setup',
						domain: domain.domain,
					} );

					router.navigate( {
						to: domainConnectionSetupRoute.fullPath,
						params: {
							domainName: domain.domain,
						},
					} );
				},
				isEligible: ( item: DomainSummary ) =>
					item.subtype.id === DomainSubtype.DOMAIN_CONNECTION &&
					item.domain_status.id === DomainStatus.CONNECTION_ERROR,
			},
			{
				id: 'renew',
				isPrimary: true,
				label: __( 'Renew domain' ),
				callback: async ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];

					recordTracksEvent( 'calypso_dashboard_domains_action_click', {
						action: 'renew',
						domain: domain.domain,
					} );

					const purchase = await queryClient.fetchQuery(
						purchaseQuery( parseInt( domain.subscription_id ?? '0', 10 ) )
					);

					window.location.href = getRenewalUrlFromPurchase( purchase );
				},
				isEligible: ( item: DomainSummary ) => item.expired && isDomainRenewable( item ),
			},
			{
				id: 'manage-domain',
				isPrimary: true,
				label: __( 'Settings' ),
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];

					recordTracksEvent( 'calypso_dashboard_domains_action_click', {
						action: 'manage-domain',
						domain: domain.domain,
					} );

					const targetRoute =
						domain.subtype.id === DomainSubtype.DOMAIN_TRANSFER &&
						config.isEnabled( 'domain-transfer-redesign' )
							? domainTransferRoute
							: domainOverviewRoute;

					router.navigate( {
						to: targetRoute.fullPath,
						params: {
							domainName: domain.domain,
						},
					} );
				},
				isEligible: ( item: DomainSummary ) => {
					return item.subtype.id !== DomainSubtype.DEFAULT_ADDRESS;
				},
			},
			{
				id: 'change-site-address',
				isPrimary: true,
				label: hasEnTranslation( 'Rename address' )
					? __( 'Rename address' )
					: __( 'Change site address' ),
				modalHeader: __( 'Change site address' ),
				callback: () => {},
				isEligible: ( item: DomainSummary ) => {
					const site = sitesByBlogId[ item.blog_id ];
					return (
						!! site &&
						! site?.is_wpcom_atomic &&
						! item.is_suspended_site &&
						item.subtype.id === DomainSubtype.DEFAULT_ADDRESS
					);
				},
				RenderModal: ( { items, closeModal = noop } ) => {
					const site = sitesByBlogId[ items[ 0 ].blog_id ];
					return site ? (
						<Suspense fallback={ null }>
							<ComponentViewTracker
								eventName="calypso_dashboard_domains_action_click"
								properties={ { action: 'change-site-address', domain: items[ 0 ].domain } }
							/>
							<SiteChangeAddressContent
								site={ site }
								domain={ items[ 0 ] }
								onClose={ closeModal }
							/>
						</Suspense>
					) : null;
				},
			},
		],
		[ router, queryClient, sitesByBlogId, recordTracksEvent, hasEnTranslation ]
	);

	return actions;
};
