import { userSettingsQuery, siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	TextareaControl,
	SelectControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { copy, check } from '@wordpress/icons';
import { useState } from 'react';
import { getSiteLevelEnabled } from '../../../../me/mcp/utils';
import Breadcrumbs from '../../../app/breadcrumbs';
import { siteRoute } from '../../../app/router/sites';
import { Card, CardBody } from '../../../components/card';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RouterLinkButton from '../../../components/router-link-button';
import { SectionHeader } from '../../../components/section-header';

import '../../../me/mcp/setup/style.scss';

function SiteAIToolsSetup() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	type McpClient = 'claude' | 'claude-code' | 'cursor' | 'vscode' | 'continue' | 'default';

	const [ selectedMcpClient, setSelectedMcpClient ] = useState< McpClient >( 'claude' );
	const [ copyStatus, setCopyStatus ] = useState( 'idle' );

	const mcpClientOptions: Array< { label: string; value: McpClient } > = [
		{ label: 'Claude', value: 'claude' },
		{ label: 'Claude Code', value: 'claude-code' },
		{ label: 'Cursor', value: 'cursor' },
		{ label: 'VS Code', value: 'vscode' },
		{ label: 'Continue', value: 'continue' },
		{ label: __( 'Other MCP client' ), value: 'default' },
	];

	const clientDocumentation: Record< McpClient, string > = {
		claude: 'https://docs.claude.com/en/docs/mcp',
		'claude-code': 'https://code.claude.com/docs/en/mcp',
		vscode: 'https://code.visualstudio.com/docs/copilot/customization/mcp-servers',
		cursor: 'https://docs.cursor.com/en/context/mcp',
		continue: 'https://docs.continue.dev/customize/deep-dives/mcp',
		default: 'https://modelcontextprotocol.io/docs/develop/connect-local-servers',
	};

	const clientDocumentationLabels: Record< McpClient, string > = {
		claude: __( 'Claude documentation' ),
		'claude-code': __( 'Claude Code documentation' ),
		vscode: __( 'VS Code documentation' ),
		cursor: __( 'Cursor documentation' ),
		continue: __( 'Continue documentation' ),
		default: __( 'MCP documentation' ),
	};

	const serverName = 'wpcom-mcp';

	const generateMcpConfig = ( client: McpClient ) => {
		const baseConfig = {
			url: 'https://public-api.wordpress.com/wpcom/v2/mcp/v1',
		};

		switch ( client ) {
			case 'claude':
				return { mcpServers: { [ serverName ]: baseConfig } };
			case 'claude-code':
				return { mcpServers: { [ serverName ]: { type: 'http', url: baseConfig.url } } };
			case 'vscode':
				return { servers: { [ serverName ]: baseConfig } };
			case 'cursor':
				return { mcpServers: { [ serverName ]: baseConfig } };
			case 'continue':
				return { mcpServers: [ { name: serverName, ...baseConfig } ] };
			default:
				return { mcpServers: { [ serverName ]: baseConfig } };
		}
	};

	const copyToClipboard = async () => {
		const configText = JSON.stringify( generateMcpConfig( selectedMcpClient ), null, 2 );
		try {
			await navigator.clipboard.writeText( configText );
			setCopyStatus( 'success' );
			setTimeout( () => setCopyStatus( 'idle' ), 2000 );
		} catch {
			// Silently fail — clipboard access may be blocked
		}
	};

	const isSiteMcpEnabled = getSiteLevelEnabled( userSettings || {}, site.ID );

	if ( ! isSiteMcpEnabled ) {
		return (
			<PageLayout
				size="small"
				header={
					<PageHeader
						title={ __( 'Connect AI agent' ) }
						description={ __( 'Get instructions for connecting your AI agent.' ) }
						prefix={ <Breadcrumbs length={ 3 } /> }
					/>
				}
			>
				<ComponentViewTracker eventName="calypso_dashboard_site_ai_tools_setup_view" />
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader level={ 3 } title={ __( 'Setup Required' ) } />
							<VStack spacing={ 4 }>
								<Text as="p" variant="muted">
									{ __( 'MCP access is not enabled for this site.' ) }
								</Text>
								<Text as="p" variant="muted">
									{ __( 'Enable MCP access for this site before connecting your AI agent.' ) }
								</Text>
								<RouterLinkButton
									to={ `/sites/${ siteSlug }/settings/ai-tools` }
									variant="primary"
									className="mcp-setup__action-button"
								>
									{ __( 'Go to Site MCP settings' ) }
								</RouterLinkButton>
							</VStack>
						</VStack>
					</CardBody>
				</Card>
			</PageLayout>
		);
	}

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Connect AI agent' ) }
					description={ __( 'Get instructions for connecting your AI agent.' ) }
					prefix={ <Breadcrumbs length={ 3 } /> }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_site_ai_tools_setup_view" />
			<>
				<Card className="mcp-setup__choose-agent-card">
					<CardBody>
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Choose your AI agent' ) }
							value={ selectedMcpClient }
							options={ mcpClientOptions }
							onChange={ setSelectedMcpClient }
						/>
					</CardBody>
				</Card>

				{ ( selectedMcpClient === 'claude' ||
					selectedMcpClient === 'claude-code' ||
					selectedMcpClient === 'cursor' ) && (
					<Card>
						<CardBody>
							<VStack spacing={ 2 }>
								<SectionHeader level={ 3 } title={ __( 'Quick setup' ) } />
								<VStack spacing={ 4 }>
									{ /* Quick Setup for Claude */ }
									{ selectedMcpClient === 'claude' && (
										<ol className="mcp-setup__steps">
											<li>
												<Text as="p" variant="muted">
													{ createInterpolateElement(
														/* translators: <ClaudeSettings/> is a link to the Claude settings page */
														__( 'Open <ClaudeSettings/>.' ),
														{
															ClaudeSettings: (
																<ExternalLink href="https://claude.ai/settings/connectors">
																	{ __( 'Claude settings' ) }
																</ExternalLink>
															),
														}
													) }
												</Text>
											</li>
											<li>
												<Text as="p" variant="muted">
													{ __( 'Click "Browse connectors" and search for WordPress.com.' ) }
												</Text>
											</li>
											<li>
												<Text as="p" variant="muted">
													{ __( 'Select WordPress.com and follow the prompts.' ) }
												</Text>
											</li>
										</ol>
									) }

									{ /* Quick Setup for Claude Code */ }
									{ selectedMcpClient === 'claude-code' && (
										<VStack spacing={ 4 }>
											<Text as="p" variant="muted">
												{ __(
													'Claude Code uses a different config format with type: "http". Use the CLI or copy the configuration below.'
												) }
											</Text>
											<ol className="mcp-setup__steps">
												<li>
													<Text as="p" variant="muted">
														{ createInterpolateElement(
															/* translators: <code/> is replaced with the CLI command to add the MCP server */
															__( 'Run this command in your terminal: <code/>' ),
															{
																code: (
																	<code className="mcp-setup__code" key="claude-code-cmd">
																		claude mcp add --transport http wpcom-mcp
																		https://public-api.wordpress.com/wpcom/v2/mcp/v1
																	</code>
																),
															}
														) }
													</Text>
												</li>
												<li>
													<Text as="p" variant="muted">
														{ createInterpolateElement(
															__(
																'Or copy the configuration below and add it to your <mcpJson/> or <claudeJson/> file.'
															),
															{
																mcpJson: (
																	<code className="mcp-setup__code" key="mcp-json">
																		.mcp.json
																	</code>
																),
																claudeJson: (
																	<code className="mcp-setup__code" key="claude-json">
																		~/.claude.json
																	</code>
																),
															}
														) }
													</Text>
												</li>
												<li>
													<Text as="p" variant="muted">
														{ createInterpolateElement(
															__(
																'In Claude Code, run <code/> to authenticate with your WordPress.com account.'
															),
															{
																code: (
																	<code className="mcp-setup__code" key="mcp-cmd">
																		/mcp
																	</code>
																),
															}
														) }
													</Text>
												</li>
											</ol>
										</VStack>
									) }

									{ /* Quick Setup for Cursor */ }
									{ selectedMcpClient === 'cursor' && (
										<VStack spacing={ 4 }>
											<Text as="p" variant="muted">
												{ __(
													'For Cursor users, use the one-click install to add the WordPress.com MCP app.'
												) }
											</Text>
											<Button
												variant="primary"
												href="cursor://anysphere.cursor-deeplink/mcp/install?name=WordPress.com&config=eyJjb21tYW5kIjoibnB4IC15IG1jcC1yZW1vdGUgaHR0cHM6Ly9wdWJsaWMtYXBpLndvcmRwcmVzcy5jb20vd3Bjb20vdjIvbWNwL3YxIn0%3D"
												target="_blank"
												className="mcp-setup__action-button"
											>
												{ __( 'Install in Cursor' ) }
											</Button>
										</VStack>
									) }
								</VStack>
							</VStack>
						</CardBody>
					</Card>
				) }

				<Card>
					<CardBody>
						<VStack spacing={ 1 }>
							<HStack justify="space-between" alignment="center">
								<SectionHeader level={ 3 } title={ __( 'Manual setup' ) } />
								<Button
									icon={ copyStatus === 'success' ? check : copy }
									variant="tertiary"
									iconSize={ 20 }
									onClick={ copyToClipboard }
									aria-label={ __( 'Copy configuration to clipboard' ) }
								/>
							</HStack>
							<VStack spacing={ 2 }>
								<Text as="p" variant="muted">
									{ __( 'Copy this configuration into your client\u2019s MCP settings.' ) }
								</Text>
								<TextareaControl
									className="mcp-setup__config-textarea"
									__nextHasNoMarginBottom
									value={ JSON.stringify( generateMcpConfig( selectedMcpClient ), null, 2 ) }
									onChange={ () => {} }
									readOnly
								/>
								{ clientDocumentation[ selectedMcpClient ] && (
									<ExternalLink href={ clientDocumentation[ selectedMcpClient ] }>
										{ clientDocumentationLabels[ selectedMcpClient ] }
									</ExternalLink>
								) }
							</VStack>
						</VStack>
					</CardBody>
				</Card>
			</>
		</PageLayout>
	);
}

export default SiteAIToolsSetup;
