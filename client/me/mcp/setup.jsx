import { userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	TextareaControl,
	SelectControl,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	Card,
	CardBody,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { copy, check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import { SectionHeader } from '../../dashboard/components/section-header';
import { useMcpPageChrome } from './mcp-page-header';
import { hasEnabledAccountTools } from './utils';

import './style.scss';

function McpSetupComponent( { path } ) {
	const translate = useTranslate();
	const { documentTitle, navigationHeaderProps } = useMcpPageChrome();
	const {
		data: userSettings,
		isLoading: isLoadingUserSettings,
		error: userSettingsError,
	} = useQuery( userSettingsQuery() );

	const [ selectedMcpClient, setSelectedMcpClient ] = useState( 'claude' );
	const [ copyStatus, setCopyStatus ] = useState( 'idle' );
	const [ reauthRequired, setReauthRequired ] = useState( false );

	useEffect( () => {
		const checkReauth = () => setReauthRequired( twoStepAuthorization.isReauthRequired() );
		twoStepAuthorization.on( 'change', checkReauth );
		checkReauth();
		return () => twoStepAuthorization.off( 'change', checkReauth );
	}, [] );

	const mcpClientOptions = [
		{ label: 'Claude', value: 'claude' },
		{ label: 'Claude Code', value: 'claude-code' },
		{ label: 'ChatGPT/Codex', value: 'chatgpt' },
		{ label: 'Cursor', value: 'cursor' },
		{ label: 'VS Code', value: 'vscode' },
		{ label: 'Continue', value: 'continue' },
		{ label: translate( 'Other MCP client' ), value: 'default' },
	];

	const clientDocumentation = {
		claude: 'https://docs.claude.com/en/docs/mcp',
		'claude-code': 'https://code.claude.com/docs/en/mcp',
		vscode: 'https://code.visualstudio.com/docs/copilot/customization/mcp-servers',
		cursor: 'https://docs.cursor.com/en/context/mcp',
		continue: 'https://docs.continue.dev/customize/deep-dives/mcp',
		default: 'https://modelcontextprotocol.io/docs/develop/connect-local-servers',
	};

	const clientDocumentationLabels = {
		claude: translate( 'Claude documentation' ),
		'claude-code': translate( 'Claude Code documentation' ),
		vscode: translate( 'VS Code documentation' ),
		cursor: translate( 'Cursor documentation' ),
		continue: translate( 'Continue documentation' ),
		default: translate( 'MCP documentation' ),
	};

	const serverName = 'wpcom-mcp';

	const generateMcpConfig = ( client ) => {
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

	if ( userSettingsError ) {
		return null;
	}

	const renderLayout = ( children ) => (
		<Main wideLayout className="mcp mcp-setup">
			<PageViewTracker path={ path } title="Connect AI agent" />
			<DocumentHead title={ documentTitle } />
			<NavigationHeader { ...navigationHeaderProps } />
			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
			{ ! isLoadingUserSettings && ! reauthRequired && children }
		</Main>
	);

	const hasEnabledTools = hasEnabledAccountTools( userSettings );

	if ( ! hasEnabledTools ) {
		return renderLayout(
			<>
				<HeaderCake backText={ translate( 'Back' ) } backHref="/me/mcp">
					{ translate( 'Connect AI agent' ) }
				</HeaderCake>
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader level={ 3 } title={ translate( 'Setup required' ) } />
							<Text as="p" size="medium">
								{ translate( 'No MCP access is currently enabled for your account.' ) }
							</Text>
							<Text as="p" size="medium">
								{ translate(
									'You need to enable MCP access in the main MCP settings before configuring your client.'
								) }
							</Text>
							<Button variant="primary" href="/me/mcp" className="mcp-setup__action-button">
								{ translate( 'Go to MCP Settings' ) }
							</Button>
						</VStack>
					</CardBody>
				</Card>
			</>
		);
	}

	return renderLayout(
		<>
			<HeaderCake backText={ translate( 'Back' ) } backHref="/me/mcp">
				{ translate( 'Connect AI agent' ) }
			</HeaderCake>

			<Card>
				<CardBody>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ translate( 'Choose your AI agent' ) }
						value={ selectedMcpClient }
						options={ mcpClientOptions }
						onChange={ setSelectedMcpClient }
					/>
				</CardBody>
			</Card>

			{ ( selectedMcpClient === 'claude' ||
				selectedMcpClient === 'claude-code' ||
				selectedMcpClient === 'chatgpt' ||
				selectedMcpClient === 'cursor' ) && (
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader level={ 3 } title={ translate( 'Quick setup' ) } />

							{ selectedMcpClient === 'claude' && (
								<ol className="mcp-setup__steps">
									<li>
										<Text as="p" size="medium">
											{ createInterpolateElement(
												/* translators: <ClaudeSettings/> is a link to the Claude settings page */
												translate( 'Open <ClaudeSettings/>.' ),
												{
													ClaudeSettings: (
														<ExternalLink href="https://claude.ai/settings/connectors">
															{ translate( 'Claude settings' ) }
														</ExternalLink>
													),
												}
											) }
										</Text>
									</li>
									<li>
										<Text as="p" size="medium">
											{ translate( 'Click “Browse connectors” and search for WordPress.com.' ) }
										</Text>
									</li>
									<li>
										<Text as="p" size="medium">
											{ translate( 'Select WordPress.com and follow the prompts.' ) }
										</Text>
									</li>
								</ol>
							) }

							{ selectedMcpClient === 'claude-code' && (
								<VStack spacing={ 4 }>
									<Text as="p" size="medium">
										{ translate(
											'Claude Code uses a different config format with type: "http". Use the CLI or copy the configuration below.'
										) }
									</Text>
									<ol className="mcp-setup__steps">
										<li>
											<Text as="p" size="medium">
												{ createInterpolateElement(
													translate( 'Run this command in your terminal: <code>%s</code>' ).replace(
														'%s',
														'claude mcp add --transport http wpcom-mcp https://public-api.wordpress.com/wpcom/v2/mcp/v1'
													),
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
											<Text as="p" size="medium">
												{ createInterpolateElement(
													translate(
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
											<Text as="p" size="medium">
												{ createInterpolateElement(
													translate(
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

							{ selectedMcpClient === 'chatgpt' && (
								<ol className="mcp-setup__steps">
									<li>
										<Text as="p" size="medium">
											{ createInterpolateElement(
												/* translators: <ChatGptSettings/> is a link to the ChatGPT plugins settings page */
												translate( 'Open <ChatGptSettings/>.' ),
												{
													ChatGptSettings: (
														<ExternalLink href="https://chatgpt.com/plugins">
															{ translate( 'ChatGPT plugins settings' ) }
														</ExternalLink>
													),
												}
											) }
										</Text>
									</li>
									<li>
										<Text as="p" size="medium">
											{ translate( 'Search for WordPress.com.' ) }
										</Text>
									</li>
									<li>
										<Text as="p" size="medium">
											{ translate( 'Click “Install plugin”.' ) }
										</Text>
									</li>
								</ol>
							) }

							{ selectedMcpClient === 'cursor' && (
								<VStack spacing={ 4 }>
									<Text as="p" size="medium">
										{ translate(
											'For Cursor users, use the one-click install to add the WordPress.com MCP app.'
										) }
									</Text>
									<Button
										variant="primary"
										href="cursor://anysphere.cursor-deeplink/mcp/install?name=WordPress.com&config=eyJjb21tYW5kIjoibnB4IC15IG1jcC1yZW1vdGUgaHR0cHM6Ly9wdWJsaWMtYXBpLndvcmRwcmVzcy5jb20vd3Bjb20vdjIvbWNwL3YxIn0%3D"
										target="_blank"
										className="mcp-setup__action-button"
									>
										{ translate( 'Install in Cursor' ) }
									</Button>
								</VStack>
							) }
						</VStack>
					</CardBody>
				</Card>
			) }

			{ selectedMcpClient !== 'chatgpt' && (
				<Card>
					<CardBody>
						<VStack spacing={ 2 }>
							<HStack justify="space-between" alignment="center">
								<SectionHeader level={ 3 } title={ translate( 'Manual setup' ) } />
								<Button
									icon={ copyStatus === 'success' ? check : copy }
									variant="tertiary"
									iconSize={ 20 }
									onClick={ copyToClipboard }
									aria-label={ translate( 'Copy configuration to clipboard' ) }
								/>
							</HStack>
							<Text as="p" size="medium">
								{ translate( 'Copy this configuration into your client\u2019s MCP settings.' ) }
							</Text>
							<TextareaControl
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
					</CardBody>
				</Card>
			) }
		</>
	);
}

export default McpSetupComponent;
