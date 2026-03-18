import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, ToggleControl } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { linkExternal } from '@wordpress/icons';
import { useState } from 'react';
import {
	getAccountMcpAbilities,
	getDisabledSiteIds,
	getEnabledSiteIds,
} from '../../../me/mcp/utils';
import { Card, CardBody, CardDivider } from '../../components/card';
import ComponentViewTracker from '../../components/component-view-tracker';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { SectionHeader } from '../../components/section-header';
import { isWriteTool } from './categories';

interface McpAbility {
	title: string;
	description: string;
	enabled: boolean;
	category?: string;
	category_label?: string;
	type?: string;
	readonly?: boolean;
	visible?: boolean;
	annotations?: Record< string, unknown >;
}

// Inline sparkles icon to avoid restricted @automattic/components/src imports
const sparklesIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"
		width="24"
		height="24"
		fill="currentColor"
		aria-hidden="true"
		focusable="false"
	>
		<path d="M6.24997 4L6.88636 5.61358L8.49994 6.24997L6.88636 6.88636L6.24997 8.49994L5.61358 6.88636L4 6.24997L5.61358 5.61358L6.24997 4Z" />
		<path d="M13 4L13.8485 6.15144L15.9999 6.99996L13.8485 7.84848L13 9.99992L12.1514 7.84848L10 6.99996L12.1514 6.15144L13 4Z" />
		<path d="M9.24995 8.49927L10.3106 11.1886L12.9999 12.2492L10.3106 13.3099L9.24995 15.9992L8.18931 13.3099L5.5 12.2492L8.18931 11.1886L9.24995 8.49927Z" />
	</svg>
);

// Inline broadcast/signal icon for MCP external access
const broadcastIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="24"
		height="24"
		fill="currentColor"
		aria-hidden="true"
		focusable="false"
	>
		<path d="M12 6a6 6 0 016 6 6 6 0 01-6 6 6 6 0 01-6-6 6 6 0 016-6m0-2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8m0 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0-2a6 6 0 00-6 6 6 6 0 006 6 6 6 0 006-6 6 6 0 00-6-6m0 4a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2z" />
	</svg>
);

function getSiteCountBadgeText( count: number, noneLabel: string ): string {
	if ( count === 0 ) {
		return noneLabel;
	}
	return sprintf(
		/* translators: %d is the number of sites */
		__( '%d sites' ),
		count
	);
}

function getReadStatus( tools: Array< [ string, McpAbility ] > ): string {
	if ( tools.length === 0 ) {
		return __( 'All enabled' );
	}
	const enabledCount = tools.filter( ( [ , tool ] ) => tool.enabled ).length;
	if ( enabledCount === tools.length ) {
		return __( 'All enabled' );
	}
	if ( enabledCount === 0 ) {
		return __( 'Disabled' );
	}
	return sprintf(
		/* translators: %d is the number of enabled tools */
		__( '%d enabled' ),
		enabledCount
	);
}

function McpComponent() {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const availableTools = (
		Object.entries( mcpAbilities ) as Array< [ string, McpAbility ] >
	 ).filter( ( [ , tool ] ) => tool.visible !== false );
	const mcpEnabled =
		availableTools.length > 0 && availableTools.some( ( [ , tool ] ) => tool.enabled );

	const readTools = availableTools.filter( ( [ toolId, tool ] ) => ! isWriteTool( toolId, tool ) );
	const writeTools = availableTools.filter( ( [ toolId, tool ] ) => isWriteTool( toolId, tool ) );

	const disabledSiteIds = getDisabledSiteIds( userSettings || {} );
	const enabledSiteIds = getEnabledSiteIds( userSettings || {} );

	const mcpSiteExceptionCount = mcpEnabled ? disabledSiteIds.length : enabledSiteIds.length;
	const mcpSiteExceptionText =
		mcpSiteExceptionCount > 0
			? sprintf(
					/* translators: %d is the number of site exceptions */
					__( '%d exceptions' ),
					mcpSiteExceptionCount
			  )
			: __( 'No exceptions' );

	const mcpSiteAddText = getSiteCountBadgeText( enabledSiteIds.length, __( 'No sites' ) );

	const [ aiAssistantEnabled, setAiAssistantEnabled ] = useState( false );

	const mutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Failed to save MCP settings.' ),
			},
		},
	} );

	const handleMcpToggle = ( enabled: boolean ) => {
		const accountAbilities: Record< string, boolean > = {};
		Object.keys( mcpAbilities ).forEach( ( toolId ) => {
			accountAbilities[ toolId ] = enabled;
		} );
		mutation.mutate( {
			mcp_abilities: {
				account: accountAbilities,
			},
		} as any );
	};

	if ( ! config.isEnabled( 'mcp-settings' ) ) {
		return null;
	}

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'AI and MCP' ) }
					description={ createInterpolateElement(
						__(
							'Control how AI agents interact with your WordPress.com account and sites. <learnMoreLink/>'
						),
						{
							learnMoreLink: <InlineSupportLink supportContext="mcp" />,
						}
					) }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_mcp_view" />
			<VStack spacing={ 4 }>
				{ /* AI assistant card */ }
				{ config.isEnabled( 'wordpress-ai-tools' ) && (
					<Card>
						<CardBody>
							<VStack spacing={ 4 }>
								<SectionHeader
									level={ 3 }
									title={ __( 'AI assistant' ) }
									description={ __(
										'Create content, transform designs, and get instant help with AI across all your sites on paid plans.'
									) }
								/>
								<ToggleControl
									__nextHasNoMarginBottom
									checked={ aiAssistantEnabled }
									label={ __( 'Enable AI assistant' ) }
									onChange={ setAiAssistantEnabled }
								/>
							</VStack>
						</CardBody>
						<CardDivider />
						<RouterLinkSummaryButton
							to="/me/mcp/ai-sites"
							title={ __( 'Add to specific sites' ) }
							decoration={ sparklesIcon }
							badges={ [ { text: __( 'No sites' ) } ] }
						/>
					</Card>
				) }

				{ /* External AI agent access (MCP) card */ }
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader
								level={ 3 }
								title={ __( 'External AI agent access' ) }
								description={ __(
									'Allow external AI agents to access your WordPress.com account and sites via MCP.'
								) }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ mcpEnabled }
								disabled={ mutation.isPending }
								label={ __( 'Enable MCP access' ) }
								onChange={ handleMcpToggle }
							/>
						</VStack>
					</CardBody>
					<CardDivider />
					{ mcpEnabled ? (
						<>
							<RouterLinkSummaryButton
								to="/me/mcp/read"
								title={ __( 'Read' ) }
								decoration={
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										width="24"
										height="24"
										fill="currentColor"
										aria-hidden="true"
										focusable="false"
									>
										<path d="M12 4.75C6.9 4.75 2.75 9.9 2.75 12c0 2.1 4.15 7.25 9.25 7.25s9.25-5.15 9.25-7.25c0-2.1-4.15-7.25-9.25-7.25zM12 17.75c-4.08 0-7.75-4.39-7.75-5.75s3.67-5.75 7.75-5.75 7.75 4.39 7.75 5.75-3.67 5.75-7.75 5.75zM12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm0 5.5a2 2 0 110-4 2 2 0 010 4z" />
									</svg>
								}
								badges={ [
									{
										text: getReadStatus( readTools ),
										intent:
											readTools.length > 0 && readTools.every( ( [ , t ] ) => t.enabled )
												? ( 'success' as const )
												: undefined,
									},
								] }
							/>
							<CardDivider />
							<RouterLinkSummaryButton
								to="/me/mcp/write"
								title={ __( 'Write' ) }
								decoration={
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										width="24"
										height="24"
										fill="currentColor"
										aria-hidden="true"
										focusable="false"
									>
										<path d="M20.1 4c-.5-.5-1-.8-1.7-.8-.6 0-1.2.3-1.7.7l-12 12.1-.1.2-1 4.1 4.2-.9.2-.1 12-12.1c.9-1 .9-2.4.1-3.2zm-14 11.4l9.5-9.6 1.7 1.6-9.5 9.6-1.7-1.6zm-.9 1.7l1.3 1.3-1.8.4.5-1.7zm13-12.3l-.9.9-1.7-1.6.9-.9c.2-.2.4-.3.7-.3.2 0 .5.1.7.3l.3.3c.4.4.4 1 0 1.3z" />
									</svg>
								}
								badges={ [
									{
										text: getReadStatus( writeTools ),
										intent:
											writeTools.length > 0 && writeTools.every( ( [ , t ] ) => t.enabled )
												? ( 'success' as const )
												: undefined,
									},
								] }
							/>
							<CardDivider />
							<RouterLinkSummaryButton
								to="/me/mcp/mcp-sites"
								title={ __( 'Site exceptions' ) }
								decoration={
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										width="24"
										height="24"
										fill="currentColor"
										aria-hidden="true"
										focusable="false"
									>
										<path d="M12 3.75C7.44 3.75 3.75 7.44 3.75 12S7.44 20.25 12 20.25 20.25 16.56 20.25 12 16.56 3.75 12 3.75zm-7 8.25a7 7 0 0110.9-5.8L6.2 18.9A6.97 6.97 0 015 12zm7 7a6.97 6.97 0 01-4.9-2L17.8 6.1A7 7 0 0119 12a7 7 0 01-7 7z" />
									</svg>
								}
								badges={ [ { text: mcpSiteExceptionText } ] }
							/>
						</>
					) : (
						<RouterLinkSummaryButton
							to="/me/mcp/mcp-sites"
							title={ __( 'Add to specific sites' ) }
							decoration={ broadcastIcon }
							badges={ [
								{
									text: mcpSiteAddText,
									intent: enabledSiteIds.length > 0 ? ( 'success' as const ) : undefined,
								},
							] }
						/>
					) }
				</Card>

				{ /* Connect external AI assistant card */ }
				<RouterLinkSummaryButton
					to="/me/mcp/setup"
					title={ __( 'Connect external AI assistant' ) }
					description={ __( 'Get instructions for connecting your external AI assistant.' ) }
					decoration={ linkExternal }
				/>
			</VStack>
		</PageLayout>
	);
}

export default McpComponent;
