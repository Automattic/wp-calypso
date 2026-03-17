import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ToggleControl,
	__experimentalHStack as HStack,
	Button,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import {
	getAccountMcpAbilities,
	getDisabledSiteIds,
	getEnabledSiteIds,
} from '../../../me/mcp/utils';
import { useAppContext } from '../../app/context';
import { Card, CardBody } from '../../components/card';
import ComponentViewTracker from '../../components/component-view-tracker';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { SectionHeader } from '../../components/section-header';
import SiteIcon from '../../components/site-icon';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSiteDisplayUrl } from '../../utils/site-url';
import PreferencesLoginSiteDropdown from '../preferences-primary-site/site-dropdown';
import { CATEGORY_ORDER, getDisplayCategory } from './categories';
import type { Site } from '@automattic/api-core';

interface McpAbility {
	title: string;
	description: string;
	enabled: boolean;
	category?: string;
	category_label?: string;
	type?: string;
	annotations?: Record< string, unknown >;
}

function McpComponent() {
	const { queries } = useAppContext();
	const sitesQueryResult = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);
	const sites = ( sitesQueryResult.data as Site[] | undefined ) ?? [];
	const isSiteListLoading = sitesQueryResult.isLoading;
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	// Site selector state for managing MCP access on specific sites
	const [ selectedSiteId, setSelectedSiteId ] = useState< string | null >( null );
	const disabledSiteIds = getDisabledSiteIds( userSettings || {} );
	const enabledSiteIds = getEnabledSiteIds( userSettings || {} );

	const buildSiteEntry = ( siteId: number ) => {
		const site = sites.find( ( siteEntry ) => siteEntry.ID === siteId );
		const name = site
			? getSiteDisplayName( site )
			: sprintf(
					/* translators: %s is the site ID. */
					__( 'Site ID: %s' ),
					String( siteId )
			  );
		const displayUrl = site ? getSiteDisplayUrl( site ) : '';
		return {
			id: siteId,
			name,
			displayUrl,
			slug: site?.slug ?? '',
			site: site ?? null,
		};
	};

	const disabledSites = disabledSiteIds.map( buildSiteEntry );
	const enabledSites = enabledSiteIds.map( buildSiteEntry );

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

	// Check if any tools are enabled (for toggle-all state)
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

	const handleToggleAll = ( enabled: boolean ) => {
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
			const displayCategory = getDisplayCategory( toolId, tool );
			if ( ! grouped[ displayCategory ] ) {
				grouped[ displayCategory ] = [];
			}
			grouped[ displayCategory ].push( [ toolId, tool ] );
		} );

		return grouped;
	};

	// Sites available in the picker (exclude already-managed sites)
	const managedSiteIds = anyToolsEnabled ? disabledSiteIds : enabledSiteIds;
	const availableSitesForPicker = sites.filter(
		( site: Site ) => ! managedSiteIds.includes( site.ID )
	);

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

	const handleSitePickerSelect = ( siteIdStr: string | null | undefined ) => {
		if ( siteIdStr ) {
			const siteId = parseInt( siteIdStr, 10 );
			// When account MCP is ON: disable for specific site; when OFF: enable for specific site
			handleSiteToggle( siteId, ! anyToolsEnabled );
			setSelectedSiteId( null );
		}
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
				{ /* MCP Tool Access Toggle All */ }
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
								onChange={ handleToggleAll }
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
				{ hasTools && (
					<>
						<Card>
							<CardBody>
								<VStack spacing={ 4 }>
									<SectionHeader
										level={ 3 }
										title={
											anyToolsEnabled ? __( 'Site-specific MCP settings' ) : __( 'Add a site' )
										}
										description={
											anyToolsEnabled
												? __(
														'Disable MCP access for specific sites. This overrides your account settings.'
												  )
												: __( 'Search for a site to enable MCP access.' )
										}
									/>
									<PreferencesLoginSiteDropdown
										sites={ availableSitesForPicker }
										isLoading={ isSiteListLoading }
										value={ selectedSiteId ?? '' }
										onChange={ handleSitePickerSelect }
										hideLabelFromVision
									/>
								</VStack>
							</CardBody>
						</Card>

						{ /* Enabled sites (when account MCP is OFF) */ }
						{ ! anyToolsEnabled && enabledSites.length > 0 && (
							<Card>
								<CardBody>
									<VStack spacing={ 4 }>
										<SectionHeader
											level={ 3 }
											title={ __( 'Enabled sites' ) }
											description={ __( 'These sites have MCP access enabled.' ) }
										/>
										<VStack spacing={ 3 }>
											{ enabledSites.map( ( site ) => (
												<HStack key={ site.id } justify="space-between" alignment="center">
													<HStack spacing={ 3 } alignment="center" justify="flex-start">
														{ site.site && <SiteIcon site={ site.site } size={ 32 } /> }
														<VStack spacing={ 0 }>
															<Text weight={ 500 } size={ 14 }>
																{ site.name }
															</Text>
															<Text variant="muted" size={ 12 }>
																{ site.displayUrl }
															</Text>
														</VStack>
													</HStack>
													<HStack spacing={ 2 } expanded={ false }>
														{ site.slug && (
															<RouterLinkButton
																to={ `/sites/${ site.slug }/settings/ai-tools` }
																variant="link"
															>
																{ __( 'Manage' ) }
															</RouterLinkButton>
														) }
														<Button
															__next40pxDefaultSize
															variant="secondary"
															disabled={ mutation.isPending }
															onClick={ () => handleSiteToggle( site.id, false ) }
														>
															{ __( 'Remove' ) }
														</Button>
													</HStack>
												</HStack>
											) ) }
										</VStack>
									</VStack>
								</CardBody>
							</Card>
						) }

						{ /* Disabled sites (when account MCP is ON) */ }
						{ anyToolsEnabled && disabledSites.length > 0 && (
							<Card>
								<CardBody>
									<VStack spacing={ 4 }>
										<SectionHeader
											level={ 3 }
											title={ __( 'Sites with disabled MCP access' ) }
											description={ __( 'MCP access is disabled for these sites.' ) }
										/>
										<VStack spacing={ 3 }>
											{ disabledSites.map( ( site ) => (
												<HStack key={ site.id } justify="space-between" alignment="center">
													<HStack spacing={ 3 } alignment="center" justify="flex-start">
														{ site.site && <SiteIcon site={ site.site } size={ 32 } /> }
														<VStack spacing={ 0 }>
															<Text weight={ 500 } size={ 14 }>
																{ site.name }
															</Text>
															<Text variant="muted" size={ 12 }>
																{ site.displayUrl }
															</Text>
														</VStack>
													</HStack>
													<HStack spacing={ 2 } expanded={ false }>
														<Button
															__next40pxDefaultSize
															variant="secondary"
															disabled={ mutation.isPending }
															onClick={ () => handleSiteToggle( site.id, true ) }
														>
															{ __( 'Remove' ) }
														</Button>
													</HStack>
												</HStack>
											) ) }
										</VStack>
									</VStack>
								</CardBody>
							</Card>
						) }
					</>
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
