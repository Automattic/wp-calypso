/**
 * MCP AI Assistant — AI assistant site exceptions page
 * Legacy port of: client/dashboard/me/mcp/ai-assistant/index.tsx
 */
import { updateBigSkyPlugin } from '@automattic/api-core';
import { bigSkyPluginQuery, sitesQuery, siteQueryFilter } from '@automattic/api-queries';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button, Spinner } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { ActionList } from '../../dashboard/components/action-list';
import { Card, CardBody } from '../../dashboard/components/card';
import { SectionHeader } from '../../dashboard/components/section-header';
import SiteIcon from '../../dashboard/components/site-icon';
import SiteCombobox from '../../dashboard/me/mcp/site-combobox';

import './style.scss';

function getSiteDisplayName( site ) {
	return site.name || site.URL?.replace( /^https?:\/\//, '' ) || String( site.ID );
}

export default function McpAiAssistant( { path } ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const tanstackQueryClient = useQueryClient();

	const { data: sites = [] } = useQuery( sitesQuery( 'all', { site_visibility: 'visible' } ) );

	// Fetch BigSky plugin status for all sites in parallel
	const bigSkyQueries = useQueries( {
		queries: sites.map( ( site ) => ( {
			...bigSkyPluginQuery( site.ID ),
			enabled: sites.length > 0,
		} ) ),
	} );

	// Track whether the last mutation was an "add" action (for spinner placement)
	const isAddingRef = useRef( false );

	const mutation = useMutation( {
		mutationFn: ( { siteId, enable } ) => updateBigSkyPlugin( siteId, { enable } ),
		onMutate: async ( { siteId, enable } ) => {
			await tanstackQueryClient.cancelQueries( {
				queryKey: bigSkyPluginQuery( siteId ).queryKey,
			} );
			const previousData = tanstackQueryClient.getQueryData( bigSkyPluginQuery( siteId ).queryKey );
			tanstackQueryClient.setQueryData( bigSkyPluginQuery( siteId ).queryKey, ( old ) =>
				old ? { ...old, enabled: enable } : old
			);
			return { previousData, siteId };
		},
		onSuccess: () => {
			reduxDispatch(
				successNotice( translate( 'AI assistant settings saved.' ), {
					id: 'bigsky-settings-saved',
				} )
			);
		},
		onError: ( _err, _vars, context ) => {
			if ( context?.previousData !== undefined ) {
				tanstackQueryClient.setQueryData(
					bigSkyPluginQuery( context.siteId ).queryKey,
					context.previousData
				);
			}
			reduxDispatch(
				errorNotice( translate( 'Failed to save AI assistant settings.' ), {
					id: 'bigsky-settings-error',
				} )
			);
		},
		onSettled: ( _data, _err, { siteId } ) => {
			tanstackQueryClient.invalidateQueries( { queryKey: bigSkyPluginQuery( siteId ).queryKey } );
			tanstackQueryClient.invalidateQueries( siteQueryFilter( siteId ) );
		},
	} );

	// Build lists of enabled and disabled sites
	const enabledSites = [];
	const disabledSites = [];
	const unavailableSites = [];

	sites.forEach( ( site, index ) => {
		const result = bigSkyQueries[ index ];
		if ( ! result?.data ) {
			return;
		}
		const { enabled, available } = result.data;
		const name = getSiteDisplayName( site );
		const domain = site.URL ? site.URL.replace( /^https?:\/\//, '' ) : '';
		const slug = site.slug || domain;
		const iconUrl = site.icon?.img || site.icon?.ico || null;
		const entry = { id: site.ID, name, domain, slug, available, iconUrl };

		if ( ! available ) {
			unavailableSites.push( entry );
		} else if ( enabled ) {
			enabledSites.push( entry );
		} else {
			disabledSites.push( entry );
		}
	} );

	// Determine mode based on whether more sites are enabled or disabled.
	// Lock the mode on first meaningful calculation so adding/removing exceptions
	// doesn't flip the page mode mid-interaction.
	const lockedModeRef = useRef( null );
	const computedIsGlobalOn = enabledSites.length > 0 && enabledSites.length >= disabledSites.length;
	if ( lockedModeRef.current === null && ( enabledSites.length > 0 || disabledSites.length > 0 ) ) {
		lockedModeRef.current = computedIsGlobalOn;
	}
	const isGlobalOn = lockedModeRef.current ?? computedIsGlobalOn;

	const eligibleSearchPool = isGlobalOn ? enabledSites : disabledSites;
	const searchPool = isGlobalOn
		? eligibleSearchPool
		: [ ...eligibleSearchPool, ...unavailableSites ];
	const listedSites = isGlobalOn ? disabledSites : enabledSites;

	const siteOptions =
		searchPool.length > 0
			? searchPool.map( ( site ) => ( {
					value: String( site.id ),
					label: site.name,
					...( ! site.available && { badge: translate( 'Available on paid plans' ) } ),
			  } ) )
			: [ { value: '', label: translate( 'No eligible sites.' ) } ];

	const handleSiteSelect = ( value ) => {
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
			window.location.href = addQueryArgs( 'https://wordpress.com/setup/plan-upgrade/', {
				siteSlug: selectedSite.slug,
			} );
			return;
		}

		isAddingRef.current = true;
		if ( document.activeElement ) {
			document.activeElement.blur();
		}
		mutation.mutate( { siteId, enable: ! isGlobalOn } );
	};

	const handleRemoveSite = ( siteId ) => {
		isAddingRef.current = false;
		mutation.mutate( { siteId, enable: isGlobalOn } );
	};

	// Page copy depends on mode
	const pageTitle = isGlobalOn
		? translate( 'AI assistant exceptions' )
		: translate( 'Add AI assistant to sites' );
	const searchTitle = isGlobalOn ? translate( 'Add an exception' ) : translate( 'Add a site' );
	let searchDescription;
	if ( isGlobalOn ) {
		searchDescription = translate( 'Search for eligible sites to disable the AI assistant.' );
	} else {
		searchDescription = translate(
			'The WordPress AI assistant is disabled. Add it to individual sites here.'
		);
	}
	const listTitle = isGlobalOn ? translate( 'Restricted sites' ) : translate( 'Enabled sites' );
	const listDescription = isGlobalOn
		? translate( 'These sites will not have the AI assistant.' )
		: translate( 'These sites have the AI assistant enabled.' );

	return (
		<Main wideLayout className="mcp-ai-assistant">
			<PageViewTracker path={ path } title="MCP AI Assistant" />
			<DocumentHead title={ pageTitle } />
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'AI and MCP' ) }
				subtitle={ translate(
					'Control how AI assistants interact with your WordPress.com account and sites.'
				) }
			/>
			<HeaderCake backText={ translate( 'Back' ) } backHref="/me/mcp">
				{ pageTitle }
			</HeaderCake>
			<VStack spacing={ 6 }>
				<Card isRounded={ false } style={ { borderRadius: 0 } }>
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

							<SiteCombobox
								sites={ sites }
								options={ siteOptions }
								onChange={ handleSiteSelect }
								placeholder={ translate( 'Search for a site\u2026' ) }
								label={ translate( 'Search sites' ) }
								disabled={ mutation.isPending }
							/>
						</VStack>
					</CardBody>
				</Card>

				{ listedSites.length > 0 && (
					<VStack spacing={ 4 }>
						<SectionHeader level={ 3 } title={ listTitle } description={ listDescription } />
						{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
						<div className="mcp-square-corners">
							<style>{ '.mcp-square-corners .action-list { border-radius: 0; }' }</style>
							<ActionList>
								{ listedSites.map( ( site ) => {
									const fullSite = sites.find( ( s ) => s.ID === site.id );
									return (
										<ActionList.ActionItem
											key={ site.id }
											decoration={
												fullSite ? <SiteIcon site={ fullSite } size={ 32 } /> : undefined
											}
											title={ site.name }
											description={ site.domain }
											actions={
												<Button
													variant="secondary"
													size="compact"
													disabled={ mutation.isPending }
													onClick={ () => handleRemoveSite( site.id ) }
												>
													{ translate( 'Remove' ) }
												</Button>
											}
										/>
									);
								} ) }
							</ActionList>
						</div>
					</VStack>
				) }
			</VStack>
		</Main>
	);
}
