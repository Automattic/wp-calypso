import { DomainSubtype } from '@automattic/api-core';
import { userPurchasesQuery, siteSetPrimaryDomainMutation } from '@automattic/api-queries';
import { isFreeUrlDomainName } from '@automattic/domains-table/src/utils/is-free-url-domain-name';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Icon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { sprintf, __ } from '@wordpress/i18n';
import { payment, tool } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, Suspense, lazy } from 'react';
import {
	domainOverviewRoute,
	domainDnsRoute,
	domainContactInfoRoute,
	domainConnectionSetupRoute,
	domainTransferToAnyUserRoute,
	domainTransferToOtherSiteRoute,
} from '../../app/router/domains';
import { isDomainRenewable, canSetAsPrimary, getDomainRenewalUrl } from '../../utils/domain';
import { isTransferrableToWpcom } from '../../utils/domain-types';
import type { DomainSummary, Site, User } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

const SiteChangeAddressContent = lazy(
	() =>
		import(
			/* webpackChunkName: "async-load-site-change-address-content" */ '../../sites/site-change-address-modal/content'
		)
);

const noop = () => {};

export const useActions = ( { user, site }: { user: User; site?: Site } ) => {
	const router = useRouter();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: purchases } = useQuery( userPurchasesQuery() );
	const setPrimaryDomainMutation = useMutation( siteSetPrimaryDomainMutation() );
	const actions: Action< DomainSummary >[] = useMemo(
		() => [
			{
				id: 'renew',
				isPrimary: true,
				icon: <Icon icon={ payment } />,
				label: __( 'Renew now' ),
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
				icon: <Icon icon={ tool } />,
				label: __( 'Set up connection' ),
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
				label: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];
					return domain.subtype.id === DomainSubtype.DOMAIN_TRANSFER
						? __( 'View transfer' )
						: __( 'View settings' );
				},
				supportsBulk: false,
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];

					router.navigate( {
						to: domainOverviewRoute.fullPath,
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
				id: 'manage-contact-info',
				label: __( 'Manage contact information' ),
				supportsBulk: false,
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];

					router.navigate( {
						to: domainContactInfoRoute.fullPath,
						params: {
							domainName: domain.domain,
						},
					} );
				},
				isEligible: ( item: DomainSummary ) => {
					return (
						item.current_user_is_owner === true &&
						item.subtype.id === DomainSubtype.DOMAIN_REGISTRATION
					);
				},
			},
			{
				id: 'set-primary-site-address',
				label: __( 'Make primary site address' ),
				supportsBulk: false,
				callback: ( domains: DomainSummary[] ) => {
					if ( ! site ) {
						return;
					}

					const domain = domains[ 0 ];
					setPrimaryDomainMutation.mutate(
						{ siteId: site.ID, domain: domain.domain },
						{
							onSuccess: () => {
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
							onError: () => {
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
					return !! site && canSetAsPrimary( { domain: item, site, user } );
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
					return !! site && ! site?.is_wpcom_atomic && isFreeUrlDomainName( item.domain );
				},
				RenderModal: ( { items, closeModal = noop } ) =>
					site ? (
						<Suspense fallback={ null }>
							<SiteChangeAddressContent
								site={ site }
								domain={ items[ 0 ] }
								onClose={ closeModal }
							/>
						</Suspense>
					) : null,
			},
			{
				id: 'manage-auto-renew',
				label: __( 'Manage auto-renew' ),
				supportsBulk: false,
				callback: () => {},
				isEligible: () => false,
			},
		],
		[
			user,
			site,
			router,
			purchases,
			setPrimaryDomainMutation,
			createSuccessNotice,
			createErrorNotice,
		]
	);

	return actions;
};
