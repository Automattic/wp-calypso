import { sitesQuery, userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { SectionHeader } from '../../dashboard/components/section-header';
import PreferencesLoginSiteDropdown from '../../dashboard/me/preferences-login/site-dropdown';
import { getAccountMcpAbilities, getSiteAccountToolsEnabled } from './utils';

function McpComponent( { path } ) {
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const { data: sites = [] } = useQuery( sitesQuery( { site_visibility: 'visible' } ) );
	const {
		data: userSettings,
		isLoading: isLoadingUserSettings,
		error: userSettingsError,
	} = useQuery( userSettingsQuery() );

	// Site selector state for disabling MCP access on specific sites
	const [ selectedSiteId, setSelectedSiteId ] = useState( '' );

	// Use the standard userSettingsMutation with simple auto-save
	const mutation = useMutation( {
		...userSettingsMutation(),
		onSuccess: ( newData ) => {
			// Update the cache with the new data from the API response
			queryClient.setQueryData( userSettingsQuery().queryKey, newData );
			// Show success notification using Redux dispatch with unique ID to prevent stacking
			dispatch( successNotice( translate( 'MCP settings saved.' ), { id: 'mcp-settings-saved' } ) );
		},
		// eslint-disable-next-line no-unused-vars
		onError: ( error ) => {
			// Show error notification using Redux dispatch with unique ID to prevent stacking
			dispatch(
				errorNotice( translate( 'Failed to save MCP settings.' ), { id: 'mcp-settings-error' } )
			);
		},
	} );

	// Handle loading and error states
	if ( isLoadingUserSettings || userSettingsError ) {
		return null;
	}

	// Get account-level tools from user settings using the new nested structure
	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const availableTools = Object.entries( mcpAbilities );
	const hasTools = availableTools.length > 0;

	// Check if any tools are enabled (for master toggle state)
	const anyToolsEnabled =
		hasTools && Object.values( mcpAbilities ).some( ( tool ) => tool.enabled );

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
				newSites = currentSites.filter( ( site, index ) => index !== siteIndex );
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

		// For the API payload, we need to send the site being toggled as an array
		// The API expects sites to be an array with blog_id fields
		const sitesPayload = [];
		if ( enabled ) {
			// Enabling: send the site with account_tools_enabled: true
			sitesPayload.push( {
				blog_id: parseInt( siteId ),
				account_tools_enabled: true,
			} );
		} else {
			// Disabling: send the site with account_tools_enabled: false
			sitesPayload.push( {
				blog_id: parseInt( siteId ),
				account_tools_enabled: false,
			} );
		}

		// Only include sites in payload if there are any sites to send
		// Don't include account object - only send the sites being changed
		const payload = {
			mcp_abilities: {
				...( sitesPayload.length > 0 && { sites: sitesPayload } ),
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
							description={ translate( 'Choose which AI tools you want to use.' ) }
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
									'Control which MCP tools can access your WordPress.com account and sites.'
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
										'Choose a site to block all MCP tools for all users on that site. This overrides your account settings.'
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
										checked={ getSiteAccountToolsEnabled( userSettings || {}, selectedSiteId ) }
										disabled={ mutation.isPending }
										onChange={ ( enabled ) => handleSiteToggle( selectedSiteId, enabled ) }
										label={
											<Text weight="bold">
												{ getSiteAccountToolsEnabled( userSettings || {}, selectedSiteId )
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

	// Check if MCP settings feature is enabled
	if ( ! config.isEnabled( 'mcp-settings' ) ) {
		return null;
	}

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
			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
			{ renderContent() }
		</Main>
	);
}

export default McpComponent;
