import { DomainSubtype } from '@automattic/api-core';
import { userPurchasesQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, Suspense, lazy } from 'react';
import { useAnalytics } from '../../app/analytics';
import { domainOverviewRoute, domainDnsRoute, domainTransferRoute } from '../../app/router/domains';
import ComponentViewTracker from '../../components/component-view-tracker';
import { isDomainRenewable } from '../../utils/domain';
import { getRenewalUrlFromPurchase } from '../../utils/purchase';
import type { DomainSummary, Site } from '@automattic/api-core';
import type { Action, View } from '@wordpress/dataviews';

const SiteChangeAddressContent = lazy(
	() =>
		import(
			/* webpackChunkName: "async-load-site-change-address-content" */ '../../sites/site-change-address-modal/content'
		)
);

const noop = () => {};

export const useActions = ( {
	site,
	sites,
	layout,
	onChangePrimaryDomain,
}: {
	site?: Site;
	sites?: Site[];
	layout: View[ 'type' ];
	onChangePrimaryDomain?: () => void;
} ) => {
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();
	const { data: purchases } = useQuery( userPurchasesQuery() );
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

	const renewDomain = useCallback(
		( items: DomainSummary[] ) => {
			const domain = items[ 0 ];

			recordTracksEvent( 'calypso_dashboard_domains_action_click', {
				action: 'renew',
				layout,
				domain: domain.domain,
			} );

			const purchase = purchases?.find(
				( p ) => p.ID === parseInt( domain.subscription_id ?? '0', 10 )
			);

			if ( ! purchase ) {
				return;
			}

			window.location.href = getRenewalUrlFromPurchase( purchase );
		},
		[ purchases, recordTracksEvent, layout ]
	);

	const actions: Action< DomainSummary >[] = useMemo(
		() => [
			{
				id: 'renew',
				isPrimary: true,
				label: __( 'Renew' ),
				callback: renewDomain,
				isEligible: ( item: DomainSummary ) => isDomainRenewable( item ) && item.expired,
			},
			{
				id: 'change-primary-domain',
				isPrimary: true,
				/* translators: Row action on the primary site address that opens the dialog to pick another one. */
				label: __( 'Change primary' ),
				callback: ( items: DomainSummary[] ) => {
					recordTracksEvent( 'calypso_dashboard_domains_action_click', {
						action: 'change-primary-domain',
						layout,
						domain: items[ 0 ].domain,
					} );
					onChangePrimaryDomain?.();
				},
				isEligible: ( item: DomainSummary ) => !! onChangePrimaryDomain && item.primary_domain,
			},
			{
				id: 'manage-domain',
				isPrimary: true,
				label: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];
					return domain.subtype.id === DomainSubtype.DOMAIN_TRANSFER
						? __( 'View transfer' )
						: __( 'Settings' );
				},
				supportsBulk: false,
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];

					recordTracksEvent( 'calypso_dashboard_domains_action_click', {
						action: 'manage-domain',
						layout,
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
						search: site ? { back_to: 'site-domains' } : undefined,
					} );
				},
				isEligible: ( item: DomainSummary ) => {
					return item.subtype.id !== DomainSubtype.DEFAULT_ADDRESS;
				},
			},
			{
				id: 'manage-dns-settings',
				label: __( 'Manage DNS' ),
				supportsBulk: false,
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];

					recordTracksEvent( 'calypso_dashboard_domains_action_click', {
						action: 'manage-dns-settings',
						layout,
						domain: domain.domain,
					} );

					router.navigate( {
						to: domainDnsRoute.fullPath,
						params: {
							domainName: domain.domain,
						},
					} );
				},
				isEligible: ( item: DomainSummary ) => {
					return (
						item.subtype.id === DomainSubtype.DOMAIN_CONNECTION ||
						item.subtype.id === DomainSubtype.DOMAIN_REGISTRATION
					);
				},
			},
			{
				id: 'change-site-address',
				isPrimary: true,
				label: hasEnTranslation( 'Rename address' )
					? /* translators: Row action on a site's free WordPress.com address that opens the dialog to change that address. */
						__( 'Rename address' )
					: __( 'Change site address' ),
				modalHeader: __( 'Change site address' ),
				supportsBulk: false,
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
								properties={ { action: 'change-site-address', layout, domain: items[ 0 ].domain } }
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
		[
			router,
			renewDomain,
			hasEnTranslation,
			sitesByBlogId,
			recordTracksEvent,
			layout,
			site,
			onChangePrimaryDomain,
		]
	);

	return actions;
};
