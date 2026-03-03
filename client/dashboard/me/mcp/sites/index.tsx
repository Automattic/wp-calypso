import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useRef, useReducer } from 'react';
import {
	getDisabledSiteIds,
	getEnabledSiteIds,
	hasEnabledAccountTools,
	addLocalEnabledSiteId,
	removeLocalEnabledSiteId,
} from '../../../../me/mcp/utils';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useAppContext } from '../../../app/context';
import { ActionList } from '../../../components/action-list';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import SiteIcon from '../../../components/site-icon';
import { getSiteDisplayName } from '../../../utils/site-name';
import SiteCombobox from '../site-combobox';
import type { Site } from '@automattic/api-core';

export default function McpSites() {
	const { queries } = useAppContext();
	const sitesQueryResult = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);
	const sites = ( sitesQueryResult.data as Site[] | undefined ) ?? [];
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const isGlobalOn = hasEnabledAccountTools( userSettings || {} );
	const disabledSiteIds = getDisabledSiteIds( userSettings || {} );
	const enabledSiteIds = getEnabledSiteIds( userSettings || {} );

	const mapSiteIds = ( siteIds: number[] ) =>
		siteIds.map( ( siteId ) => {
			const site = sites.find( ( siteEntry ) => siteEntry.ID === siteId );
			const name = site ? getSiteDisplayName( site ) : `Site ID: ${ siteId }`;
			const domain = site?.URL ? site.URL.replace( /^https?:\/\//, '' ) : '';
			return { id: siteId, name, domain };
		} );

	const disabledSites = mapSiteIds( disabledSiteIds );
	const enabledSites = mapSiteIds( enabledSiteIds );

	// In "global on" mode: list disabled sites (exceptions). Search pool = non-disabled sites.
	// In "global off" mode: list enabled sites (added). Search pool = non-enabled sites.
	const listedSites = isGlobalOn ? disabledSites : enabledSites;
	const excludedSiteIds = isGlobalOn ? disabledSiteIds : enabledSiteIds;

	// Force re-render after localStorage writes (prototype).
	const [ , forceUpdate ] = useReducer( ( x: number ) => x + 1, 0 );

	// Track whether the last mutation was an "add" action (for spinner placement)
	const isAddingRef = useRef( false );

	const mutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
		},
	} );

	// ComboboxControl options — exclude already-listed sites.
	const siteOptions = sites
		.filter( ( site ) => ! excludedSiteIds.includes( site.ID ) )
		.map( ( site ) => ( {
			value: String( site.ID ),
			label: getSiteDisplayName( site ),
		} ) );

	const handleSiteSelect = ( value: string | null | undefined ) => {
		if ( ! value ) {
			return;
		}
		const siteId = Number( value );
		if ( isNaN( siteId ) ) {
			return;
		}
		isAddingRef.current = true;
		if ( document.activeElement instanceof HTMLElement ) {
			document.activeElement.blur();
		}
		if ( isGlobalOn ) {
			// Global on → disable (add exception) via API.
			mutation.mutate( {
				mcp_abilities: {
					sites: [ { blog_id: siteId, account_tools_enabled: false } ],
				},
			} as any );
		} else {
			// Global off → persist in localStorage (prototype).
			addLocalEnabledSiteId( siteId );
			forceUpdate();
		}
	};

	const handleRemoveSite = ( siteId: number ) => {
		isAddingRef.current = false;
		if ( isGlobalOn ) {
			// Global on → re-enable (remove exception) via API.
			mutation.mutate( {
				mcp_abilities: {
					sites: [ { blog_id: siteId, account_tools_enabled: true } ],
				},
			} as any );
		} else {
			// Global off → remove from localStorage (prototype).
			removeLocalEnabledSiteId( siteId );
			forceUpdate();
		}
	};

	// Page copy depends on mode
	const pageTitle = isGlobalOn
		? __( 'External AI access exceptions' )
		: __( 'Add MCP to specific sites' );
	const pageDescription = isGlobalOn
		? __(
				'External AI access is enabled on all your sites. Add exceptions for specific sites here.'
		  )
		: __( 'MCP access is disabled at the account level. Add it to individual sites here.' );
	const searchTitle = isGlobalOn ? __( 'Add an exception' ) : __( 'Add a site' );
	const searchDescription = isGlobalOn
		? __( 'Search for sites to disable external AI access.' )
		: __( 'Search for a site to enable MCP access.' );
	const listTitle = isGlobalOn ? __( 'Restricted sites' ) : __( 'Enabled sites' );
	const listDescription = isGlobalOn
		? __( 'These sites will not have MCP access.' )
		: __( 'These sites have MCP access enabled.' );

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

							<SiteCombobox
								sites={ sites }
								options={ siteOptions }
								onChange={ handleSiteSelect }
								placeholder={ __( 'Search for a site\u2026' ) }
								label={ __( 'Search sites' ) }
								disabled={ mutation.isPending }
							/>
						</VStack>
					</CardBody>
				</Card>

				{ listedSites.length > 0 && (
					<VStack spacing={ 4 }>
						<SectionHeader level={ 3 } title={ listTitle } description={ listDescription } />
						<ActionList>
							{ listedSites.map( ( site ) => {
								const fullSite = sites.find( ( s ) => s.ID === site.id );
								const adminUrl = fullSite?.options?.admin_url;
								return (
									<ActionList.ActionItem
										key={ site.id }
										decoration={ fullSite ? <SiteIcon site={ fullSite } size={ 32 } /> : undefined }
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
														{ __( 'Manage' ) }
													</Button>
												) }
												<Button
													variant="secondary"
													size="compact"
													disabled={ mutation.isPending }
													onClick={ () => handleRemoveSite( site.id ) }
												>
													{ __( 'Remove' ) }
												</Button>
											</>
										}
									/>
								);
							} ) }
						</ActionList>
					</VStack>
				) }
			</VStack>
		</PageLayout>
	);
}
