import { userSettingsQuery } from '@automattic/api-queries';
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
import { __ } from '@wordpress/i18n';
import { copy, check, error } from '@wordpress/icons';
import { useState } from 'react';
import { hasEnabledAccountTools } from '../../../../me/mcp/utils';
import Breadcrumbs from '../../../app/breadcrumbs';
import { Card, CardBody } from '../../../components/card';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RouterLinkButton from '../../../components/router-link-button';

function McpSetupComponent() {
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
		} catch ( err ) {
			setCopyStatus( 'error' );
			setTimeout( () => setCopyStatus( 'idle' ), 2000 );
		}
	};

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

	const hasEnabledTools = hasEnabledAccountTools( userSettings || {} );

	if ( ! hasEnabledTools ) {
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
				<ComponentViewTracker eventName="calypso_dashboard_mcp_setup_view" />
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<Text as="h3" weight="600" style={ { margin: 0 } }>
								{ __( 'Setup Required' ) }
							</Text>
							<VStack spacing={ 4 }>
								<p>{ __( 'No MCP access is currently enabled for your account.' ) }</p>
								<RouterLinkButton
									to="/me/preferences/mcp"
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
				<PageHeader
					title={ __( 'Connect AI agent' ) }
					description={ __( 'Get instructions for connecting your AI agent.' ) }
					prefix={ <Breadcrumbs length={ 3 } /> }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_mcp_setup_view" />
			<VStack spacing={ 2 }>
				<Card>
					<CardBody style={ { padding: '8px 16px' } }>
						<VStack spacing={ 2 }>
							<Text as="h3" weight="600" style={ { margin: 0 } }>
								{ __( 'Choose your AI agent' ) }
							</Text>
							<SelectControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								value={ selectedMcpClient }
								options={ mcpClientOptions }
								onChange={ setSelectedMcpClient }
							/>
						</VStack>
					</CardBody>
				</Card>

				{ ( selectedMcpClient === 'claude' ||
					selectedMcpClient === 'claude-code' ||
					selectedMcpClient === 'cursor' ) && (
					<Card>
						<CardBody style={ { padding: '16px' } }>
							<VStack spacing={ 3 }>
								<Text as="h3" weight="600" style={ { margin: 0 } }>
									{ __( 'Quick setup' ) }
								</Text>

								{ selectedMcpClient === 'claude' && (
									<ol style={ { paddingInlineStart: '20px', margin: '0' } }>
										<li>
											<ExternalLink href="https://claude.ai/settings/connectors">
												{ __( 'Open Claude settings' ) }
											</ExternalLink>
										</li>
										<li>{ __( 'Click "Browse connectors" and search for WordPress.com' ) }</li>
										<li>{ __( 'Select WordPress.com and follow the prompts' ) }</li>
									</ol>
								) }

								{ selectedMcpClient === 'claude-code' && (
									<ol style={ { paddingInlineStart: '20px', margin: '0' } }>
										<li>
											{ __( 'Run in your terminal:' ) }{ ' ' }
											<code
												style={ {
													backgroundColor: '#f0f0f1',
													padding: '2px 6px',
													borderRadius: '3px',
													fontFamily: 'monospace',
													fontSize: '13px',
												} }
											>
												claude mcp add --transport http wpcom-mcp
												https://public-api.wordpress.com/wpcom/v2/mcp/v1
											</code>
										</li>
										<li>{ __( 'Run /mcp in Claude Code to authenticate' ) }</li>
									</ol>
								) }

								{ selectedMcpClient === 'cursor' && (
									<>
										<p style={ { margin: 0 } }>
											{ __(
												'Use the one-click install to add the WordPress.com MCP server to Cursor.'
											) }
										</p>
										<Button
											variant="primary"
											href="cursor://anysphere.cursor-deeplink/mcp/install?name=WordPress.com&config=eyJjb21tYW5kIjoibnB4IC15IG1jcC1yZW1vdGUgaHR0cHM6Ly9wdWJsaWMtYXBpLndvcmRwcmVzcy5jb20vd3Bjb20vdjIvbWNwL3YxIn0%3D"
											target="_blank"
											style={ { alignSelf: 'flex-start' } }
										>
											{ __( 'Install in Cursor' ) }
										</Button>
									</>
								) }
							</VStack>
						</CardBody>
					</Card>
				) }

				<Card>
					<CardBody style={ { padding: '16px' } }>
						<VStack spacing={ 2 }>
							<VStack spacing={ 0 }>
								<Text as="h3" weight="600" style={ { margin: 0 } }>
									{ __( 'Manual setup' ) }
								</Text>
								<HStack justify="space-between" alignment="center">
									<p style={ { margin: 0, fontSize: '13px', color: '#757575' } }>
										{ __( "Copy this configuration into your client's MCP settings." ) }
									</p>
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
							</VStack>
							<TextareaControl
								__nextHasNoMarginBottom
								value={ JSON.stringify( generateMcpConfig( selectedMcpClient ), null, 2 ) }
								onChange={ () => {} }
								readOnly
								style={ { minHeight: '160px' } }
							/>
							{ clientDocumentation[ selectedMcpClient ] && (
								<ExternalLink href={ clientDocumentation[ selectedMcpClient ] }>
									{ clientDocumentationLabels[ selectedMcpClient ] }
								</ExternalLink>
							) }
						</VStack>
					</CardBody>
				</Card>
			</VStack>
		</PageLayout>
	);
}

export default McpSetupComponent;
