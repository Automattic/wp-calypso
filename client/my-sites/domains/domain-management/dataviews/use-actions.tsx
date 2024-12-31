import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import { SelectDropdown } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import transformIcon from '@automattic/domains-table/src/bulk-actions-toolbar/transform.svg';
import { canSetAsPrimary } from '@automattic/domains-table/src/utils/can-set-as-primary';
import {
	type as domainTypes,
	transferStatus,
	useMyDomainInputMode,
} from '@automattic/domains-table/src/utils/constants';
import { isFreeUrlDomainName } from '@automattic/domains-table/src/utils/is-free-url-domain-name';
import { isDomainInGracePeriod } from '@automattic/domains-table/src/utils/is-in-grace-period';
import { isRecentlyRegistered } from '@automattic/domains-table/src/utils/is-recently-registered';
import { isDomainRenewable } from '@automattic/domains-table/src/utils/is-renewable';
import { isDomainUpdateable } from '@automattic/domains-table/src/utils/is-updateable';
import {
	domainMagementDNS,
	domainManagementLink,
	domainManagementTransferToOtherSiteLink,
	domainUseMyDomain,
} from '@automattic/domains-table/src/utils/paths';
import { shouldUpgradeToMakeDomainPrimary } from '@automattic/domains-table/src/utils/should-upgrade-to-make-domain-primary';
import { Action } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { Icon, drawerLeft, info, update } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { navigate } from 'calypso/lib/navigate';
import { domainManagementEditContactInfo } from '../../paths';
import { DomainData } from './types';
import { useDomainsDataViewsContext } from './use-context';

declare const __i18n_text_domain__: string;

export function useActions( { sidebarMode }: { sidebarMode?: boolean }, onClose?: () => void ) {
	const { __ } = useI18n();
	const {
		sites,
		isAllSitesView,
		domainStatusPurchaseActions,
		updatingDomain,
		userCanSetPrimaryDomains = false,
		onDomainAction,
		handleAutoRenew,
		handleUpdateContactInfo,
	} = useDomainsDataViewsContext();

	const actions: Action< DomainData >[] = [
		{
			id: 'manage-domain',
			isPrimary: true,
			icon: drawerLeft,
			label: ( domains: Array< DomainData > ) => {
				const domain = domains.length > 0 && domains[ 0 ];
				return domain && domain.processed.type === domainTypes.TRANSFER
					? __( 'View transfer' )
					: __( 'View settings' );
			},
			callback: ( domains: Array< DomainData > ) => {
				const domain = domains[ 0 ];
				const url = domainManagementLink(
					domain.processed,
					domain.original.site_slug,
					isAllSitesView
				);
				navigate( url );
			},
			isEligible( domain: DomainData ) {
				return domain.processed.type !== domainTypes.WPCOM;
			},
		},
		{
			id: 'manage-dns-settings',
			callback: ( domains: Array< DomainData > ) => {
				const domain = domains.length > 0 && domains[ 0 ];
				if ( domain ) {
					onDomainAction?.( 'manage-dns-settings', domain.processed );
					const url = domainMagementDNS( domain.original.site_slug, domain.processed.domain );
					navigate( url );
				}
			},
			label: __( 'Manage DNS' ),
			supportsBulk: false,
			isEligible( domain: DomainData ) {
				return (
					domain.processed.canManageDnsRecords &&
					domain.processed.transferStatus !== transferStatus.PENDING_ASYNC &&
					domain.processed.type !== domainTypes.SITE_REDIRECT
				);
			},
		},
		{
			id: 'manage-contact-info',
			icon: <Icon icon={ info } />,
			callback: ( domains: Array< DomainData > ) => {
				if ( domains.length === 0 ) {
					return;
				}
				if ( domains.length === 1 ) {
					const domain = domains[ 0 ];
					const url = domainManagementEditContactInfo(
						domain.original.site_slug,
						domain.processed.domain
					);
					navigate( url );
				} else {
					handleUpdateContactInfo( domains );
				}
			},
			label: __( 'Manage contact information' ),
			supportsBulk: ! sidebarMode,
			isEligible( domain: DomainData ) {
				return (
					domain.processed.currentUserIsOwner &&
					domain.processed.type === domainTypes.REGISTERED &&
					( isDomainUpdateable( domain.processed ) || isDomainInGracePeriod( domain.processed ) )
				);
			},
		},
		{
			id: 'set-primary-site-address',
			callback: ( domains: Array< DomainData > ) => {
				const domain = domains.length > 0 && domains[ 0 ];
				if ( domain ) {
					onDomainAction?.( 'set-primary-address', domain.processed );
					onClose?.();
				}
			},
			label: __( 'Make primary site address' ),
			disabled: updatingDomain?.action === 'set-primary-address',
			supportsBulk: false,
			isEligible( domain: DomainData ) {
				const site =
					sites[ domain.processed.blogId ] && ( sites[ domain.processed.blogId ] as SiteDetails );
				const canSetPrimaryDomainForSite =
					site?.plan?.features.active.includes( FEATURE_SET_PRIMARY_CUSTOM_DOMAIN ) ?? false;
				const isSiteOnFreePlan = site?.plan?.is_free ?? true;

				return (
					! isAllSitesView &&
					canSetAsPrimary(
						domain.processed,
						shouldUpgradeToMakeDomainPrimary( domain.processed, {
							isDomainOnly: domain.processed.currentUserCanCreateSiteFromDomainOnly,
							canSetPrimaryDomainForSite,
							userCanSetPrimaryDomains,
							isSiteOnFreePlan,
						} )
					) &&
					! isRecentlyRegistered( domain.processed.registrationDate )
				);
			},
		},
		{
			id: 'transfer-domain',
			callback: ( domains: Array< DomainData > ) => {
				const domain = domains.length > 0 && domains[ 0 ];
				if ( domain ) {
					const url = domainUseMyDomain(
						domain.original.site_slug,
						domain.processed.domain,
						useMyDomainInputMode.transferDomain
					);
					navigate( url );
				}
			},
			label: __( 'Transfer to WordPress.com' ),
			supportsBulk: false,
			isEligible( domain: DomainData ) {
				return (
					domain.processed.type === domainTypes.MAPPED &&
					domain.processed.isEligibleForInboundTransfer
				);
			},
		},
		{
			id: 'connect-to-site',
			callback: ( domains: Array< DomainData > ) => {
				const domain = domains.length > 0 && domains[ 0 ];
				if ( domain ) {
					const url = domainManagementTransferToOtherSiteLink(
						domain.original.site_slug,
						domain.processed.domain
					);
					navigate( url );
				}
			},
			label: __( 'Attach to an existing site' ),
			supportsBulk: false,
			isEligible( domain: DomainData ) {
				return domain.processed.currentUserCanCreateSiteFromDomainOnly;
			},
		},
		{
			id: 'change-site-address',
			callback: ( domains: Array< DomainData > ) => {
				const domain = domains.length > 0 && domains[ 0 ];
				if ( domain ) {
					onDomainAction?.( 'change-site-address', domain.processed );
					onClose?.();
				}
			},
			label: __( 'Change site address' ),
			supportsBulk: false,
			isEligible( domain: DomainData ) {
				const site =
					sites[ domain.processed.blogId ] && ( sites[ domain.processed.blogId ] as SiteDetails );
				const isSimpleSite = ! site?.is_wpcom_atomic;
				return ! isAllSitesView && isSimpleSite && isFreeUrlDomainName( domain.processed.domain );
			},
		},
		{
			id: 'renew-domain',
			callback: ( domains: Array< DomainData > ) => {
				const domain = domains.length > 0 && domains[ 0 ];
				if ( domain ) {
					domainStatusPurchaseActions?.onRenewNowClick?.(
						domain.processed.domain ?? '',
						domain.processed
					);
					onClose?.();
				}
			},
			label: __( 'Renew now' ),
			supportsBulk: false,
			isEligible( domain: DomainData ) {
				return isDomainRenewable( domain.processed );
			},
		},
		{
			id: 'manage-auto-renew',
			icon: <Icon icon={ update } />,
			label: __( 'Manage auto-renew' ),
			supportsBulk: ! sidebarMode,
			isEligible( domain: DomainData ) {
				return isDomainRenewable( domain.processed );
			},
			RenderModal: ( { items, closeModal, onActionPerformed } ) => {
				const { __, _n } = useI18n();
				const [ controlKey, setControlKey ] = useState( 1 );
				const enableLabel = createInterpolateElement(
					__( 'Turn <b>on</b> auto-renew', __i18n_text_domain__ ),
					{ b: <strong /> }
				);

				const disableLabel = createInterpolateElement(
					__( 'Turn <b>off</b> auto-renew', __i18n_text_domain__ ),
					{ b: <strong /> }
				);

				const handleAutoRenewSelect = ( { value }: { value: string } ) => {
					if ( value === 'enable' ) {
						handleAutoRenew( items, true );
					} else if ( value === 'disable' ) {
						handleAutoRenew( items, false );
					}

					// By default the SelectDropdown will "select" the item that was clicked. We don't
					// want this so we force the components internal state to be reset, which keeps
					// the selection set to `initialSelected="button-label"`.
					setControlKey( ( oldKey ) => oldKey + 1 );

					onActionPerformed?.( items );
					closeModal?.();
				};

				return (
					<div>
						<p>
							{ sprintf(
								/* translators: domainCount will be the number of domains to update */
								_n(
									'Update auto-renew settings for %(domainCount)d domain',
									'Update auto-renew settings for %(domainCount)d domains',
									items.length,
									__i18n_text_domain__
								),
								{ domainCount: items.length }
							) }
						</p>
						<SelectDropdown
							key={ controlKey }
							className="domains-table-bulk-actions-toolbar__select"
							initialSelected="button-label"
							showSelectedOption={ false }
							onSelect={ handleAutoRenewSelect }
							options={ [
								{
									value: 'button-label',
									label: __( 'Choose new status…', __i18n_text_domain__ ),
									icon: (
										<img
											className="domains-table-bulk-actions-toolbar__icon"
											src={ transformIcon }
											width={ 18 }
											height={ 18 }
											alt=""
										/>
									),
								},
								{ value: 'enable', label: enableLabel },
								{ value: 'disable', label: disableLabel },
							] }
						/>
					</div>
				);
			},
		},
	];

	return actions;
}
