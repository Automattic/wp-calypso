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
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { copy, check, error } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { hasEnabledAccountTools } from '../../../../me/mcp/utils';
import Breadcrumbs from '../../../app/breadcrumbs';
import { Card, CardBody } from '../../../components/card';
import ComponentViewTracker from '../../../components/component-view-tracker';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RouterLinkButton from '../../../components/router-link-button';
import { SectionHeader } from '../../../components/section-header';

type McpClient = 'claude' | 'claude-code' | 'cursor' | 'vscode' | 'continue' | 'default';

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

const SERVER_NAME = 'wpcom-mcp';
const MCP_URL = 'https://public-api.wordpress.com/wpcom/v2/mcp/v1';
const CLAUDE_CODE_COMMAND = `claude mcp add --transport http ${ SERVER_NAME } ${ MCP_URL }`;

function generateMcpConfig( client: McpClient ) {
	const baseConfig = { url: MCP_URL };

	switch ( client ) {
		case 'claude-code':
			return { mcpServers: { [ SERVER_NAME ]: { type: 'http', url: MCP_URL } } };
		case 'vscode':
			return { servers: { [ SERVER_NAME ]: baseConfig } };
		case 'continue':
			return { mcpServers: [ { name: SERVER_NAME, ...baseConfig } ] };
		default:
			return { mcpServers: { [ SERVER_NAME ]: baseConfig } };
	}
}

const codeStyle = {
	backgroundColor: '#f0f0f1',
	padding: '2px 6px',
	borderRadius: '3px',
	fontFamily: 'monospace',
	fontSize: '13px',
};

function McpSetupComponent() {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const [ selectedMcpClient, setSelectedMcpClient ] = useState< McpClient >( 'claude' );
	const [ copyStatus, setCopyStatus ] = useState( 'idle' );
	const [ commandCopyStatus, setCommandCopyStatus ] = useState( 'idle' );
	const { createSuccessNotice } = useDispatch( noticesStore );

	const copyToClipboard = async () => {
		const configText = JSON.stringify( generateMcpConfig( selectedMcpClient ), null, 2 );
		try {
			await navigator.clipboard.writeText( configText );
			setCopyStatus( 'success' );
			createSuccessNotice( __( 'Copied to clipboard' ), {
				type: 'snackbar',
				isDismissible: true,
			} );
			setTimeout( () => setCopyStatus( 'idle' ), 2000 );
		} catch {
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

	const copyCommandToClipboard = async () => {
		try {
			await navigator.clipboard.writeText( CLAUDE_CODE_COMMAND );
			setCommandCopyStatus( 'success' );
			createSuccessNotice( __( 'Copied to clipboard' ), {
				type: 'snackbar',
				isDismissible: true,
			} );
			setTimeout( () => setCommandCopyStatus( 'idle' ), 2000 );
		} catch {
			setCommandCopyStatus( 'error' );
			setTimeout( () => setCommandCopyStatus( 'idle' ), 2000 );
		}
	};

	const getCommandCopyIcon = () => {
		switch ( commandCopyStatus ) {
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
						title={ __( 'Connect AI assistant' ) }
						description={ __( 'Get instructions for connecting your AI assistant.' ) }
						prefix={ <Breadcrumbs length={ 3 } /> }
					/>
				}
			>
				<ComponentViewTracker eventName="calypso_dashboard_mcp_setup_view" />
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader level={ 3 } title={ __( 'Enable AI access first' ) } />
							<Text as="p" variant="muted">
								{ __( 'You need to enable AI access before connecting your assistant.' ) }
							</Text>
							<RouterLinkButton
								to="/me/preferences/ai-and-mcp"
								variant="primary"
								style={ { alignSelf: 'flex-start' } }
							>
								{ __( 'Go to AI and MCP' ) }
							</RouterLinkButton>
						</VStack>
					</CardBody>
				</Card>
			</PageLayout>
		);
	}

	// ─── Quick setup content per client ──────────────────────────────

	const renderQuickSetup = () => {
		switch ( selectedMcpClient ) {
			case 'claude':
				return (
					<VStack spacing={ 4 }>
						<ol style={ { color: '#757575', paddingInlineStart: '20px', margin: '0' } }>
							<li>
								<Text as="p" variant="muted">
									{ createInterpolateElement( __( 'Open <ClaudeSettings/>.' ), {
										ClaudeSettings: (
											<ExternalLink href="https://claude.ai/settings/connectors">
												{ __( 'Claude settings' ) }
											</ExternalLink>
										),
									} ) }
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
					</VStack>
				);
			case 'claude-code':
				return (
					<VStack spacing={ 4 }>
						<Text as="p" variant="muted">
							{ __( 'Run this command in your terminal:' ) }
						</Text>
						<div style={ { position: 'relative' } }>
							<code
								style={ {
									...codeStyle,
									padding: '12px 48px 12px 16px',
									display: 'block',
									wordBreak: 'break-all',
								} }
							>
								{ CLAUDE_CODE_COMMAND }
							</code>
							<Button
								icon={ getCommandCopyIcon() }
								variant="tertiary"
								iconSize={ 20 }
								style={ {
									position: 'absolute',
									top: '4px',
									right: '4px',
									color: commandCopyStatus === 'error' ? 'var(--color-error)' : undefined,
								} }
								onClick={ copyCommandToClipboard }
								aria-label={ __( 'Copy command to clipboard' ) }
							/>
						</div>
						<Text as="p" variant="muted">
							{ createInterpolateElement(
								__( 'Then run <code/> in Claude Code to authenticate.' ),
								{
									code: (
										<code key="mcp-cmd" style={ codeStyle }>
											/mcp
										</code>
									),
								}
							) }
						</Text>
					</VStack>
				);
			case 'cursor':
				return (
					<VStack spacing={ 4 }>
						<Button
							variant="primary"
							href="cursor://anysphere.cursor-deeplink/mcp/install?name=WordPress.com&config=eyJjb21tYW5kIjoibnB4IC15IG1jcC1yZW1vdGUgaHR0cHM6Ly9wdWJsaWMtYXBpLndvcmRwcmVzcy5jb20vd3Bjb20vdjIvbWNwL3YxIn0%3D"
							target="_blank"
							style={ { alignSelf: 'flex-start' } }
						>
							{ __( 'Install in Cursor' ) }
						</Button>
					</VStack>
				);
			default:
				return null;
		}
	};

	const quickSetup = renderQuickSetup();
	const clientLabel =
		mcpClientOptions.find( ( opt ) => opt.value === selectedMcpClient )?.label || '';

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Connect AI assistant' ) }
					description={ __( 'Get instructions for connecting your AI assistant.' ) }
					prefix={ <Breadcrumbs length={ 3 } /> }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_mcp_setup_view" />
			<VStack spacing={ 6 }>
				{ /* Card 1: Client picker */ }
				<Card>
					<CardBody>
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Choose your AI assistant' ) }
							value={ selectedMcpClient }
							options={ mcpClientOptions }
							onChange={ setSelectedMcpClient }
						/>
					</CardBody>
				</Card>

				{ /* Card 2: Quick setup (client-specific) */ }
				{ quickSetup && (
					<Card>
						<CardBody>
							<VStack spacing={ 4 }>
								<SectionHeader level={ 3 } title={ __( 'Quick setup' ) } />
								{ quickSetup }
							</VStack>
						</CardBody>
					</Card>
				) }

				{ /* Card 3: Manual setup — JSON config */ }
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<HStack justify="space-between" alignment="center">
								<SectionHeader
									level={ 3 }
									title={ __( 'Manual setup' ) }
									description={ __( "Copy this configuration into your client's MCP settings." ) }
								/>
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
								onChange={ () => {} }
								readOnly
								style={ { minHeight: '140px' } }
							/>
							{ clientDocumentation[ selectedMcpClient ] && (
								<ExternalLink href={ clientDocumentation[ selectedMcpClient ] }>
									{ selectedMcpClient === 'default'
										? __( 'View setup instructions' )
										: sprintf(
												/* translators: %s is the name of the MCP client */
												__( '%s documentation' ),
												clientLabel
										  ) }
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
