/**
 * MCP Sites — Site exceptions page
 * Legacy port of: client/dashboard/me/mcp/sites/index.tsx
 */
import {
	bigSkyPluginQuery,
	sitesQuery,
	userSettingsQuery,
	userSettingsMutation,
} from '@automattic/api-queries';
import { useQueries, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button, Spinner } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useRef, useReducer } from 'react';
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
import {
	getDisabledSiteIds,
	getEnabledSiteIds,
	hasEnabledAccountTools,
	addLocalEnabledSiteId,
	removeLocalEnabledSiteId,
} from './utils';

import './style.scss';

function getSiteDisplayName( site ) {
	return site.name || site.URL?.replace( /^https?:\/\//, '' ) || String( site.ID );
}

export default function McpSites( { path } ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const tanstackQueryClient = useQueryClient();

	const { data: sites = [] } = useQuery( sitesQuery( 'all', { site_visibility: 'visible' } ) );
	const { data: userSettings } = useQuery( userSettingsQuery() );

	// Fetch BigSky plugin status to determine site eligibility (paid plan check)
	const bigSkyQueries = useQueries( {
		queries: sites.map( ( site ) => ( {
			...bigSkyPluginQuery( site.ID ),
			enabled: sites.length > 0,
		} ) ),
	} );

	// Build a map of site ID → available
	const siteAvailability = new Map();
	sites.forEach( ( site, index ) => {
		const result = bigSkyQueries[ index ];
		if ( result?.data ) {
			siteAvailability.set( site.ID, result.data.available );
		}
	} );

	const isGlobalOn = hasEnabledAccountTools( userSettings || {} );
	const disabledSiteIds = getDisabledSiteIds( userSettings || {} );
	const enabledSiteIds = getEnabledSiteIds( userSettings || {} );

	const mapSiteIds = ( siteIds ) =>
		siteIds.map( ( siteId ) => {
			const site = sites.find( ( siteEntry ) => siteEntry.ID === siteId );
			const name = site ? getSiteDisplayName( site ) : `Site ID: ${ siteId }`;
			const domain = site?.URL ? site.URL.replace( /^https?:\/\//, '' ) : '';
			const iconUrl = site?.icon?.img || site?.icon?.ico || null;
			return { id: siteId, name, domain, iconUrl };
		} );

	const disabledSites = mapSiteIds( disabledSiteIds );
	const enabledSites = mapSiteIds( enabledSiteIds );

	// In "global on" mode: list disabled sites (exceptions). Search pool = non-disabled sites.
	// In "global off" mode: list enabled sites (added). Search pool = non-enabled sites.
	const listedSites = isGlobalOn ? disabledSites : enabledSites;
	const excludedSiteIds = isGlobalOn ? disabledSiteIds : enabledSiteIds;

	// Force re-render after localStorage writes (prototype).
	const [ , forceUpdate ] = useReducer( ( x ) => x + 1, 0 );

	// Track whether the last mutation was an "add" action (for spinner placement)
	const isAddingRef = useRef( false );

	const mutation = useMutation( {
		...userSettingsMutation(),
		onSuccess: ( newData ) => {
			tanstackQueryClient.setQueryData( userSettingsQuery().queryKey, newData );
			reduxDispatch(
				successNotice( translate( 'MCP settings saved.' ), { id: 'mcp-settings-saved' } )
			);
		},
		onError: () => {
			reduxDispatch(
				errorNotice( translate( 'Failed to save MCP settings.' ), {
					id: 'mcp-settings-error',
				} )
			);
		},
	} );

	// ComboboxControl options — exclude already-listed sites.
	// In "add" mode, include unavailable sites with "Upgrade required" badge.
	// In "exceptions" mode, exclude unavailable sites entirely.
	const siteOptions = sites
		.filter( ( site ) => {
			if ( excludedSiteIds.includes( site.ID ) ) {
				return false;
			}
			// In exceptions mode, only show available (paid plan) sites.
			if ( isGlobalOn ) {
				const available = siteAvailability.get( site.ID );
				if ( available === false ) {
					return false;
				}
			}
			return true;
		} )
		.map( ( site ) => {
			const available = siteAvailability.get( site.ID ) ?? true;
			return {
				value: String( site.ID ),
				label: getSiteDisplayName( site ),
				...( ! isGlobalOn && ! available && { badge: translate( 'Available on paid plans' ) } ),
			};
		} );

	const handleSiteSelect = ( value ) => {
		if ( ! value ) {
			return;
		}
		const siteId = Number( value );
		if ( isNaN( siteId ) ) {
			return;
		}

		// Check if this site needs an upgrade (only in "add" mode)
		if ( ! isGlobalOn ) {
			const available = siteAvailability.get( siteId );
			if ( available === false ) {
				const site = sites.find( ( s ) => s.ID === siteId );
				const slug = site?.slug || site?.URL?.replace( /^https?:\/\//, '' ) || '';
				window.location.href = addQueryArgs( 'https://wordpress.com/setup/plan-upgrade/', {
					siteSlug: slug,
				} );
				return;
			}
		}

		isAddingRef.current = true;
		if ( document.activeElement ) {
			document.activeElement.blur();
		}
		if ( isGlobalOn ) {
			// Global on → disable (add exception) via API.
			mutation.mutate( {
				mcp_abilities: {
					sites: [ { blog_id: siteId, account_tools_enabled: false } ],
				},
			} );
		} else {
			// Global off → persist in localStorage (prototype).
			addLocalEnabledSiteId( siteId );
			forceUpdate();
		}
	};

	const handleRemoveSite = ( siteId ) => {
		isAddingRef.current = false;
		if ( isGlobalOn ) {
			// Global on → re-enable (remove exception) via API.
			mutation.mutate( {
				mcp_abilities: {
					sites: [ { blog_id: siteId, account_tools_enabled: true } ],
				},
			} );
		} else {
			// Global off → remove from localStorage (prototype).
			removeLocalEnabledSiteId( siteId );
			forceUpdate();
		}
	};

	// Page copy depends on mode
	const pageTitle = isGlobalOn
		? translate( 'External AI access exceptions' )
		: translate( 'Add MCP to specific sites' );
	const searchTitle = isGlobalOn ? translate( 'Add an exception' ) : translate( 'Add a site' );
	const searchDescription = isGlobalOn
		? translate( 'Search for sites to disable external AI access.' )
		: translate( 'Search for a site to enable MCP access.' );
	const listTitle = isGlobalOn ? translate( 'Restricted sites' ) : translate( 'Enabled sites' );
	const listDescription = isGlobalOn
		? translate( 'These sites will not have MCP access.' )
		: translate( 'These sites have MCP access enabled.' );

	return (
		<Main wideLayout className="mcp-sites">
			<PageViewTracker path={ path } title="MCP Sites" />
			<DocumentHead title={ pageTitle } />
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'AI and MCP' ) }
				subtitle={ translate(
					'Control how AI agents interact with your WordPress.com account and sites.'
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
									const adminUrl = fullSite?.options?.admin_url;
									return (
										<ActionList.ActionItem
											key={ site.id }
											decoration={
												fullSite ? <SiteIcon site={ fullSite } size={ 32 } /> : undefined
											}
											title={ site.name }
											description={ site.domain }
											actions={
												<>
													{ ! isGlobalOn && adminUrl && (
														<Button
															variant="tertiary"
															size="compact"
															href={ `${ adminUrl }admin.php?page=my-jetpack#/jetpack-ai` }
															target="_blank"
															rel="noreferrer noopener"
														>
															{ translate( 'Manage' ) }
														</Button>
													) }
													<Button
														variant="secondary"
														size="compact"
														disabled={ mutation.isPending }
														onClick={ () => handleRemoveSite( site.id ) }
													>
														{ translate( 'Remove' ) }
													</Button>
												</>
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
