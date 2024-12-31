import page from '@automattic/calypso-router';
import { useDomainsBulkActionsMutation } from '@automattic/data-stores';
import { useDomainBulkUpdateStatus } from '@automattic/domains-table/src/use-domain-bulk-update-status';
import { SiteExcerptData } from '@automattic/sites';
import { DESKTOP_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { addQueryArgs } from '@wordpress/url';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { Context, DomainData, DomainsDataViewsProps } from './types';

export const DomainsDataViewsContext = createContext< Context | undefined >( undefined );

export const useDomainsDataViewsContext = () => useContext( DomainsDataViewsContext ) as Context;

export const useGenerateDomainsDataViewsState = ( props: DomainsDataViewsProps ) => {
	const {
		domains: allDomains,
		createBulkAction,
		fetchBulkActionStatus,
		deleteBulkActionStatus,
		isAllSitesView,
		domainStatusPurchaseActions,
		onDomainAction,
		userCanSetPrimaryDomains,
		isLoadingDomains,
		selectedFeature,
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
			( domain: DomainData ) => domain.processed.isWpcomStagingDomain
		);

		if ( ! hasWpcomStagingDomain ) {
			return allDomains;
		}

		return allDomains.filter( ( domain: DomainData ) => {
			if ( domain.processed.isWPCOMDomain ) {
				return domain.processed.isWpcomStagingDomain;
			}

			return true;
		} );
	}, [ allDomains, isAllSitesView ] );

	const allSiteIds = [
		...new Set( domains?.map( ( domain: DomainData ) => domain.processed.blogId ) ?? [] ),
	];

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

	const { setAutoRenew } = useDomainsBulkActionsMutation(
		createBulkAction && { mutationFn: createBulkAction }
	);

	const { completedJobs, domainResults, handleRestartDomainStatusPolling } =
		useDomainBulkUpdateStatus( fetchBulkActionStatus );

	const onDomainsRequiringAttentionChange = useCallback( ( domainsRequiringAttention: number ) => {
		setDomainsRequiringAttention( domainsRequiringAttention );
	}, [] );

	const [ updatingDomain, setUpdatingDomain ] = useState< Context[ 'updatingDomain' ] >( null );

	const handleAutoRenew = ( domains: DomainData[], enable: boolean ) => {
		const domainNames = domains.map( ( domain: DomainData ) => domain.processed.domain );
		const blogIds = [
			...new Set< number >( domains.map( ( domain: DomainData ) => domain.processed.blogId ) ),
		];
		setAutoRenew( domainNames, blogIds, enable );
		handleRestartDomainStatusPolling();
	};

	const handleUpdateContactInfo = ( domains: DomainData[] ) => {
		const baseUrl = isAllSitesView
			? '/domains/manage/all/edit-selected-contact-info'
			: `/domains/manage/edit-selected-contact-info/${ props.siteSlug }`;
		const formLink = addQueryArgs( baseUrl, {
			selected: domains.map( ( domain: DomainData ) => domain.processed.domain ),
		} );
		page( formLink );
	};

	const context: Context = {
		sites,
		isLoadingSites,
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
	};

	return context;
};
