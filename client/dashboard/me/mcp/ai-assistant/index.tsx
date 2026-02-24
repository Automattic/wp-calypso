import { updateBigSkyPlugin } from '@automattic/api-core';
import { bigSkyPluginQuery, queryClient, siteQueryFilter } from '@automattic/api-queries';
import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	ComboboxControl,
	Button,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useRef } from 'react';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useAppContext } from '../../../app/context';
import { getCurrentDashboard } from '../../../app/routing';
import { ActionList } from '../../../components/action-list';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import { redirectToDashboardLink, wpcomLink } from '../../../utils/link';
import { getSiteDisplayName } from '../../../utils/site-name';
import type { Site } from '@automattic/api-core';

interface SiteEntry {
	id: number;
	name: string;
	domain: string;
	slug: string;
	available: boolean;
}

export default function McpAiAssistant() {
	const { queries } = useAppContext();
	const sitesQueryResult = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);
	const sites = ( sitesQueryResult.data as Site[] | undefined ) ?? [];

	// Fetch BigSky plugin status for all sites in parallel
	const bigSkyQueries = useQueries( {
		queries: sites.map( ( site ) => ( {
			...bigSkyPluginQuery( site.ID ),
			enabled: sites.length > 0,
		} ) ),
	} );

	// Track whether the last mutation was an "add" action (for spinner placement)
	const isAddingRef = useRef( false );

	// Mutation that accepts { siteId, enable } and invalidates the right query
	const mutation = useMutation( {
		mutationFn: ( { siteId, enable }: { siteId: number; enable: boolean } ) =>
			updateBigSkyPlugin( siteId, { enable } ),
		onSuccess: ( _data, { siteId } ) => {
			queryClient.invalidateQueries( { queryKey: bigSkyPluginQuery( siteId ).queryKey } );
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
		},
		meta: {
			snackbar: {
				success: __( 'AI assistant settings saved.' ),
				error: __( 'Failed to save AI assistant settings.' ),
			},
		},
	} );

	// Build lists of enabled and disabled sites — include ALL sites, not just available ones.
	const enabledSites: SiteEntry[] = [];
	const disabledSites: SiteEntry[] = [];
	const unavailableSites: SiteEntry[] = [];

	sites.forEach( ( site, index ) => {
		const result = bigSkyQueries[ index ];
		if ( ! result?.data ) {
			return;
		}
		const { enabled, available } = result.data;
		const name = getSiteDisplayName( site );
		const domain = site.URL ? site.URL.replace( /^https?:\/\//, '' ) : '';
		const slug = site.slug || domain;
		const entry: SiteEntry = { id: site.ID, name, domain, slug, available };

		if ( ! available ) {
			unavailableSites.push( entry );
		} else if ( enabled ) {
			enabledSites.push( entry );
		} else {
			disabledSites.push( entry );
		}
	} );

	// Determine the mode based on whether more sites are enabled or disabled.
	// Global ON: most sites enabled → page shows "exceptions" (disabled sites)
	// Global OFF: most sites disabled → page shows "add to sites" (enabled sites)
	// Lock the mode on first meaningful calculation so adding/removing exceptions
	// doesn't flip the page mode mid-interaction.
	const lockedModeRef = useRef< boolean | null >( null );
	const computedIsGlobalOn = enabledSites.length > 0 && enabledSites.length >= disabledSites.length;
	if ( lockedModeRef.current === null && ( enabledSites.length > 0 || disabledSites.length > 0 ) ) {
		lockedModeRef.current = computedIsGlobalOn;
	}
	const isGlobalOn = lockedModeRef.current ?? computedIsGlobalOn;

	// In "global on" mode: search enabled sites to disable them, list disabled as exceptions.
	// In "global off" mode: search disabled sites to enable them, list enabled as added sites.
	// Unavailable (free plan) sites only appear in "add" mode so users can upgrade them.
	const eligibleSearchPool = isGlobalOn ? enabledSites : disabledSites;
	const searchPool = isGlobalOn
		? eligibleSearchPool
		: [ ...eligibleSearchPool, ...unavailableSites ];
	const listedSites = isGlobalOn ? disabledSites : enabledSites;

	const siteOptions =
		searchPool.length > 0
			? searchPool.map( ( site ) => ( {
					value: String( site.id ),
					label: site.available
						? site.name
						: `${ site.name } (${ __( 'Upgrade to add assistant' ) })`,
			  } ) )
			: [ { value: '', label: __( 'No eligible sites.' ) } ];

	const handleSiteSelect = ( value: string | null | undefined ) => {
		if ( ! value ) {
			return;
		}
		const siteId = Number( value );
		if ( isNaN( siteId ) ) {
			return;
		}

		// Check if this site needs an upgrade
		const selectedSite = searchPool.find( ( s ) => s.id === siteId );
		if ( selectedSite && ! selectedSite.available ) {
			// Redirect to checkout for the Personal plan (lowest BigSky-eligible plan)
			const backUrl = redirectToDashboardLink( { supportBackport: true } );
			window.location.href = addQueryArgs( wpcomLink( '/setup/plan-upgrade/' ), {
				siteSlug: selectedSite.slug,
				cancel_to: backUrl,
				redirect_to: backUrl,
				dashboard: getCurrentDashboard(),
			} );
			return;
		}

		isAddingRef.current = true;
		( document.activeElement as HTMLElement )?.blur();
		// Global on → disable (add exception). Global off → enable (add to sites).
		mutation.mutate( { siteId, enable: ! isGlobalOn } );
	};

	const handleRemoveSite = ( siteId: number ) => {
		isAddingRef.current = false;
		// Global on → re-enable (remove exception). Global off → disable (remove from sites).
		mutation.mutate( { siteId, enable: isGlobalOn } );
	};

	// Page copy depends on mode
	const pageTitle = isGlobalOn
		? __( 'AI assistant exceptions' )
		: __( 'Add AI assistant to sites' );
	const pageDescription = isGlobalOn
		? __(
				'The WordPress.com AI assistant is enabled on all your paid sites. Add exceptions for specific sites here.'
		  )
		: __( 'The WordPress.com AI assistant is disabled. Add it to individual sites here.' );
	const searchTitle = isGlobalOn ? __( 'Add an exception' ) : __( 'Add a site' );
	const searchDescription = isGlobalOn
		? __( 'Search for eligible sites to disable the AI assistant.' )
		: __( 'Search for a site to enable the AI assistant.' );
	const listTitle = isGlobalOn ? __( 'Restricted sites' ) : __( 'Enabled sites' );
	const listDescription = isGlobalOn
		? __( 'These sites will not have the AI assistant.' )
		: __( 'These sites have the AI assistant enabled.' );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ pageTitle }
					description={ pageDescription }
				/>
			}
		>
			<VStack spacing={ 6 }>
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader
								level={ 3 }
								title={ searchTitle }
								description={ searchDescription }
								actions={
									mutation.isPending && isAddingRef.current ? (
										<Spinner style={ { width: 16, height: 16, margin: 0 } } />
									) : undefined
								}
							/>

							<div
								style={ mutation.isPending ? { opacity: 0.5, pointerEvents: 'none' } : undefined }
							>
								<ComboboxControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={ __( 'Search sites' ) }
									hideLabelFromVision
									value={ null }
									onChange={ handleSiteSelect }
									options={ siteOptions }
									placeholder={ __( 'Search for a site\u2026' ) }
								/>
							</div>
						</VStack>
					</CardBody>
				</Card>

				{ listedSites.length > 0 && (
					<VStack spacing={ 4 }>
						<SectionHeader level={ 3 } title={ listTitle } description={ listDescription } />
						<ActionList>
							{ listedSites.map( ( site ) => (
								<ActionList.ActionItem
									key={ site.id }
									title={ site.name }
									description={ site.domain }
									actions={
										<Button
											variant="secondary"
											size="compact"
											disabled={ mutation.isPending }
											onClick={ () => handleRemoveSite( site.id ) }
										>
											{ __( 'Remove' ) }
										</Button>
									}
								/>
							) ) }
						</ActionList>
					</VStack>
				) }
			</VStack>
		</PageLayout>
	);
}
