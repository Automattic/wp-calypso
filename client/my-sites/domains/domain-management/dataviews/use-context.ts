import page from '@automattic/calypso-router';
import {
	PartialDomainData,
	getSiteDomainsQueryObject,
	useDomainsBulkActionsMutation,
} from '@automattic/data-stores';
import { ResponseDomain } from '@automattic/domains-table';
import { useDomainBulkUpdateStatus } from '@automattic/domains-table/src/use-domain-bulk-update-status';
import { createSiteDomainObject } from '@automattic/domains-table/src/utils/assembler';
import { SiteExcerptData } from '@automattic/sites';
import { DESKTOP_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { useQueries } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { Context, DomainsDataViewsProps } from './types';

export const DomainsDataViewsContext = createContext< Context | undefined >( undefined );

export const useDomainsDataViewsContext = () => useContext( DomainsDataViewsContext ) as Context;

export const useGenerateDomainsDataViewsState = ( props: DomainsDataViewsProps ) => {
	const {
		domains: allDomains,
		fetchSiteDomains,
		createBulkAction,
		fetchBulkActionStatus,
		deleteBulkActionStatus,
		isAllSitesView,
		domainStatusPurchaseActions,
		onDomainAction,
		userCanSetPrimaryDomains,
		isLoadingDomains,
		selectedFeature,
		hasConnectableSites,
		context: dataViewsUsage,
	} = props;

	const isDesktop = useBreakpoint( DESKTOP_BREAKPOINT );
	const [ domainsRequiringAttention, setDomainsRequiringAttention ] = useState<
		number | undefined
	>( undefined );

	const domains = useMemo( () => {
		if ( isAllSitesView || ! allDomains ) {
			return allDomains;
		}

		const hasWpcomStagingDomain = allDomains.find(
			( domain: PartialDomainData ) => domain.is_wpcom_staging_domain
		);

		if ( ! hasWpcomStagingDomain ) {
			return allDomains;
		}

		return allDomains.filter( ( domain: PartialDomainData ) => {
			if ( domain.wpcom_domain ) {
				return domain.is_wpcom_staging_domain;
			}

			return true;
		} );
	}, [ allDomains, isAllSitesView ] );

	const allSiteIds = [
		...new Set( domains?.map( ( domain: PartialDomainData ) => domain.blog_id ) ?? [] ),
	];

	const allSiteDomains = useQueries( {
		queries: allSiteIds.map( ( siteId ) =>
			getSiteDomainsQueryObject( siteId, {
				...( fetchSiteDomains && { queryFn: () => fetchSiteDomains( siteId ) } ),
			} )
		),
	} );

	const siteDomains = useMemo( () => {
		const fetchedSiteDomains: Record< number, ResponseDomain[] > = {};
		for ( const { data } of allSiteDomains ) {
			const siteId = data?.domains?.[ 0 ]?.blog_id;
			if ( typeof siteId === 'number' ) {
				fetchedSiteDomains[ siteId ] = data?.domains.map( createSiteDomainObject ) ?? [];
			}
		}
		return fetchedSiteDomains;
	}, [ allSiteDomains ] );

	const getFullDomain = ( domain: PartialDomainData ) => {
		const domains = siteDomains[ domain.blog_id ] ?? [];
		return domains.find( ( d ) => d.name === domain.domain );
	};

	const sitesFilterCallback = ( site: SiteExcerptData ) => {
		return allSiteIds.includes( site.ID );
	};

	const { data: allSites = [], isLoading: isLoadingSites } = useSiteExcerptsQuery(
		[],
		sitesFilterCallback,
		'all',
		[ 'is_a4a_dev_site', 'site_migration', 'is_vip' ],
		[ 'theme_slug' ]
	);

	const sites = allSites.reduce(
		( acc, site ) => {
			const siteId = site.ID;
			if ( typeof siteId === 'number' ) {
				acc[ siteId ] = site;
			}
			return acc;
		},
		{} as Record< number, SiteExcerptData >
	);

	const getSiteSlug = ( domain: PartialDomainData ) => {
		const site = sites[ domain.blog_id ];
		if ( ! site?.URL ) {
			// Fall back to the site's ID if we're still loading detailed site data
			return domain.blog_id.toString( 10 );
		}

		if ( site.options?.is_redirect && site.options?.unmapped_url ) {
			return new URL( site.options.unmapped_url ).host;
		}

		return new URL( site.URL ).host.replace( /\//g, '::' );
	};

	const { setAutoRenew } = useDomainsBulkActionsMutation(
		createBulkAction && { mutationFn: createBulkAction }
	);

	const { completedJobs, domainResults, handleRestartDomainStatusPolling } =
		useDomainBulkUpdateStatus( fetchBulkActionStatus );

	const onDomainsRequiringAttentionChange = useCallback( ( domainsRequiringAttention: number ) => {
		setDomainsRequiringAttention( domainsRequiringAttention );
	}, [] );

	const [ updatingDomain, setUpdatingDomain ] = useState< Context[ 'updatingDomain' ] >( null );

	const handleAutoRenew = ( domains: PartialDomainData[], enable: boolean ) => {
		const domainNames = domains.map( ( domain: PartialDomainData ) => domain.domain );
		const blogIds = [
			...new Set< number >( domains.map( ( domain: PartialDomainData ) => domain.blog_id ) ),
		];
		setAutoRenew( domainNames, blogIds, enable );
		handleRestartDomainStatusPolling();
	};

	const handleUpdateContactInfo = ( domains: PartialDomainData[] ) => {
		const baseUrl = isAllSitesView
			? '/domains/manage/all/edit-selected-contact-info'
			: `/domains/manage/edit-selected-contact-info/${ props.siteSlug }`;
		const formLink = addQueryArgs( baseUrl, {
			selected: domains.map( ( domain: PartialDomainData ) => domain.domain ),
		} );
		page( formLink );
	};

	const context: Context = {
		sites,
		getFullDomain,
		getSiteSlug,
		isLoadingSites,
		fetchSiteDomains,
		createBulkAction,
		fetchBulkActionStatus,
		deleteBulkActionStatus,
		isAllSitesView,
		domainStatusPurchaseActions,
		domainsRequiringAttention,
		handleAutoRenew,
		handleUpdateContactInfo,
		onDomainsRequiringAttentionChange,
		completedJobs,
		domainResults,
		handleRestartDomainStatusPolling,
		onDomainAction: async ( actionType, domain ) => {
			const actionDescription = onDomainAction?.( actionType, domain );

			if ( ! actionDescription ) {
				return;
			}

			const { action, message } = actionDescription;

			setUpdatingDomain( {
				action: actionType,
				domain: domain.domain,
				created_at: new Date().valueOf() / 1000,
				message,
			} );

			await action();

			setUpdatingDomain( null );
		},
		updatingDomain,
		userCanSetPrimaryDomains,
		isLoadingDomains,
		isDesktop,
		selectedFeature,
		hasConnectableSites: hasConnectableSites ?? false,
		context: dataViewsUsage,
	};

	return context;
};
