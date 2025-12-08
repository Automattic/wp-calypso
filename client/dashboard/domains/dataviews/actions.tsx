import { DomainSubtype } from '@automattic/api-core';
import { userPurchasesQuery, siteSetPrimaryDomainMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { sprintf, __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, Suspense, lazy } from 'react';
import { useAnalytics } from '../../app/analytics';
import {
	domainOverviewRoute,
	domainDnsRoute,
	domainContactInfoRoute,
	domainConnectionSetupRoute,
	domainTransferRoute,
	domainTransferToAnyUserRoute,
	domainTransferToOtherSiteRoute,
	domainsContactInfoRoute,
} from '../../app/router/domains';
import { isDomainRenewable, canSetAsPrimary, getDomainRenewalUrl } from '../../utils/domain';
import { isTransferrableToWpcom } from '../../utils/domain-types';
import { AutoRenewModal } from './auto-renew-modal';
import type { DomainSummary, Site, User } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

const SiteChangeAddressContent = lazy(
	() =>
		import(
			/* webpackChunkName: "async-load-site-change-address-content" */ '../../sites/site-change-address-modal/content'
		)
);

const noop = () => {};

export const useActions = ( { user, sites }: { user: User; sites?: Site[] } ) => {
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: purchases } = useQuery( userPurchasesQuery() );
	const setPrimaryDomainMutation = useMutation( siteSetPrimaryDomainMutation() );
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
				id: 'renew',
				isPrimary: true,
				label: __( 'Renew' ),
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];
					const purchase = purchases?.find(
						( p ) => p.ID === parseInt( domain.subscription_id ?? '0', 10 )
					);

					if ( ! purchase ) {
						return;
					}

					window.location.href = getDomainRenewalUrl( domain, purchase );
				},
				isEligible: ( item: DomainSummary ) => isDomainRenewable( item ),
			},
			{
				id: 'setup',
				isPrimary: true,
				label: __( 'Set up' ),
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];

					router.navigate( {
						to: domainConnectionSetupRoute.fullPath,
						params: {
							domainName: domain.domain,
						},
					} );
				},
				isEligible: ( item: DomainSummary ) =>
					item.subtype.id === DomainSubtype.DOMAIN_CONNECTION &&
					item.domain_status.id === 'connection_error',
			},
			{
				id: 'manage-domain',
				isPrimary: true,
				label: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];
					return domain.subtype.id === DomainSubtype.DOMAIN_TRANSFER
						? __( 'View transfer' )
						: __( 'View settings' );
				},
				supportsBulk: false,
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];

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
				id: 'manage-dns-settings',
				label: __( 'Manage DNS' ),
				supportsBulk: false,
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];

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
				id: 'set-primary-site-address',
				label: __( 'Make primary site address' ),
				supportsBulk: false,
				callback: ( domains: DomainSummary[] ) => {
					const domain = domains[ 0 ];
					const site = sitesByBlogId[ domain.blog_id ];

					if ( ! site ) {
						return;
					}

					// Track the set primary domain action
					recordTracksEvent( 'calypso_dashboard_domain_list_change_primary_link', {
						domain: domain.domain,
						origin: 'dataviews_actions',
					} );

					setPrimaryDomainMutation.mutate(
						{ siteId: site.ID, domain: domain.domain },
						{
							onSuccess: () => {
								// Track success
								recordTracksEvent( 'calypso_dashboard_domain_list_change_primary_link_success', {
									domain: domain.domain,
									origin: 'dataviews_actions',
								} );

								createSuccessNotice(
									sprintf(
										/* translators: %s is domain */
										__( 'Primary domain changed: all domains will redirect to %s.' ),
										domain.domain
									),
									{
										type: 'snackbar',
									}
								);
							},
							onError: ( error: Error ) => {
								// Track failure
								recordTracksEvent( 'calypso_dashboard_domain_list_change_primary_link_failure', {
									domain: domain.domain,
									origin: 'dataviews_actions',
									error_message: error.message,
								} );

								createErrorNotice(
									__( 'Something went wrong and we couldn’t change your primary domain.' ),
									{
										type: 'snackbar',
									}
								);
							},
						}
					);
				},
				isEligible: ( item: DomainSummary ) => {
					const site = sitesByBlogId[ item.blog_id ];
					const hasRedirect = site?.options?.is_redirect ?? false;
					return !! site && canSetAsPrimary( { domain: item, site, user } ) && ! hasRedirect;
				},
				disabled: setPrimaryDomainMutation.isPending,
			},
			{
				id: 'transfer-domain',
				label: __( 'Transfer to WordPress.com' ),
				supportsBulk: false,
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];

					router.navigate( {
						to: domainTransferToAnyUserRoute.fullPath,
						params: {
							domainName: domain.domain,
						},
					} );
				},
				isEligible: ( item: DomainSummary ) => {
					return isTransferrableToWpcom( item );
				},
			},
			{
				id: 'connect-to-site',
				label: __( 'Attach to an existing site' ),
				supportsBulk: false,
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];

					router.navigate( {
						to: domainTransferToOtherSiteRoute.fullPath,
						params: {
							domainName: domain.domain,
						},
					} );
				},
				isEligible: () => false,
			},
			{
				id: 'change-site-address',
				label: __( 'Change site address' ),
				supportsBulk: false,
				callback: () => {},
				isEligible: ( item: DomainSummary ) => {
					const site = sitesByBlogId[ item.blog_id ];
					return (
						!! site && ! site?.is_wpcom_atomic && item.subtype.id === DomainSubtype.DEFAULT_ADDRESS
					);
				},
				RenderModal: ( { items, closeModal = noop } ) => {
					const site = sitesByBlogId[ items[ 0 ].blog_id ];
					return site ? (
						<Suspense fallback={ null }>
							<SiteChangeAddressContent
								site={ site }
								domain={ items[ 0 ] }
								onClose={ closeModal }
							/>
						</Suspense>
					) : null;
				},
			},
			{
				id: 'manage-contact-info',
				label: __( 'Manage contact information' ),
				supportsBulk: true,
				callback: ( domains ) => {
					if ( domains.length === 0 ) {
						return;
					}

					if ( domains.length === 1 ) {
						return router.navigate( {
							to: domainContactInfoRoute.fullPath,
							params: {
								domainName: domains[ 0 ].domain,
							},
						} );
					}

					return router.navigate( {
						to: domainsContactInfoRoute.fullPath,
						search: {
							selected: domains.map( ( domain ) => domain.domain ).join( ',' ),
						},
					} );
				},
				isEligible: ( item ) => {
					return (
						item.current_user_is_owner === true &&
						item.subtype.id === DomainSubtype.DOMAIN_REGISTRATION
					);
				},
			},
			{
				id: 'manage-auto-renew',
				label: __( 'Manage auto-renew' ),
				supportsBulk: true,
				callback: () => {},
				RenderModal: ( { items, closeModal = noop, onActionPerformed = noop } ) => (
					<AutoRenewModal
						items={ items }
						onSuccess={ () => {
							onActionPerformed( items );
							closeModal();
						} }
					/>
				),
				isEligible: ( item ) => isDomainRenewable( item ),
			},
		],
		[
			user,
			router,
			purchases,
			setPrimaryDomainMutation,
			createSuccessNotice,
			createErrorNotice,
			sitesByBlogId,
			recordTracksEvent,
		]
	);

	return actions;
};
