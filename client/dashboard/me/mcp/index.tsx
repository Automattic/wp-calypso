import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery, useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ToggleControl,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { getAccountMcpAbilities, getSiteAccountToolsEnabled } from '../../../me/mcp/utils';
import { useAppContext } from '../../app/context';
import { Card, CardBody } from '../../components/card';
import ComponentViewTracker from '../../components/component-view-tracker';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import PreferencesLoginSiteDropdown from '../preferences-primary-site/site-dropdown';
import { CATEGORY_ORDER, getDisplayCategory } from './categories';
import type { Site } from '@automattic/api-core';

interface McpAbility {
	title: string;
	description: string;
	enabled: boolean;
	category?: string;
}

interface McpSite {
	blog_id: number;
	account_tools_enabled?: boolean;
	abilities?: Record< string, unknown >;
}

function McpComponent() {
	const queryClient = useQueryClient();
	const { queries } = useAppContext();
	const sitesQueryResult = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);
	const sites = ( sitesQueryResult.data as Site[] | undefined ) ?? [];
	const isLoadingSites = sitesQueryResult.isLoading;
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	// Site selector state for disabling MCP access on specific sites
	const [ selectedSiteId, setSelectedSiteId ] = useState< number | null >( null );

	// Use the standard userSettingsMutation with snackbar notifications
	const mutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
		},
		onSuccess: ( newData: any ) => {
			// Update the cache with the new data from the API response
			queryClient.setQueryData( userSettingsQuery().queryKey, newData as any );
		},
	} );

	// Get account-level tools from user settings using the new nested structure
	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const availableTools = Object.entries( mcpAbilities );
	const hasTools = availableTools.length > 0;

	// Check if any tools are enabled (for master toggle state)
	const anyToolsEnabled =
		hasTools && Object.values( mcpAbilities ).some( ( tool ) => tool.enabled );

	const handleToolChange = ( toolId: string, enabled: boolean ) => {
		// Create minimal payload with only the changed tool (just boolean)
		const payload = {
			mcp_abilities: {
				account: {
					[ toolId ]: enabled,
				},
			},
		};
		mutation.mutate( payload as any );
	};

	const handleMasterToggle = ( enabled: boolean ) => {
		// Create payload with all tools set to the same state (just booleans)
		const accountAbilities: Record< string, boolean > = {};
		Object.keys( mcpAbilities ).forEach( ( toolId ) => {
			accountAbilities[ toolId ] = enabled;
		} );

		const payload = {
			mcp_abilities: {
				account: accountAbilities,
			},
		};
		mutation.mutate( payload as any );
	};

	// Group tools by display category
	const groupToolsByCategory = (
		tools: Array< [ string, McpAbility ] >
	): Record< string, Array< [ string, McpAbility ] > > => {
		const grouped: Record< string, Array< [ string, McpAbility ] > > = {};

		tools.forEach( ( [ toolId, tool ] ) => {
			const displayCategory = getDisplayCategory( toolId );
			if ( ! grouped[ displayCategory ] ) {
				grouped[ displayCategory ] = [];
			}
			grouped[ displayCategory ].push( [ toolId, tool ] );
		} );

		return grouped;
	};

	const handleSiteDropdownChange = ( value: string | null | undefined ) => {
		setSelectedSiteId( value ? Number( value ) : null );
	};

	const handleSiteToggle = ( siteId: number, enabled: boolean ) => {
		// Get current sites array from nested structure
		const currentSites = ( userSettings?.mcp_abilities?.sites as McpSite[] | undefined ) || [];

		// Find existing site entry
		const siteIndex = currentSites.findIndex( ( site: McpSite ) => site.blog_id === siteId );

		let newSites;
		if ( enabled ) {
			// Enabling: remove from sites array (use defaults)
			if ( siteIndex >= 0 ) {
				// Remove the site entry entirely
				newSites = currentSites.filter( ( _site: McpSite, index: number ) => index !== siteIndex );
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
					blog_id: siteId,
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
				blog_id: siteId,
				account_tools_enabled: true,
			} );
		} else {
			// Disabling: send the site with account_tools_enabled: false
			sitesPayload.push( {
				blog_id: siteId,
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
		mutation.mutate( payload as any );
	};

	// Helper function to render tools section with categories
	const renderToolsSection = ( tools: Array< [ string, McpAbility ] > ) => {
		if ( ! tools || tools.length === 0 ) {
			return null;
		}

		const groupedTools = groupToolsByCategory( tools );

		return (
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'What the AI can access' ) }
							description={ __(
								'Control which parts of your account and sites the AI is allowed to use.'
							) }
						/>

						{ /* Render tools grouped by category */ }
						<VStack spacing={ 4 }>
							{ CATEGORY_ORDER.map( ( categoryName ) => {
								const categoryTools = groupedTools[ categoryName ];
								if ( ! categoryTools || categoryTools.length === 0 ) {
									return null;
								}

								return (
									<VStack key={ categoryName } spacing={ 4 }>
										<Text
											as="h4"
											size="x-small"
											weight={ 500 }
											style={ { textTransform: 'uppercase' } }
										>
											{ categoryName }
										</Text>
										<VStack spacing={ 4 }>
											{ categoryTools.map( ( [ toolId, tool ]: [ string, McpAbility ] ) => (
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
								);
							} ) }
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
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<HStack justify="space-between" alignment="top">
								<SectionHeader
									level={ 3 }
									title={ __( 'AI Access' ) }
									description={ __(
										'Control what AI assistants can access your WordPress.com account and sites.'
									) }
								/>
								<VStack style={ { flexShrink: 0 } }>
									<Link to="/me/mcp/setup">
										<Button variant="secondary" disabled={ ! anyToolsEnabled }>
											{ __( 'Configure MCP Client' ) }
										</Button>
									</Link>
								</VStack>
							</HStack>

							<ToggleControl
								__nextHasNoMarginBottom
								checked={ anyToolsEnabled }
								onChange={ handleMasterToggle }
								label={
									<Text>
										{ anyToolsEnabled ? __( 'Disable AI Access' ) : __( 'Enable AI Access' ) }
									</Text>
								}
							/>
						</VStack>
					</CardBody>
				</Card>

				{ /* Site-Specific Settings */ }
				{ hasTools && anyToolsEnabled && (
					<Card>
						<CardBody>
							<VStack spacing={ 4 }>
								<SectionHeader
									level={ 3 }
									title={ __( 'Site-specific MCP settings' ) }
									description={ __(
										'Choose a site to block AI access for all users on that site. This overrides your account settings.'
									) }
								/>

								<PreferencesLoginSiteDropdown
									sites={ sites }
									value={ selectedSiteId !== null ? String( selectedSiteId ) : '' }
									onChange={ handleSiteDropdownChange }
									label={ __( 'Select a site to disable AI access' ) }
									isLoading={ isLoadingSites }
								/>

								{ selectedSiteId !== null && anyToolsEnabled && (
									<ToggleControl
										__nextHasNoMarginBottom
										checked={ getSiteAccountToolsEnabled( userSettings || {}, selectedSiteId ) }
										disabled={ mutation.isPending }
										onChange={ ( enabled ) => handleSiteToggle( selectedSiteId, enabled ) }
										label={
											<Text>
												{ getSiteAccountToolsEnabled( userSettings || {}, selectedSiteId )
													? __( 'Disable AI access for this site' )
													: __( 'Enable AI access for this site' ) }
											</Text>
										}
									/>
								) }
							</VStack>
						</CardBody>
					</Card>
				) }

				{ /* Account Tools Sections */ }
				{ hasTools && renderToolsSection( accountToolsToShow ) }
			</VStack>
		);
	};

	// Check if MCP settings feature is enabled
	if ( ! config.isEnabled( 'mcp-settings' ) ) {
		return null;
	}

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'MCP' ) }
					description={ createInterpolateElement(
						__(
							'MCP (Model Context Protocol) enables AI assistants to securely access and interact with your WordPress.com data. <learnMoreLink/>'
						),
						{
							learnMoreLink: <InlineSupportLink supportContext="mcp" />,
						}
					) }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_mcp_view" />
			{ renderContent() }
		</PageLayout>
	);
}

export default McpComponent;
