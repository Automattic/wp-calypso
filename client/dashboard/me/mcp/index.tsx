import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ToggleControl,
	__experimentalHStack as HStack,
	FormTokenField,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import {
	getAccountMcpAbilities,
	getDisabledSiteIds,
	getSiteAccountToolsEnabled,
} from '../../../me/mcp/utils';
import { useAppContext } from '../../app/context';
import { Card, CardBody } from '../../components/card';
import ComponentViewTracker from '../../components/component-view-tracker';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { SectionHeader } from '../../components/section-header';
import { getSiteDisplayName } from '../../utils/site-name';
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
	const { queries } = useAppContext();
	const sitesQueryResult = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);
	const sites = ( sitesQueryResult.data as Site[] | undefined ) ?? [];
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	// Site selector state for disabling MCP access on specific sites
	const [ selectedSiteIds, setSelectedSiteIds ] = useState< number[] >( [] );
	const disabledSiteIds = getDisabledSiteIds( userSettings || {} );
	const disabledSites = disabledSiteIds.map( ( siteId ) => {
		const site = sites.find( ( siteEntry ) => siteEntry.ID === siteId );
		const name = site
			? getSiteDisplayName( site )
			: sprintf(
					/* translators: %s is the site ID. */
					__( 'Site ID: %s' ),
					String( siteId )
			  );
		const domain = site?.URL ? site.URL.replace( /^https?:\/\//, '' ) : '';

		return {
			id: siteId,
			name,
			domain,
		};
	} );

	// Use the standard userSettingsMutation with snackbar notifications
	const mutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
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

	// Convert sites to suggestions for FormTokenField
	// Format: "siteId|siteName" - ID for uniqueness, name for searchability
	// FormTokenField will automatically filter out already selected sites
	const siteSuggestions = sites.map( ( site ) => {
		const siteName = getSiteDisplayName( site );
		return `${ site.ID }|${ siteName }`;
	} );

	// Convert selected site IDs to token values (using the same format)
	const selectedSiteTokens = selectedSiteIds.map( ( siteId ) => {
		const site = sites.find( ( s ) => s.ID === siteId );
		if ( ! site ) {
			return String( siteId );
		}
		const siteName = getSiteDisplayName( site );
		return `${ siteId }|${ siteName }`;
	} );

	// Display transform to show site name (extract from "id|name" format)
	const displaySiteName = ( tokenValue: string ) => {
		// Extract site name from "id|name" format, or fallback to just the value
		const parts = tokenValue.split( '|' );
		return parts.length > 1 ? parts[ 1 ] : tokenValue;
	};

	const handleSiteTokensChange = ( tokens: ( string | { value: string; title?: string } )[] ) => {
		// Convert token values (format: "id|name") back to site IDs
		// FormTokenField can return either string[] or TokenItem[], so we normalize to strings
		const tokenStrings = tokens.map( ( token ) =>
			typeof token === 'string' ? token : token.value
		);
		const newSiteIds = tokenStrings
			.map( ( token ) => {
				// Extract site ID from "id|name" format
				const parts = token.split( '|' );
				const siteId = Number( parts[ 0 ] );
				return isNaN( siteId ) ? undefined : siteId;
			} )
			.filter( ( id ): id is number => id !== undefined );
		setSelectedSiteIds( newSiteIds );
	};

	const handleAllSitesToggle = ( enabled: boolean ) => {
		// Get current sites array from nested structure
		const currentSites = ( userSettings?.mcp_abilities?.sites as McpSite[] | undefined ) || [];

		// Build the new sites array by processing all selected sites
		let newSites = [ ...currentSites ];

		selectedSiteIds.forEach( ( siteId ) => {
			const siteIndex = newSites.findIndex( ( site: McpSite ) => site.blog_id === siteId );

			if ( enabled ) {
				// Enabling: remove from sites array (use defaults)
				if ( siteIndex >= 0 ) {
					// Remove the site entry entirely
					newSites = newSites.filter( ( _site: McpSite, index: number ) => index !== siteIndex );
				}
			} else if ( siteIndex >= 0 ) {
				// Disabling: update existing site entry
				newSites[ siteIndex ] = {
					...newSites[ siteIndex ],
					account_tools_enabled: false,
				};
			} else {
				// Disabling: add new site entry with override
				newSites.push( {
					blog_id: siteId,
					account_tools_enabled: false,
					abilities: {},
				} );
			}
		} );

		// For the API payload, send all selected sites
		const sitesPayload = selectedSiteIds.map( ( siteId ) => ( {
			blog_id: siteId,
			account_tools_enabled: enabled,
		} ) );

		// Only include sites in payload if there are any sites to send
		const payload = {
			mcp_abilities: {
				...( sitesPayload.length > 0 && { sites: sitesPayload } ),
			},
		};
		mutation.mutate( payload as any );
	};

	const handleSiteToggle = ( siteId: number, enabled: boolean ) => {
		const payload = {
			mcp_abilities: {
				sites: [
					{
						blog_id: siteId,
						account_tools_enabled: enabled,
					},
				],
			},
		};

		mutation.mutate( payload as any );
	};

	// Check if all selected sites have AI access enabled
	const allSelectedSitesEnabled =
		selectedSiteIds.length > 0
			? selectedSiteIds.every( ( siteId ) =>
					getSiteAccountToolsEnabled( userSettings || {}, siteId )
			  )
			: false;

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
											size="11px"
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
									<RouterLinkButton
										to="/me/mcp/setup"
										variant="secondary"
										disabled={ ! anyToolsEnabled }
									>
										{ __( 'Configure MCP Client' ) }
									</RouterLinkButton>
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
										'Choose sites to manage AI access for all users on those sites. This overrides your account settings.'
									) }
								/>

								<FormTokenField
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={ __( 'Select sites to manage AI access' ) }
									value={ selectedSiteTokens }
									suggestions={ siteSuggestions }
									onChange={ handleSiteTokensChange }
									displayTransform={ displaySiteName }
									placeholder={ __( 'Type to search and select sites…' ) }
									__experimentalShowHowTo={ false }
									__experimentalExpandOnFocus
								/>

								{ selectedSiteIds.length > 0 && (
									<ToggleControl
										__nextHasNoMarginBottom
										checked={ allSelectedSitesEnabled }
										disabled={ mutation.isPending }
										onChange={ handleAllSitesToggle }
										label={
											<Text>
												{ allSelectedSitesEnabled
													? __( 'Disable AI access for selected sites' )
													: __( 'Enable AI access for selected sites' ) }
											</Text>
										}
									/>
								) }
								{ disabledSites.length > 0 && (
									<VStack spacing={ 4 }>
										<SectionHeader
											level={ 3 }
											title={ __( 'Sites with disabled MCP access' ) }
											description={ __(
												'Sites with disabled MCP access are not accessible to AI assistants.'
											) }
										/>
										<VStack spacing={ 2 }>
											{ disabledSites.map( ( site ) => (
												<ToggleControl
													key={ site.id }
													__nextHasNoMarginBottom
													checked={ false }
													disabled={ mutation.isPending }
													onChange={ ( enabled ) => handleSiteToggle( site.id, enabled ) }
													label={ site.name }
													help={ site.domain }
												/>
											) ) }
										</VStack>
									</VStack>
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
