import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import { PartialDomainData, SiteDetails } from '@automattic/data-stores';
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
	domainManagementEditContactInfo,
} from '@automattic/domains-table/src/utils/paths';
import { shouldUpgradeToMakeDomainPrimary } from '@automattic/domains-table/src/utils/should-upgrade-to-make-domain-primary';
import { Action } from '@wordpress/dataviews';
import { Icon, commentAuthorAvatar, drawerLeft, update } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { navigate } from 'calypso/lib/navigate';
import { AutoRenewDiolog } from './components/auto-renew-dialog';
import { useDomainsDataViewsContext } from './use-context';

export function useActions( viewType: 'table' | 'list' | 'grid', onClose?: () => void ) {
	const translate = useTranslate();
	const {
		getFullDomain,
		sites,
		getSiteSlug,
		isAllSitesView,
		domainStatusPurchaseActions,
		updatingDomain,
		userCanSetPrimaryDomains = false,
		onDomainAction,
		handleUpdateContactInfo,
		context,
	} = useDomainsDataViewsContext();

	const actions: Action< PartialDomainData >[] = [
		...( viewType !== 'list'
			? [
					{
						id: 'manage-domain',
						isPrimary: true,
						icon: drawerLeft,
						label: ( domains: Array< PartialDomainData > ) => {
							const domain = domains.length > 0 && domains[ 0 ] && getFullDomain( domains[ 0 ] );
							return domain && domain.type === domainTypes.TRANSFER
								? translate( 'View transfer' )
								: translate( 'View settings' );
						},
						callback: ( domains: Array< PartialDomainData > ) => {
							const domain = domains.length > 0 && domains[ 0 ] && getFullDomain( domains[ 0 ] );
							if ( ! domain ) {
								return;
							}
							const url = domainManagementLink(
								domain,
								getSiteSlug( domains[ 0 ] ),
								isAllSitesView
							);
							navigate( url );
						},
						isEligible( partialDomain: PartialDomainData ) {
							const domain = getFullDomain( partialDomain );
							if ( ! domain ) {
								return false;
							}
							return domain.type !== domainTypes.WPCOM;
						},
					},
			  ]
			: [] ),
		{
			id: 'manage-dns-settings',
			callback: ( domains: Array< PartialDomainData > ) => {
				const domain = domains.length > 0 && domains[ 0 ] && getFullDomain( domains[ 0 ] );
				if ( domain ) {
					onDomainAction?.( 'manage-dns-settings', domain );
					const url = domainManagementDNS( getSiteSlug( domains[ 0 ] ), domain.domain, context );
					navigate( url );
				}
			},
			label: translate( 'Manage DNS' ),
			supportsBulk: false,
			isEligible( partialDomain: PartialDomainData ) {
				const domain = getFullDomain( partialDomain );
				if ( ! domain ) {
					return false;
				}
				return (
					domain.canManageDnsRecords &&
					domain.transferStatus !== transferStatus.PENDING_ASYNC &&
					domain.type !== domainTypes.SITE_REDIRECT
				);
			},
		},
		{
			id: 'manage-contact-info',
			icon: commentAuthorAvatar,
			callback: ( domains: Array< PartialDomainData > ) => {
				if ( domains.length === 0 ) {
					return;
				}
				if ( domains.length === 1 ) {
					const domain = domains[ 0 ];
					const url = domainManagementEditContactInfo(
						getSiteSlug( domain ),
						domain.domain,
						null,
						context
					);
					navigate( url );
				} else {
					handleUpdateContactInfo( domains );
				}
			},
			label: translate( 'Manage contact information' ),
			supportsBulk: true,
			isEligible( partialDomain: PartialDomainData ) {
				const domain = getFullDomain( partialDomain );
				if ( ! domain ) {
					return false;
				}
				return (
					domain.currentUserIsOwner &&
					domain.canUpdateContactInfo &&
					domain.type === domainTypes.REGISTERED &&
					( isDomainUpdateable( domain ) || isDomainInGracePeriod( domain ) )
				);
			},
		},
		{
			id: 'set-primary-site-address',
			callback: ( domains: Array< PartialDomainData > ) => {
				const domain = domains.length > 0 && domains[ 0 ] && getFullDomain( domains[ 0 ] );
				if ( domain ) {
					onDomainAction?.( 'set-primary-address', domain );
					onClose?.();
				}
			},
			label: translate( 'Make primary site address' ),
			disabled: updatingDomain?.action === 'set-primary-address',
			supportsBulk: false,
			isEligible( partialDomain: PartialDomainData ) {
				const domain = getFullDomain( partialDomain );
				if ( ! domain ) {
					return false;
				}

				const site = sites[ domain.blogId ] && ( sites[ domain.blogId ] as SiteDetails );
				const canSetPrimaryDomainForSite =
					site?.plan?.features.active.includes( FEATURE_SET_PRIMARY_CUSTOM_DOMAIN ) ?? false;
				const isSiteOnFreePlan = site?.plan?.is_free ?? true;

				return (
					! isAllSitesView &&
					canSetAsPrimary(
						domain,
						shouldUpgradeToMakeDomainPrimary( domain, {
							isDomainOnly: domain.currentUserCanCreateSiteFromDomainOnly,
							canSetPrimaryDomainForSite,
							userCanSetPrimaryDomains,
							isSiteOnFreePlan,
						} )
					) &&
					! isRecentlyRegistered( domain.registrationDate )
				);
			},
		},
		{
			id: 'transfer-domain',
			callback: ( domains: Array< PartialDomainData > ) => {
				const domain = domains.length > 0 && domains[ 0 ];
				if ( domain ) {
					const url = domainUseMyDomain(
						getSiteSlug( domain ),
						domain.domain,
						useMyDomainInputMode.transferDomain
					);
					navigate( url );
				}
			},
			label: translate( 'Transfer to WordPress.com' ),
			supportsBulk: false,
			isEligible( partialDomain: PartialDomainData ) {
				const domain = getFullDomain( partialDomain );
				if ( ! domain ) {
					return false;
				}
				return domain.type === domainTypes.MAPPED && domain.isEligibleForInboundTransfer;
			},
		},
		{
			id: 'connect-to-site',
			callback: ( domains: Array< PartialDomainData > ) => {
				const domain = domains.length > 0 && domains[ 0 ];
				if ( domain ) {
					const url = domainManagementTransferToOtherSiteLink(
						getSiteSlug( domains[ 0 ] ),
						domain.domain
					);
					navigate( url );
				}
			},
			label: translate( 'Attach to an existing site' ),
			supportsBulk: false,
			isEligible( partialDomain: PartialDomainData ) {
				const domain = getFullDomain( partialDomain );
				if ( ! domain ) {
					return false;
				}
				return domain.currentUserCanCreateSiteFromDomainOnly;
			},
		},
		{
			id: 'change-site-address',
			callback: ( domains: Array< PartialDomainData > ) => {
				const domain = domains.length > 0 && domains[ 0 ] && getFullDomain( domains[ 0 ] );
				if ( domain ) {
					onDomainAction?.( 'change-site-address', domain );
					onClose?.();
				}
			},
			label: translate( 'Change site address' ),
			supportsBulk: false,
			isEligible( domain: PartialDomainData ) {
				const site = sites[ domain.blog_id ] && ( sites[ domain.blog_id ] as SiteDetails );
				const isSimpleSite = ! site?.is_wpcom_atomic;
				return ! isAllSitesView && isSimpleSite && isFreeUrlDomainName( domain.domain );
			},
		},
		{
			id: 'renew-domain',
			callback: ( domains: Array< PartialDomainData > ) => {
				const domain = domains.length > 0 && domains[ 0 ] && getFullDomain( domains[ 0 ] );
				if ( domain ) {
					domainStatusPurchaseActions?.onRenewNowClick?.( domain.domain ?? '', domain );
					onClose?.();
				}
			},
			label: translate( 'Renew now' ),
			supportsBulk: false,
			isEligible( partialDomain: PartialDomainData ) {
				const domain = getFullDomain( partialDomain );
				if ( ! domain ) {
					return false;
				}
				return isDomainRenewable( domain );
			},
		},
		{
			id: 'manage-auto-renew',
			icon: <Icon icon={ update } />,
			label: translate( 'Manage auto-renew' ),
			supportsBulk: true,
			isEligible( partialDomain: PartialDomainData ) {
				const domain = getFullDomain( partialDomain );
				if ( ! domain ) {
					return false;
				}
				return isDomainRenewable( domain );
			},
			RenderModal: ( props ) => <AutoRenewDiolog { ...props } />,
		},
	];

	return actions;
}
