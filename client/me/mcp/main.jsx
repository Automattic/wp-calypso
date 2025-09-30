import {
	isAutomatticianQuery,
	sitesQuery,
	userSettingsQuery,
	userSettingsMutation,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ToggleControl,
	Card,
	CardBody,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { SectionHeader } from '../../dashboard/components/section-header';
import PreferencesLoginSiteDropdown from '../../dashboard/me/preferences-login/site-dropdown';
import { getAccountMcpAbilities, getSiteAccountToolsEnabled } from './utils';

function McpComponent( { path } ) {
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );
	const { data: sites = [] } = useQuery( sitesQuery( { site_visibility: 'visible' } ) );
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	// Use the standard userSettingsMutation with simple auto-save
	const mutation = useMutation( {
		...userSettingsMutation(),
		onSuccess: ( newData ) => {
			// Update the cache with the new data from the API response
			queryClient.setQueryData( userSettingsQuery().queryKey, newData );
		},
		meta: {
			snackbar: {
				success: translate( 'MCP settings saved.' ),
				error: translate( 'Failed to save MCP settings.' ),
			},
		},
	} );

	// Get account-level tools from user settings using the new nested structure
	const mcpAbilities = getAccountMcpAbilities( userSettings );
	const availableTools = Object.entries( mcpAbilities );
	const hasTools = availableTools.length > 0;

	// Site selector state for disabling MCP access on specific sites
	const [ selectedSiteId, setSelectedSiteId ] = useState( '' );

	// Check if any tools are enabled (for master toggle state)
	const anyToolsEnabled =
		hasTools && Object.values( mcpAbilities ).some( ( tool ) => tool.enabled );

	if ( ! isAutomattician ) {
		return null;
	}

	const handleToolChange = ( toolId, enabled ) => {
		// Create minimal payload with only the changed tool (just boolean)
		const payload = {
			mcp_abilities: {
				account: {
					[ toolId ]: enabled,
				},
			},
		};
		mutation.mutate( payload );
	};

	const handleMasterToggle = ( enabled ) => {
		// Create payload with all tools set to the same state (just booleans)
		const accountAbilities = {};
		Object.keys( mcpAbilities ).forEach( ( toolId ) => {
			accountAbilities[ toolId ] = enabled;
		} );

		const payload = {
			mcp_abilities: {
				account: accountAbilities,
			},
		};
		mutation.mutate( payload );
	};

	const handleSiteToggle = ( siteId, enabled ) => {
		// Get current sites array from nested structure
		const currentSites = userSettings?.mcp_abilities?.sites || [];

		// Find existing site entry
		const siteIndex = currentSites.findIndex( ( site ) => site.blog_id === parseInt( siteId ) );

		let newSites;
		if ( enabled ) {
			// Enabling: remove from sites array (use defaults)
			if ( siteIndex >= 0 ) {
				// Remove the site entry entirely
				newSites = currentSites.filter( ( _, index ) => index !== siteIndex );
			} else {
				// Site not in array, already using defaults
				newSites = currentSites;
			}
		} else if ( siteIndex >= 0 ) {
			// Disabling: update existing site entry
			newSites = [ ...currentSites ];
			newSites[ siteIndex ] = {
				...newSites[ siteIndex ],
				account_tools_enabled: false,
			};
		} else {
			// Disabling: add new site entry with override
			newSites = [
				...currentSites,
				{
					blog_id: parseInt( siteId ),
					account_tools_enabled: false,
					abilities: {},
				},
			];
		}

		// Create payload with updated sites array (minimal structure)
		const payload = {
			mcp_abilities: {
				sites: newSites,
			},
		};
		mutation.mutate( payload );
	};

	// Helper function to render tools section using ExtrasToggleCard pattern
	const renderToolsSection = ( tools ) => {
		if ( ! tools || tools.length === 0 ) {
			return null;
		}

		return (
			<Card isRounded={ false }>
				<CardBody>
					<VStack spacing={ 8 }>
						<SectionHeader
							level={ 3 }
							title={ translate( 'Available MCP Tools' ) }
							description={ translate(
								'Configure which MCP tools are available for your account.'
							) }
						/>

						{ /* Individual tool toggles */ }
						<VStack>
							{ tools.map( ( [ toolId, tool ] ) => (
								<ToggleControl
									key={ toolId }
									__nextHasNoMarginBottom
									checked={ tool.enabled }
									disabled={ mutation.isPending }
									label={ tool.title }
									help={ tool.description }
									onChange={ ( checked ) => handleToolChange( toolId, checked ) }
								/>
							) ) }
						</VStack>
					</VStack>
				</CardBody>
			</Card>
		);
	};

	const renderContent = () => {
		// Use mcpAbilities directly since we're using auto-save
		const accountToolsToShow = availableTools;

		return (
			<VStack spacing={ 8 }>
				{ /* MCP Tool Access Master Toggle */ }
				<Card isRounded={ false }>
					<CardBody>
						<VStack spacing={ 8 }>
							<SectionHeader
								level={ 3 }
								title={ translate( 'MCP Tool Access' ) }
								description={ translate(
									'Configure MCP access for your WordPress.com account. Enable access globally and control which tools are available.'
								) }
							/>

							<div
								style={ {
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								} }
							>
								<ToggleControl
									__nextHasNoMarginBottom
									checked={ anyToolsEnabled }
									onChange={ handleMasterToggle }
									label={
										<Text weight="bold">
											{ anyToolsEnabled
												? translate( 'Disable MCP Tool Access' )
												: translate( 'Enable MCP Tool Access' ) }
										</Text>
									}
								/>
								{ anyToolsEnabled && (
									<Button variant="secondary" href="/me/mcp-setup">
										{ translate( 'Configure MCP Client' ) }
									</Button>
								) }
							</div>
						</VStack>
					</CardBody>
				</Card>

				{ /* Account Tools Sections */ }
				{ hasTools && renderToolsSection( accountToolsToShow ) }

				{ /* Site-Specific Settings */ }
				{ hasTools && anyToolsEnabled && (
					<Card isRounded={ false }>
						<CardBody>
							<VStack spacing={ 8 }>
								<SectionHeader
									level={ 3 }
									title={ translate( 'Site-specific MCP settings' ) }
									description={ translate(
										'Select a site below to disable MCP access for that site only. This will override the global settings.'
									) }
								/>

								<PreferencesLoginSiteDropdown
									sites={ sites }
									value={ selectedSiteId }
									onChange={ setSelectedSiteId }
									label={ translate( 'Select a site to disable MCP access' ) }
									isLoading={ false }
								/>

								{ selectedSiteId && anyToolsEnabled && (
									<ToggleControl
										__nextHasNoMarginBottom
										checked={ getSiteAccountToolsEnabled( userSettings, selectedSiteId ) }
										disabled={ mutation.isPending }
										onChange={ ( enabled ) => handleSiteToggle( selectedSiteId, enabled ) }
										label={
											<Text weight="bold">
												{ getSiteAccountToolsEnabled( userSettings, selectedSiteId )
													? translate( 'Disable MCP access for this site' )
													: translate( 'Enable MCP access for this site' ) }
											</Text>
										}
									/>
								) }
							</VStack>
						</CardBody>
					</Card>
				) }
			</VStack>
		);
	};

	return (
		<Main wideLayout className="mcp">
			<PageViewTracker path={ path } title="MCP Account Settings" />
			<DocumentHead title={ translate( 'Model Context Protocol (MCP) Account Settings' ) } />
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'MCP Account Settings' ) }
				subtitle={ translate(
					'MCP (Model Context Protocol) enables AI assistants to securely access and interact with your WordPress.com data. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="mcp" showIcon={ false } />,
						},
					}
				) }
			/>
			{ renderContent() }
		</Main>
	);
}

export default McpComponent;
