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
import { useRef } from 'react';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useAppContext } from '../../../app/context';
import { ActionList } from '../../../components/action-list';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import { getSiteDisplayName } from '../../../utils/site-name';
import type { Site } from '@automattic/api-core';

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

	// Track whether the last mutation was an "add exception" action
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

	// Build lists of disabled and available sites
	const disabledSites: Array< { id: number; name: string; domain: string } > = [];
	const availableSites: Array< { id: number; name: string } > = [];

	sites.forEach( ( site, index ) => {
		const result = bigSkyQueries[ index ];
		if ( ! result?.data ) {
			return;
		}
		const { enabled, available } = result.data;
		const name = getSiteDisplayName( site );
		const domain = site.URL ? site.URL.replace( /^https?:\/\//, '' ) : '';

		if ( ! enabled && available ) {
			disabledSites.push( { id: site.ID, name, domain } );
		} else if ( enabled && available ) {
			availableSites.push( { id: site.ID, name } );
		}
	} );

	// ComboboxControl options — only sites where AI assistant is currently enabled.
	// When there are no eligible sites, show a placeholder so the dropdown
	// says "No eligible sites" instead of the default "No items found".
	const siteOptions =
		availableSites.length > 0
			? availableSites.map( ( site ) => ( {
					value: String( site.id ),
					label: site.name,
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
		isAddingRef.current = true;
		( document.activeElement as HTMLElement )?.blur();
		mutation.mutate( { siteId, enable: false } );
	};

	const handleRemoveSite = ( siteId: number ) => {
		isAddingRef.current = false;
		mutation.mutate( { siteId, enable: true } );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ __( 'AI assistant site exceptions' ) }
					description={ __(
						'The WordPress.com AI assistant is enabled on all your sites. Add exceptions for specific sites here.'
					) }
				/>
			}
		>
			<VStack spacing={ 6 }>
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader
								level={ 3 }
								title={ __( 'Add an exception' ) }
								description={ __( 'Search for eligible sites to disable the AI assistant.' ) }
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

				{ disabledSites.length > 0 && (
					<VStack spacing={ 4 }>
						<SectionHeader level={ 3 } title={ __( 'Sites with exceptions' ) } />
						<ActionList>
							{ disabledSites.map( ( site ) => (
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
