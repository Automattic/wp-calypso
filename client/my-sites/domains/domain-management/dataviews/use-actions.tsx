import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import { SiteDetails } from '@automattic/data-stores';
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
	domainManagementDNS,
	domainManagementLink,
	domainManagementTransferToOtherSiteLink,
	domainUseMyDomain,
} from '@automattic/domains-table/src/utils/paths';
import { shouldUpgradeToMakeDomainPrimary } from '@automattic/domains-table/src/utils/should-upgrade-to-make-domain-primary';
import { Action } from '@wordpress/dataviews';
import { Icon, drawerLeft, info, update } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { navigate } from 'calypso/lib/navigate';
import { domainManagementEditContactInfo } from '../../paths';
import { AutoRenewDiolog } from './components/auto-renew-dialog';
import { DomainData } from './types';
import { useDomainsDataViewsContext } from './use-context';

export function useActions( { sidebarMode }: { sidebarMode?: boolean }, onClose?: () => void ) {
	const translate = useTranslate();
	const {
		sites,
		isAllSitesView,
		domainStatusPurchaseActions,
		updatingDomain,
		userCanSetPrimaryDomains = false,
		onDomainAction,
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
					? translate( 'View transfer' )
					: translate( 'View settings' );
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
					const url = domainManagementDNS( domain.original.site_slug, domain.processed.domain );
					navigate( url );
				}
			},
			label: translate( 'Manage DNS' ),
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
			label: translate( 'Manage contact information' ),
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
			label: translate( 'Make primary site address' ),
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
			label: translate( 'Transfer to WordPress.com' ),
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
			label: translate( 'Attach to an existing site' ),
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
			label: translate( 'Change site address' ),
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
			label: translate( 'Renew now' ),
			supportsBulk: false,
			isEligible( domain: DomainData ) {
				return isDomainRenewable( domain.processed );
			},
		},
		{
			id: 'manage-auto-renew',
			icon: <Icon icon={ update } />,
			label: translate( 'Manage auto-renew' ),
			supportsBulk: ! sidebarMode,
			isEligible( domain: DomainData ) {
				return isDomainRenewable( domain.processed );
			},
			RenderModal: ( props ) => <AutoRenewDiolog { ...props } />,
		},
	];

	return actions;
}
