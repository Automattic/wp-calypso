import { DomainSubtype, DomainStatus } from '@automattic/api-core';
import {
	userPurchasesQuery,
	siteSetPrimaryDomainMutation,
	sslDetailsQuery,
} from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useQuery, useMutation, useQueries } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { sprintf, __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { useMemo, Suspense, lazy } from 'react';
import { useAnalytics } from '../../app/analytics';
import {
	domainOverviewRoute,
	domainDnsRoute,
	domainContactInfoRoute,
	domainConnectionSetupRoute,
	domainTransferRoute,
	domainTransferToOtherSiteRoute,
	domainsContactInfoRoute,
} from '../../app/router/domains';
import { chooseEmailSolutionRoute } from '../../app/router/emails';
import { getCurrentDashboard } from '../../app/routing';
import ComponentViewTracker from '../../components/component-view-tracker';
import { isDomainRenewable, canSetAsPrimaryIgnoringSsl } from '../../utils/domain';
import { isTransferrableToWpcom } from '../../utils/domain-types';
import { redirectToDashboardLink, wpcomLink } from '../../utils/link';
import { getPrimaryDomainErrorMessage } from '../../utils/primary-domain-error';
import { getRenewalUrlFromPurchase } from '../../utils/purchase';
import { AutoRenewModal } from './auto-renew-modal';
import type { DomainSummary, Site, User } from '@automattic/api-core';
import type { Action, View } from '@wordpress/dataviews';

const SiteChangeAddressContent = lazy(
	() =>
		import(
			/* webpackChunkName: "async-load-site-change-address-content" */ '../../sites/site-change-address-modal/content'
		)
);

const noop = () => {};

export const useActions = ( {
	user,
	site,
	sites,
	domains,
	layout,
	onChangePrimaryDomain,
}: {
	user: User;
	site?: Site;
	sites?: Site[];
	domains?: DomainSummary[];
	layout: View[ 'type' ];
	onChangePrimaryDomain?: () => void;
} ) => {
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: purchases } = useQuery( userPurchasesQuery() );
	const hasEnTranslation = useHasEnTranslation();

	const { mutate: setPrimaryDomain, isPending: isSettingPrimaryDomain } = useMutation(
		siteSetPrimaryDomainMutation()
	);

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
	// A domain can only be made primary once its SSL certificate is provisioned.
	// DomainSummary has no SSL field, so resolve it from the SSL details query,
	// but only for domains that are otherwise eligible to avoid firing SSL
	// requests for the whole list.
	const primaryCandidateDomainNames = useMemo( () => {
		return ( domains ?? [] )
			.filter( ( item ) => {
				const site = sitesByBlogId[ item.blog_id ];
				return (
					!! site &&
					item.subtype.id !== DomainSubtype.DEFAULT_ADDRESS &&
					canSetAsPrimaryIgnoringSsl( { domain: item, site, user } )
				);
			} )
			.map( ( item ) => item.domain );
	}, [ domains, sitesByBlogId, user ] );

	const sslQueries = useQueries( {
		queries: primaryCandidateDomainNames.map( ( domainName ) => ( {
			...sslDetailsQuery( domainName ),
			staleTime: 60_000,
		} ) ),
	} );

	// Serialize into a stable primitive so the memo below (and the actions memo)
	// don't depend on the non-referentially-stable useQueries result.
	const sslActiveKey = primaryCandidateDomainNames
		.filter( ( _domainName, index ) => sslQueries[ index ]?.data?.certificate_provisioned )
		.join( ',' );

	const sslActiveByDomain = useMemo( () => {
		const activeDomains = new Set( sslActiveKey ? sslActiveKey.split( ',' ) : [] );
		const map: Record< string, boolean > = {};
		primaryCandidateDomainNames.forEach( ( domainName ) => {
			map[ domainName ] = activeDomains.has( domainName );
		} );
		return map;
	}, [ primaryCandidateDomainNames, sslActiveKey ] );

	const actions: Action< DomainSummary >[] = useMemo(
		() => [
			{
				id: 'renew',
				isPrimary: true,
				label: __( 'Renew' ),
				callback: ( items: DomainSummary[] ) => {
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
				isEligible: ( item: DomainSummary ) => isDomainRenewable( item ),
			},
			{
				id: 'setup',
				isPrimary: true,
				label: __( 'Set up' ),
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];

					recordTracksEvent( 'calypso_dashboard_domains_action_click', {
						action: 'setup',
						layout,
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
				id: 'add-mailbox',
				label: __( 'Add mailbox' ),
				supportsBulk: false,
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];

					recordTracksEvent( 'calypso_dashboard_domains_action_click', {
						action: 'add-mailbox',
						layout,
						domain: domain.domain,
					} );

					router.navigate( {
						to: chooseEmailSolutionRoute.fullPath,
						params: {
							domain: domain.domain,
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

					recordTracksEvent( 'calypso_dashboard_domains_action_click', {
						action: 'set-primary-site-address',
						layout,
						domain: domain.domain,
					} );

					if ( ! site ) {
						return;
					}

					// Track the set primary domain action
					recordTracksEvent( 'calypso_dashboard_domain_list_change_primary_link', {
						domain: domain.domain,
						origin: 'dataviews_actions',
					} );

					setPrimaryDomain(
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

								createErrorNotice( getPrimaryDomainErrorMessage( error ), {
									type: 'snackbar',
								} );
							},
						}
					);
				},
				isEligible: ( item: DomainSummary ) => {
					const site = sitesByBlogId[ item.blog_id ];
					const isSslActive =
						item.subtype.id === DomainSubtype.DEFAULT_ADDRESS ||
						( sslActiveByDomain[ item.domain ] ?? false );
					return (
						!! site && canSetAsPrimaryIgnoringSsl( { domain: item, site, user } ) && isSslActive
					);
				},
				disabled: isSettingPrimaryDomain,
			},
			{
				id: 'transfer-domain',
				label: __( 'Transfer to WordPress.com' ),
				supportsBulk: false,
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];

					recordTracksEvent( 'calypso_dashboard_domains_action_click', {
						action: 'transfer-domain',
						layout,
						domain: domain.domain,
					} );

					const siteSlug = sitesByBlogId[ domain.blog_id ]?.slug ?? domain.site_slug;
					const queryArgs: Record< string, string > = {
						initialQuery: domain.domain,
						initialMode: 'transfer-domain',
						dashboard: getCurrentDashboard(),
						back_to: redirectToDashboardLink(),
					};

					if ( siteSlug ) {
						queryArgs.siteSlug = siteSlug;
					}

					window.location.href = addQueryArgs(
						wpcomLink( '/setup/domain/use-my-domain' ),
						queryArgs
					);
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

					recordTracksEvent( 'calypso_dashboard_domains_action_click', {
						action: 'connect-to-site',
						layout,
						domain: domain.domain,
					} );

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
			{
				id: 'manage-contact-info',
				label: __( 'Manage contact information' ),
				supportsBulk: false,
				callback: ( domains ) => {
					if ( domains.length === 0 ) {
						return;
					}

					recordTracksEvent( 'calypso_dashboard_domains_action_click', {
						action: 'manage-contact-info',
						layout,
						domain: domains[ 0 ].domain,
					} );

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
				supportsBulk: false,
				callback: () => {},
				RenderModal: ( { items, closeModal = noop, onActionPerformed = noop } ) => (
					<>
						<ComponentViewTracker
							eventName="calypso_dashboard_domains_action_click"
							properties={ { action: 'manage-auto-renew', layout, domain: items[ 0 ].domain } }
						/>
						<AutoRenewModal
							items={ items }
							onSuccess={ () => {
								onActionPerformed( items );
								closeModal();
							} }
						/>
					</>
				),
				isEligible: ( item ) => isDomainRenewable( item ),
			},
		],
		[
			user,
			router,
			purchases,
			hasEnTranslation,
			setPrimaryDomain,
			isSettingPrimaryDomain,
			createSuccessNotice,
			createErrorNotice,
			sitesByBlogId,
			sslActiveByDomain,
			recordTracksEvent,
			layout,
			site,
			onChangePrimaryDomain,
		]
	);

	return actions;
};
