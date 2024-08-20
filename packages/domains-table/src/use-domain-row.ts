import { PartialDomainData, useSiteDomainsQuery, useSiteQuery } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useDomainsTable } from './domains-table/domains-table';
import { getDomainId } from './get-domain-id';
import { countDomainsRequiringAttention } from './utils';
import { createSiteDomainObject } from './utils/assembler';
import { resolveDomainStatus } from './utils/resolve-domain-status';

const notNull = < T >( x: T ): x is Exclude< T, null > => x !== null;

export const useDomainRow = ( domain: PartialDomainData ) => {
	const {
		isAllSitesView,
		fetchSiteDomains,
		domainStatusPurchaseActions,
		onDomainsRequiringAttentionChange,
		fetchSite,
		selectedDomains,
		handleSelectDomain,
		domainResults,
		showBulkActions,
		updatingDomain,
	} = useDomainsTable();

	const translate = useTranslate();
	const { ref, inView } = useInView( { triggerOnce: true } );

	const { data: allSiteDomains, isLoading: isLoadingSiteDomainsDetails } = useSiteDomainsQuery(
		domain.blog_id,
		{
			enabled: inView,
			...( fetchSiteDomains && { queryFn: () => fetchSiteDomains( domain.blog_id ) } ),
			select: ( state ) => state.domains.map( createSiteDomainObject ),
		}
	);

	const currentDomainData = allSiteDomains?.find( ( d ) => d.name === domain.domain );

	const isPrimaryDomain = useMemo(
		() => allSiteDomains?.find( ( d ) => d.isPrimary )?.name === domain.domain,
		[ allSiteDomains, domain.domain ]
	);

	const { data: site, isLoading: isLoadingSiteDetails } = useSiteQuery( domain.blog_id, {
		enabled: inView,
		...( fetchSite && { queryFn: () => fetchSite( domain.blog_id ) } ),
	} );

	const siteSlug = useMemo( () => {
		if ( ! site?.URL ) {
			// Fall back to the site's ID if we're still loading detailed site data
			return domain.blog_id.toString( 10 );
		}

		if ( site.options?.is_redirect && site.options?.unmapped_url ) {
			return new URL( site.options.unmapped_url ).host;
		}

		return new URL( site.URL ).host.replace( /\//g, '::' );
	}, [ site, domain.blog_id ] );

	const isLoadingRowDetails = isLoadingSiteDetails || isLoadingSiteDomainsDetails;

	const domainsRequiringAttention = useMemo( () => {
		if ( ! currentDomainData || isLoadingRowDetails ) {
			return null;
		}
		const domains = allSiteDomains
			?.map( ( domain ) =>
				resolveDomainStatus( domain, {
					siteSlug: siteSlug,
					getMappingErrors: true,
					translate,
					isPurchasedDomain: domainStatusPurchaseActions?.isPurchasedDomain?.( currentDomainData ),
					isCreditCardExpiring:
						domainStatusPurchaseActions?.isCreditCardExpiring?.( currentDomainData ),
					isVipSite: site?.is_vip,
				} )
			)
			.filter( notNull );

		return countDomainsRequiringAttention( domains ?? [] );
	}, [
		allSiteDomains,
		currentDomainData,
		domainStatusPurchaseActions,
		siteSlug,
		translate,
		isLoadingRowDetails,
	] );

	useEffect( () => {
		if ( typeof domainsRequiringAttention === 'number' && domainsRequiringAttention > 0 ) {
			onDomainsRequiringAttentionChange?.( domainsRequiringAttention );
		}
	}, [ domainsRequiringAttention, onDomainsRequiringAttentionChange ] );

	const isManageableDomain = ! domain.wpcom_domain;
	const shouldDisplayPrimaryDomainLabel = ! isAllSitesView && isPrimaryDomain;

	const [ placeholderWidth ] = useState( () => {
		const MIN = 40;
		const MAX = 100;

		return Math.floor( Math.random() * ( MAX - MIN + 1 ) ) + MIN;
	} );

	const userCanAddSiteToDomain = currentDomainData?.currentUserCanCreateSiteFromDomainOnly ?? false;

	const isSelected = selectedDomains.has( getDomainId( domain ) );

	const pendingUpdates = useMemo( () => {
		const updates = domainResults.get( domain.domain ) ?? [];

		if ( domain.domain === updatingDomain?.domain && updatingDomain.message ) {
			updates.unshift( {
				created_at: updatingDomain.created_at,
				message: updatingDomain.message,
				status: '',
			} );
		}

		return updates;
	}, [ domain.domain, domainResults, updatingDomain ] );

	const domainStatus = currentDomainData
		? resolveDomainStatus( currentDomainData, {
				siteSlug: siteSlug,
				translate,
				getMappingErrors: true,
				currentRoute: window.location.pathname,
				isPurchasedDomain: domainStatusPurchaseActions?.isPurchasedDomain?.( currentDomainData ),
				isCreditCardExpiring:
					domainStatusPurchaseActions?.isCreditCardExpiring?.( currentDomainData ),
				onRenewNowClick: () =>
					domainStatusPurchaseActions?.onRenewNowClick?.( siteSlug ?? '', currentDomainData ),
				monthsUtilCreditCardExpires:
					domainStatusPurchaseActions?.monthsUtilCreditCardExpires?.( currentDomainData ),
				isVipSite: site?.is_vip,
		  } )
		: null;

	const sslStatus = currentDomainData?.sslStatus ?? null;
	const hasWpcomManagedSslCert = currentDomainData?.hasWpcomManagedSslCert;

	return {
		ref,
		site,
		siteSlug,
		isManageableDomain,
		userCanAddSiteToDomain,
		domainsRequiringAttention,
		placeholderWidth,
		shouldDisplayPrimaryDomainLabel,
		isLoadingRowDetails,
		isLoadingSiteDetails,
		isLoadingSiteDomainsDetails,
		isSelected,
		handleSelectDomain,
		isAllSitesView,
		domainStatus,
		domainStatusPurchaseActions,
		pendingUpdates,
		currentDomainData,
		showBulkActions,
		sslStatus,
		hasWpcomManagedSslCert,
	};
};
