import { speak } from '@wordpress/a11y';
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
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import {
	CHATGPT_PLUGIN_URL,
	CLAUDE_CODE_COMMAND,
	CLAUDE_CONNECTOR_URL,
	CURSOR_PLUGIN_URL,
	MCP_SERVER_NAME,
	MCP_SERVER_URL,
} from '../connect-agents';

import './style.scss';

type McpClient =
	'claude' | 'claude-code' | 'chatgpt' | 'cursor' | 'vscode' | 'continue' | 'default';

const QUICK_SETUP_CLIENTS: McpClient[] = [ 'claude', 'claude-code', 'chatgpt', 'cursor' ];

const CLIENT_DOCUMENTATION: Record< Exclude< McpClient, 'chatgpt' >, string > = {
	claude:
		'https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp',
	'claude-code': 'https://code.claude.com/docs/en/mcp',
	vscode: 'https://code.visualstudio.com/docs/agent-customization/mcp-servers',
	cursor: 'https://cursor.com/docs/mcp',
	continue: 'https://docs.continue.dev/customize/deep-dives/mcp',
	default: 'https://modelcontextprotocol.io/docs/develop/connect-remote-servers',
};

function generateMcpConfig( client: McpClient ) {
	const baseConfig = { url: MCP_SERVER_URL };

	switch ( client ) {
		case 'claude-code':
			return { mcpServers: { [ MCP_SERVER_NAME ]: { type: 'http', url: MCP_SERVER_URL } } };
		case 'vscode':
			return { servers: { [ MCP_SERVER_NAME ]: baseConfig } };
		default:
			return { mcpServers: { [ MCP_SERVER_NAME ]: baseConfig } };
	}
}

/**
 * The agent picker, quick setup steps and config to copy. The account and site setup pages share it.
 */
export default function McpSetupInstructions() {
	const [ selectedMcpClient, setSelectedMcpClient ] = useState< McpClient >( 'claude' );
	const [ copyStatus, setCopyStatus ] = useState( 'idle' );

	const mcpClientOptions: Array< { label: string; value: McpClient } > = [
		{ label: 'Claude', value: 'claude' },
		{ label: 'Claude Code', value: 'claude-code' },
		{ label: 'ChatGPT/Codex', value: 'chatgpt' },
		{ label: 'Cursor', value: 'cursor' },
		{ label: 'VS Code', value: 'vscode' },
		{ label: 'Continue', value: 'continue' },
		{ label: __( 'Other MCP client' ), value: 'default' },
	];

	const clientDocumentationLabels: Record< Exclude< McpClient, 'chatgpt' >, string > = {
		claude: __( 'Claude documentation' ),
		'claude-code': __( 'Claude Code documentation' ),
		vscode: __( 'VS Code documentation' ),
		cursor: __( 'Cursor documentation' ),
		continue: __( 'Continue documentation' ),
		default: __( 'MCP documentation' ),
	};

	const configText = JSON.stringify( generateMcpConfig( selectedMcpClient ), null, 2 );

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText( configText );
			setCopyStatus( 'success' );
			speak( __( 'Copied' ) );
			setTimeout( () => setCopyStatus( 'idle' ), 2000 );
		} catch {
			// Silently fail — clipboard access may be blocked
		}
	};

	return (
		<>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader level={ 3 } title={ __( 'Choose your AI agent' ) } />
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'AI agent' ) }
							value={ selectedMcpClient }
							options={ mcpClientOptions }
							onChange={ setSelectedMcpClient }
						/>
					</VStack>
				</CardBody>
			</Card>

			{ QUICK_SETUP_CLIENTS.includes( selectedMcpClient ) && (
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader level={ 3 } title={ __( 'Quick setup' ) } />

							{ selectedMcpClient === 'claude' && (
								<ol className="mcp-setup__steps">
									<li>
										<Text as="p" variant="muted">
											{ createInterpolateElement(
												/* translators: <ClaudeConnector/> is a link to the WordPress.com connector in Claude */
												__( 'Open the <ClaudeConnector/> page in Claude.' ),
												{
													ClaudeConnector: (
														<ExternalLink href={ CLAUDE_CONNECTOR_URL }>
															{ __( 'WordPress.com connector' ) }
														</ExternalLink>
													),
												}
											) }
										</Text>
									</li>
									<li>
										<Text as="p" variant="muted">
											{ __( 'Click “Connect” and follow the prompts.' ) }
										</Text>
									</li>
								</ol>
							) }

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
														code: <code className="mcp-setup__code">{ CLAUDE_CODE_COMMAND }</code>,
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
														mcpJson: <code className="mcp-setup__code">.mcp.json</code>,
														claudeJson: <code className="mcp-setup__code">~/.claude.json</code>,
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
														code: <code className="mcp-setup__code">/mcp</code>,
													}
												) }
											</Text>
										</li>
									</ol>
								</VStack>
							) }

							{ selectedMcpClient === 'chatgpt' && (
								<ol className="mcp-setup__steps">
									<li>
										<Text as="p" variant="muted">
											{ createInterpolateElement(
												/* translators: <ChatGptPlugin/> is a link to the WordPress plugin in ChatGPT */
												__( 'Open the <ChatGptPlugin/> page in ChatGPT.' ),
												{
													ChatGptPlugin: (
														<ExternalLink href={ CHATGPT_PLUGIN_URL }>
															{ __( 'WordPress plugin' ) }
														</ExternalLink>
													),
												}
											) }
										</Text>
									</li>
									<li>
										<Text as="p" variant="muted">
											{ __( 'Click “Install” and follow the prompts.' ) }
										</Text>
									</li>
								</ol>
							) }

							{ selectedMcpClient === 'cursor' && (
								<VStack spacing={ 4 }>
									<ol className="mcp-setup__steps">
										<li>
											<Text as="p" variant="muted">
												{ createInterpolateElement(
													/* translators: <CursorPlugin/> is a link to the WordPress plugin on the Cursor Marketplace */
													__( 'Open the <CursorPlugin/> page on the Cursor Marketplace.' ),
													{
														CursorPlugin: (
															<ExternalLink href={ CURSOR_PLUGIN_URL }>
																{ __( 'WordPress plugin' ) }
															</ExternalLink>
														),
													}
												) }
											</Text>
										</li>
										<li>
											<Text as="p" variant="muted">
												{ __( 'Click “Add to Cursor” and follow the prompts.' ) }
											</Text>
										</li>
									</ol>
									<Text as="p" variant="muted">
										{ createInterpolateElement(
											/* translators: <code/> is replaced with a Cursor chat command */
											__( 'Or run <code/> in the Cursor chat.' ),
											{
												code: <code className="mcp-setup__code">/add-plugin wordpress-com</code>,
											}
										) }
									</Text>
								</VStack>
							) }
						</VStack>
					</CardBody>
				</Card>
			) }

			{ /* ChatGPT connects through its own plugins UI, so there is no config to copy. */ }
			{ selectedMcpClient !== 'chatgpt' && (
				<Card>
					<CardBody>
						<VStack spacing={ 2 }>
							<HStack justify="space-between" alignment="center">
								<SectionHeader level={ 3 } title={ __( 'Manual setup' ) } />
								<Button
									__next40pxDefaultSize
									icon={ copyStatus === 'success' ? check : copy }
									variant="tertiary"
									iconSize={ 20 }
									onClick={ copyToClipboard }
									aria-label={ __( 'Copy configuration to clipboard' ) }
								/>
							</HStack>
							<Text as="p" variant="muted">
								{ __( 'Copy this configuration into your client’s MCP settings.' ) }
							</Text>
							<TextareaControl
								className="mcp-setup__config-textarea"
								__nextHasNoMarginBottom
								label={ __( 'MCP configuration' ) }
								hideLabelFromVision
								value={ configText }
								onChange={ () => {} }
								readOnly
							/>
							<ExternalLink href={ CLIENT_DOCUMENTATION[ selectedMcpClient ] }>
								{ clientDocumentationLabels[ selectedMcpClient ] }
							</ExternalLink>
						</VStack>
					</CardBody>
				</Card>
			) }
		</>
	);
}
