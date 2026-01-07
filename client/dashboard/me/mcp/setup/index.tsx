import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	TextareaControl,
	SelectControl,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { copy, check, error } from '@wordpress/icons';
import { useState } from 'react';
import { hasEnabledAccountTools } from '../../../../me/mcp/utils';
import Breadcrumbs from '../../../app/breadcrumbs';
import { Card, CardBody } from '../../../components/card';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RouterLinkButton from '../../../components/router-link-button';
import { SectionHeader } from '../../../components/section-header';

function McpSetupComponent() {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	// MCP client selection for configuration format
	const [ selectedMcpClient, setSelectedMcpClient ] = useState< McpClient >( 'claude' );

	// Copy button state
	const [ copyStatus, setCopyStatus ] = useState( 'idle' );

	type McpClient = 'claude' | 'cursor' | 'vscode' | 'continue' | 'default';

	// MCP client options
	const mcpClientOptions: Array< { label: string; value: McpClient } > = [
		{ label: 'Claude Desktop', value: 'claude' },
		{ label: 'Cursor', value: 'cursor' },
		{ label: 'VS Code', value: 'vscode' },
		{ label: 'Continue', value: 'continue' },
		{ label: __( 'Other MCP client' ), value: 'default' },
	];

	// Documentation links for each client
	const clientDocumentation: Record< McpClient, string > = {
		claude: 'https://docs.claude.com/en/docs/mcp',
		vscode: 'https://code.visualstudio.com/docs/copilot/customization/mcp-servers',
		cursor: 'https://docs.cursor.com/en/context/mcp',
		continue: 'https://docs.continue.dev/customize/deep-dives/mcp',
		default: 'https://modelcontextprotocol.io/docs/develop/connect-local-servers',
	};

	const serverName = 'wpcom-mcp';

	// Generate MCP configuration based on selected client
	const generateMcpConfig = ( client: McpClient ) => {
		const baseConfig = {
			command: 'npx',
			args: [ '-y', '@automattic/mcp-wpcom-remote@latest' ],
		};

		switch ( client ) {
			case 'claude':
				return {
					mcpServers: {
						[ serverName ]: baseConfig,
					},
				};
			case 'vscode':
				return {
					servers: {
						[ serverName ]: baseConfig,
					},
				};
			case 'cursor':
				return {
					mcpServers: {
						[ serverName ]: baseConfig,
					},
				};
			case 'continue':
				return {
					mcpServers: [
						{
							name: serverName,
							...baseConfig,
						},
					],
				};
			default:
				return {
					mcpServers: {
						[ serverName ]: baseConfig,
					},
				};
		}
	};

	// Copy MCP configuration to clipboard
	const copyToClipboard = async () => {
		const configText = JSON.stringify( generateMcpConfig( selectedMcpClient ), null, 2 );

		try {
			await navigator.clipboard.writeText( configText );
			setCopyStatus( 'success' );
			setTimeout( () => setCopyStatus( 'idle' ), 2000 );
		} catch ( err ) {
			setCopyStatus( 'error' );
			setTimeout( () => setCopyStatus( 'idle' ), 2000 );
		}
	};

	// Helper function to get the appropriate icon based on copy status
	const getCopyIcon = () => {
		switch ( copyStatus ) {
			case 'success':
				return check;
			case 'error':
				return error;
			default:
				return copy;
		}
	};

	// Check if any account-level tools are enabled using the new nested structure
	const hasEnabledTools = hasEnabledAccountTools( userSettings || {} );

	if ( ! hasEnabledTools ) {
		return (
			<PageLayout
				size="small"
				header={
					<PageHeader
						title={ __( 'MCP Client Setup' ) }
						description={ __( 'Configure your MCP client to connect to WordPress.com.' ) }
						prefix={ <Breadcrumbs length={ 2 } /> }
					/>
				}
			>
				<ComponentViewTracker eventName="calypso_dashboard_mcp_setup_view" />
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader level={ 3 } title={ __( 'Setup Required' ) } />
							<VStack spacing={ 4 }>
								<Text as="p" variant="muted">
									{ __( 'No MCP access is currently enabled for your account.' ) }
								</Text>
								<Text as="p" variant="muted">
									{ __(
										'MCP access defines what actions and data your MCP client can access on your account. You need to enable MCP access in the main MCP settings before configuring your client.'
									) }
								</Text>
								<RouterLinkButton
									to="/me/mcp"
									variant="primary"
									style={ { alignSelf: 'flex-start' } }
								>
									{ __( 'Go to MCP Settings' ) }
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
				<PageHeader title={ __( 'MCP Client Setup' ) } prefix={ <Breadcrumbs length={ 2 } /> } />
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_mcp_setup_view" />
			<>
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader
								level={ 3 }
								title={ __( 'Connect AI Assistant to WordPress.com (MCP)' ) }
							/>
							<VStack spacing={ 4 }>
								<Text as="p" variant="muted">
									{ __(
										'WordPress.com provides MCP (Model Context Protocol) support, which allows AI assistants to interact directly with your WordPress.com account.'
									) }
								</Text>
								<Text as="p" variant="muted">
									{ __(
										'The JSON configuration below sets up a secure connection between your AI assistant and your WordPress.com account. It works by:'
									) }
								</Text>
								<VStack spacing={ 2 }>
									<ul style={ { color: '#757575', paddingInlineStart: '20px', margin: '0' } }>
										<li>
											<Text as="p" variant="muted">
												{ __(
													'Running a bridge server using the WordPress.com-specific MCP package'
												) }
											</Text>
										</li>
										<li>
											<Text as="p" variant="muted">
												{ __(
													'Handling OAuth 2.1 authentication to securely connect to your WordPress.com account'
												) }
											</Text>
										</li>
										<li>
											<Text as="p" variant="muted">
												{ __(
													'Providing real-time access to your account’s content and management features'
												) }
											</Text>
										</li>
									</ul>
								</VStack>
							</VStack>
						</VStack>
					</CardBody>
				</Card>

				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader level={ 3 } title={ __( 'MCP Client Configuration' ) } />
							<VStack spacing={ 4 }>
								<SelectControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={ __( 'MCP Client' ) }
									value={ selectedMcpClient }
									options={ mcpClientOptions }
									onChange={ setSelectedMcpClient }
									help={ __(
										'Choose your MCP client to get the correct configuration format. Then, follow the instructions below.'
									) }
								/>
							</VStack>
						</VStack>
					</CardBody>
				</Card>

				{ ( selectedMcpClient === 'claude' || selectedMcpClient === 'cursor' ) && (
					<Card>
						<CardBody>
							<VStack spacing={ 4 }>
								<SectionHeader level={ 3 } title={ __( 'Quick Setup' ) } />
								{ /* Quick Setup for Claude Desktop */ }
								{ selectedMcpClient === 'claude' && (
									<VStack spacing={ 4 }>
										<Text as="p" variant="muted">
											{ __(
												'For Claude Desktop users, we provide a one-click setup option using our MCP Bundle (MCPB) file.'
											) }
										</Text>
										<Text as="p" variant="muted">
											{ __( 'Installation steps:' ) }
										</Text>
										<ol style={ { color: '#757575', paddingInlineStart: '20px', margin: '0' } }>
											<li>
												<Text as="p" variant="muted">
													{ __( 'Click the download button' ) }
												</Text>
											</li>
											<li>
												<Text as="p" variant="muted">
													{ __( 'Double-click the downloaded file' ) }
												</Text>
											</li>
											<li>
												<Text as="p" variant="muted">
													{ __( 'Follow Claude Desktop‘s setup instructions' ) }
												</Text>
											</li>
										</ol>
										<Button
											variant="primary"
											href="https://github.com/Automattic/wpcom-mcp-bundle/raw/refs/heads/trunk/wordpress-com-mcp.mcpb"
											target="_blank"
											style={ { alignSelf: 'flex-start' } }
										>
											{ __( 'Download MCPB File' ) }
										</Button>
									</VStack>
								) }

								{ /* Quick Setup for Cursor */ }
								{ selectedMcpClient === 'cursor' && (
									<VStack spacing={ 4 }>
										<Text as="p" variant="muted">
											{ __(
												'For Cursor users, we provide a one-click setup option that will automatically configure the MCP server.'
											) }
										</Text>
										<Button
											variant="primary"
											href="https://cursor.com/en/install-mcp?name=WordPress.com&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBhdXRvbWF0dGljL21jcC13cGNvbS1yZW1vdGVAbGF0ZXN0Il19"
											target="_blank"
											style={ { alignSelf: 'flex-start' } }
										>
											{ __( 'Install in Cursor' ) }
										</Button>
									</VStack>
								) }
							</VStack>
						</CardBody>
					</Card>
				) }

				<Card>
					<CardBody>
						<VStack spacing={ 2 }>
							<SectionHeader level={ 3 } title={ __( 'Manual Setup' ) } />
							<VStack spacing={ 1 }>
								<HStack justify="space-between" alignment="center">
									{ clientDocumentation[ selectedMcpClient ] && (
										<ExternalLink
											href={ clientDocumentation[ selectedMcpClient ] }
											style={ { fontSize: '11px', textTransform: 'uppercase' } }
										>
											{ selectedMcpClient === 'default'
												? __( 'View setup instructions for other MCP client' )
												: sprintf(
														/* translators: %s is the name of the MCP client */
														__( 'View setup instructions for %s' ),
														mcpClientOptions.find( ( opt ) => opt.value === selectedMcpClient )
															?.label || ''
												  ) }
										</ExternalLink>
									) }
									<Button
										icon={ getCopyIcon() }
										variant="tertiary"
										iconSize={ 20 }
										style={ {
											color: copyStatus === 'error' ? 'var(--color-error)' : undefined,
										} }
										onClick={ copyToClipboard }
										aria-label={ __( 'Copy configuration to clipboard' ) }
									/>
								</HStack>
								<TextareaControl
									__nextHasNoMarginBottom
									value={ JSON.stringify( generateMcpConfig( selectedMcpClient ), null, 2 ) }
									onChange={ () => {} } // Required prop for read-only textarea
									readOnly
									help={ __(
										'Copy this configuration and paste it into your MCP client’s settings.'
									) }
									style={ { minHeight: '240px' } }
								/>
								<VStack spacing={ 1 }>
									<Text size="12px">
										{ createInterpolateElement(
											sprintf(
												/* translators: %s is the server name identifier */
												__(
													'<code>%s</code> is a unique identifier for this WordPress.com account connection'
												),
												serverName
											),
											{
												code: (
													<code
														key="server-name"
														style={ {
															backgroundColor: '#f0f0f1',
															padding: '2px 6px',
															borderRadius: '3px',
															fontFamily: 'monospace',
															fontSize: '13px',
														} }
													>
														{ serverName }
													</code>
												),
											}
										) }
									</Text>
									<Text size="12px">
										{ createInterpolateElement(
											sprintf(
												/* translators: %s is the package name */
												__( '<code>%s</code> is the official WordPress.com MCP server package' ),
												'@automattic/mcp-wpcom-remote'
											),
											{
												code: (
													<code
														key="package-name"
														style={ {
															backgroundColor: '#f0f0f1',
															padding: '2px 6px',
															borderRadius: '3px',
															fontFamily: 'monospace',
															fontSize: '13px',
														} }
													>
														@automattic/mcp-wpcom-remote
													</code>
												),
											}
										) }
									</Text>
								</VStack>
							</VStack>
						</VStack>
					</CardBody>
				</Card>
			</>
		</PageLayout>
	);
}

export default McpSetupComponent;
