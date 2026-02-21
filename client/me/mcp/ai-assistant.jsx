/**
 * MCP AI Assistant — AI assistant site exceptions page
 * Legacy port of: client/dashboard/me/mcp/ai-assistant/index.tsx
 */
import { updateBigSkyPlugin } from '@automattic/api-core';
import {
	bigSkyPluginQuery,
	queryClient,
	sitesQuery,
	siteQueryFilter,
} from '@automattic/api-queries';
import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	ComboboxControl,
	Button,
	Spinner,
} from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { ActionList } from '../../dashboard/components/action-list';
import { Card, CardBody } from '../../dashboard/components/card';
import { SectionHeader } from '../../dashboard/components/section-header';

function getSiteDisplayName( site ) {
	return site.name || site.URL?.replace( /^https?:\/\//, '' ) || String( site.ID );
}

export default function McpAiAssistant( { path } ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();

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
		onSuccess: ( _data, { siteId } ) => {
			queryClient.invalidateQueries( { queryKey: bigSkyPluginQuery( siteId ).queryKey } );
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
			reduxDispatch(
				successNotice( translate( 'AI assistant settings saved.' ), {
					id: 'bigsky-settings-saved',
				} )
			);
		},
		onError: () => {
			reduxDispatch(
				errorNotice( translate( 'Failed to save AI assistant settings.' ), {
					id: 'bigsky-settings-error',
				} )
			);
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
		const entry = { id: site.ID, name, domain, slug, available };

		if ( ! available ) {
			unavailableSites.push( entry );
		} else if ( enabled ) {
			enabledSites.push( entry );
		} else {
			disabledSites.push( entry );
		}
	} );

	// Determine mode based on whether more sites are enabled or disabled.
	const isGlobalOn = enabledSites.length > 0 && enabledSites.length >= disabledSites.length;

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
						: `${ site.name } (${ translate( 'Upgrade to add assistant' ) })`,
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
	const searchDescription = isGlobalOn
		? translate( 'Search for eligible sites to disable the AI assistant.' )
		: translate( 'Search for a site to enable the AI assistant.' );
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
					'Control how AI assistants interact with your WordPress.com account and sites. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="mcp" showIcon={ false } />,
						},
					}
				) }
			/>
			<HeaderCake backText={ translate( 'Back' ) } backHref="/me/mcp">
				{ pageTitle }
			</HeaderCake>
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
									label={ translate( 'Search sites' ) }
									hideLabelFromVision
									value={ null }
									onChange={ handleSiteSelect }
									options={ siteOptions }
									placeholder={ translate( 'Search for a site\u2026' ) }
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
											{ translate( 'Remove' ) }
										</Button>
									}
								/>
							) ) }
						</ActionList>
					</VStack>
				) }
			</VStack>
		</Main>
	);
}
