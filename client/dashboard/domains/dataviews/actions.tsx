import {
	domainManagementDNS,
	domainManagementEditContactInfo,
	domainManagementLink,
	domainMappingSetup,
} from '@automattic/domains-table/src/utils/paths';
import { useMutation } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { sprintf, __ } from '@wordpress/i18n';
import { payment, tool } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo } from 'react';
import { siteSetPrimaryDomainMutation } from '../../app/queries/site-domains';
import { DomainTypes, DomainTransferStatus } from '../../data/domains';
import {
	isRecentlyRegistered,
	isDomainRenewable,
	isDomainUpdatable,
	isDomainInGracePeriod,
	canSetAsPrimary,
	getDomainSiteSlug,
} from '../../utils/domain';
import type { DomainSummary, Site, User } from '../../data/types';
import type { Action } from '@wordpress/dataviews';

export const useActions = ( { user, site }: { user: User; site?: Site } ) => {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const setPrimaryDomainMutation = useMutation( siteSetPrimaryDomainMutation() );
	const context = site ? 'site' : 'domains';
	const actions: Action< DomainSummary >[] = useMemo(
		() => [
			{
				id: 'renew',
				isPrimary: true,
				icon: <Icon icon={ payment } />,
				label: __( 'Renew now' ),
				callback: () => {},
				isEligible: ( item: DomainSummary ) => isDomainRenewable( item ),
			},
			{
				id: 'setup',
				isPrimary: true,
				icon: <Icon icon={ tool } />,
				label: __( 'Setup' ),
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];
					const siteSlug = getDomainSiteSlug( domain );
					window.location.pathname = domainMappingSetup( siteSlug, domain.domain );
				},
				isEligible: ( item: DomainSummary ) => item.type === DomainTypes.MAPPED,
			},
			{
				id: 'manage-domain',
				label: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];
					return domain.type === DomainTypes.TRANSFER
						? __( 'View transfer' )
						: __( 'View settings' );
				},
				supportsBulk: false,
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];
					const siteSlug = getDomainSiteSlug( domain );
					window.location.pathname = domainManagementLink( domain, siteSlug, false );
				},
				isEligible: ( item: DomainSummary ) => {
					return item.type !== DomainTypes.WPCOM;
				},
			},
			{
				id: 'manage-dns-settings',
				label: __( 'Manage DNS' ),
				supportsBulk: false,
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];
					const siteSlug = getDomainSiteSlug( domain );
					window.location.pathname = domainManagementDNS( siteSlug, domain.domain, context );
				},
				isEligible: ( item: DomainSummary ) => {
					return (
						item.can_manage_dns_records &&
						item.transfer_status !== DomainTransferStatus.PENDING_ASYNC &&
						item.type !== DomainTypes.SITE_REDIRECT
					);
				},
			},
			{
				id: 'manage-contact-info',
				label: __( 'Manage contact information' ),
				supportsBulk: false,
				callback: ( items: DomainSummary[] ) => {
					const domain = items[ 0 ];
					const siteSlug = getDomainSiteSlug( domain );
					window.location.pathname = domainManagementEditContactInfo(
						siteSlug,
						domain.domain,
						null,
						context
					);
				},
				isEligible: ( item: DomainSummary ) => {
					return (
						!! item.current_user_is_owner &&
						item.can_update_contact_info &&
						! item.wpcom_domain &&
						item.has_registration &&
						( isDomainUpdatable( item ) || isDomainInGracePeriod( item ) )
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
					return (
						!! site &&
						canSetAsPrimary( { domain: item, site, user } ) &&
						! isRecentlyRegistered( item.registrationDate )
					);
				},
				disabled: setPrimaryDomainMutation.isPending,
			},
			{
				id: 'transfer-domain',
				label: __( 'Transfer to WordPress.com' ),
				supportsBulk: false,
				callback: () => {},
				isEligible: () => false,
			},
			{
				id: 'connect-to-site',
				label: __( 'Attach to an existing site' ),
				supportsBulk: false,
				callback: () => {},
				isEligible: () => false,
			},
			{
				id: 'change-site-address',
				label: __( 'Change site address' ),
				supportsBulk: false,
				callback: () => {},
				isEligible: () => false,
			},
			{
				id: 'manage-auto-renew',
				label: __( 'Manage auto-renew' ),
				supportsBulk: false,
				callback: () => {},
				isEligible: () => false,
			},
		],
		[ user, site, context, setPrimaryDomainMutation, createSuccessNotice, createErrorNotice ]
	);

	return actions;
};
