import { userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	TextareaControl,
	SelectControl,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Card,
	CardBody,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { copy, check, error } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import LegacySectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import { successNotice } from 'calypso/state/notices/actions';
import { SectionHeader } from '../../dashboard/components/section-header';
import { hasEnabledAccountTools } from './utils';

import './style.scss';

const EXPLORATIONS_STORAGE_KEY = 'mcp-explore-variation';

function McpSetupComponent( { path } ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const {
		data: userSettings,
		isLoading: isLoadingUserSettings,
		error: userSettingsError,
	} = useQuery( userSettingsQuery() );

	// MCP client selection for configuration format
	const [ selectedMcpClient, setSelectedMcpClient ] = useState( 'claude' );

	// Copy button state
	const [ copyStatus, setCopyStatus ] = useState( 'idle' );
	const [ commandCopyStatus, setCommandCopyStatus ] = useState( 'idle' );

	// Reauth state
	const [ reauthRequired, setReauthRequired ] = useState( false );

	// Monitor reauth status
	useEffect( () => {
		const checkReauth = () => {
			const reauth = twoStepAuthorization.isReauthRequired();
			setReauthRequired( reauth );
		};

		twoStepAuthorization.on( 'change', checkReauth );
		checkReauth(); // Initial check

		return () => twoStepAuthorization.off( 'change', checkReauth );
	}, [] ); // Empty dependency array - only run once on mount

	// MCP client options
	const mcpClientOptions = [
		{ label: 'Claude', value: 'claude' },
		{ label: 'Claude Code', value: 'claude-code' },
		{ label: 'Cursor', value: 'cursor' },
		{ label: 'VS Code', value: 'vscode' },
		{ label: 'Continue', value: 'continue' },
		{ label: translate( 'Other MCP client' ), value: 'default' },
	];

	// Documentation links for each client
	const clientDocumentation = {
		claude: 'https://docs.claude.com/en/docs/mcp',
		'claude-code': 'https://code.claude.com/docs/en/mcp',
		vscode: 'https://code.visualstudio.com/docs/copilot/customization/mcp-servers',
		cursor: 'https://docs.cursor.com/en/context/mcp',
		continue: 'https://docs.continue.dev/customize/deep-dives/mcp',
		default: 'https://modelcontextprotocol.io/docs/develop/connect-local-servers',
	};

	const serverName = 'wpcom-mcp';

	// Generate MCP configuration based on selected client
	const generateMcpConfig = ( client ) => {
		const baseConfig = {
			url: 'https://public-api.wordpress.com/wpcom/v2/mcp/v1',
		};

		switch ( client ) {
			case 'claude':
				return {
					mcpServers: {
						[ serverName ]: baseConfig,
					},
				};
			case 'claude-code':
				return {
					mcpServers: {
						[ serverName ]: {
							type: 'http',
							url: baseConfig.url,
						},
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
			reduxDispatch(
				successNotice( translate( 'Copied to clipboard' ), {
					id: 'mcp-setup-copied',
					duration: 3000,
				} )
			);
			setTimeout( () => setCopyStatus( 'idle' ), 2000 );
		} catch ( err ) {
			setCopyStatus( 'error' );
			setTimeout( () => setCopyStatus( 'idle' ), 2000 );
		}
	};

	const CLAUDE_CODE_COMMAND =
		'claude mcp add --transport http wpcom-mcp https://public-api.wordpress.com/wpcom/v2/mcp/v1';

	// Copy CLI command to clipboard
	const copyCommandToClipboard = async () => {
		try {
			await navigator.clipboard.writeText( CLAUDE_CODE_COMMAND );
			setCommandCopyStatus( 'success' );
			reduxDispatch(
				successNotice( translate( 'Copied to clipboard' ), {
					id: 'mcp-setup-copied',
					duration: 3000,
				} )
			);
			setTimeout( () => setCommandCopyStatus( 'idle' ), 2000 );
		} catch ( err ) {
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

	const variation = localStorage.getItem( EXPLORATIONS_STORAGE_KEY );
	const isSquareCorners = variation === 'F' || variation === 'G';

	// Handle error states only - allow loading to continue so reauth can show
	if ( userSettingsError ) {
		return null;
	}

	// Common layout wrapper
	const renderLayout = ( children ) => (
		<Main wideLayout className="mcp-setup">
			<PageViewTracker path={ path } title="MCP Setup" />
			<DocumentHead title={ translate( 'MCP Setup' ) } />
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'AI and MCP' ) }
				subtitle={ translate(
					'Control how AI assistants interact with your WordPress.com account and sites.'
				) }
			/>
			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
			{ ! isLoadingUserSettings && ! reauthRequired && children }
		</Main>
	);

	// Check if any account-level tools are enabled using the new nested structure
	const hasEnabledTools = hasEnabledAccountTools( userSettings );

	if ( ! hasEnabledTools ) {
		const isLegacyEmpty = variation === 'F';
		return renderLayout(
			isLegacyEmpty ? (
				<>
					<LegacySectionHeader label={ translate( 'Enable AI access first' ) } />
					<Card isRounded={ false }>
						<CardBody>
							<VStack spacing={ 4 }>
								<p style={ { color: '#646970', margin: 0, fontSize: '14px' } }>
									{ translate( 'You need to enable AI access before connecting your assistant.' ) }
								</p>
								<Button variant="primary" href="/me/mcp" style={ { alignSelf: 'flex-start' } }>
									{ translate( 'Go to AI and MCP' ) }
								</Button>
							</VStack>
						</CardBody>
					</Card>
				</>
			) : (
				<Card
					isRounded={ ! isSquareCorners }
					style={ isSquareCorners ? { borderRadius: 0 } : undefined }
				>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader
								level={ 3 }
								title={
									isSquareCorners
										? translate( 'Enable AI access first' )
										: translate( 'Setup Required' )
								}
							/>
							<Text
								as="p"
								color={ isSquareCorners ? '#646970' : undefined }
								size={ isSquareCorners ? undefined : 'medium' }
							>
								{ isSquareCorners
									? translate( 'You need to enable AI access before connecting your assistant.' )
									: translate( 'No MCP tools are currently enabled for your account.' ) }
							</Text>
							{ ! isSquareCorners && (
								<Text as="p" size="medium">
									{ translate(
										'MCP tools define what actions and data your MCP client can access on your account. You need to enable at least one tool in the main MCP settings before configuring your client.'
									) }
								</Text>
							) }
							<Button variant="primary" href="/me/mcp" style={ { alignSelf: 'flex-start' } }>
								{ isSquareCorners
									? translate( 'Go to AI and MCP' )
									: translate( 'Go to MCP Settings' ) }
							</Button>
						</VStack>
					</CardBody>
				</Card>
			)
		);
	}

	const codeStyle = {
		backgroundColor: '#f0f0f1',
		padding: '2px 6px',
		borderRadius: '3px',
		fontFamily: 'monospace',
		fontSize: '13px',
	};

	const clientLabel =
		mcpClientOptions.find( ( opt ) => opt.value === selectedMcpClient )?.label || '';

	// ─── Option G: multi-card layout matching the dashboard ────────
	const renderQuickSetupG = () => {
		switch ( selectedMcpClient ) {
			case 'claude':
				return (
					<VStack spacing={ 4 }>
						<ol
							style={ {
								color: '#646970',
								paddingInlineStart: '20px',
								margin: '0',
								fontSize: '14px',
							} }
						>
							<li>
								<Text as="p" color="#646970">
									{ createInterpolateElement( translate( 'Open <ClaudeSettings/>.' ), {
										ClaudeSettings: (
											<ExternalLink href="https://claude.ai/settings/connectors">
												{ translate( 'Claude settings' ) }
											</ExternalLink>
										),
									} ) }
								</Text>
							</li>
							<li>
								<Text as="p" color="#646970">
									{ translate( 'Click "Browse connectors" and search for WordPress.com.' ) }
								</Text>
							</li>
							<li>
								<Text as="p" color="#646970">
									{ translate( 'Select WordPress.com and follow the prompts.' ) }
								</Text>
							</li>
						</ol>
					</VStack>
				);
			case 'claude-code':
				return (
					<VStack spacing={ 4 }>
						<Text as="p" color="#646970">
							{ translate( 'Run this command in your terminal:' ) }
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
									top: '2px',
									right: '2px',
									color: commandCopyStatus === 'error' ? 'var(--color-error)' : undefined,
								} }
								onClick={ copyCommandToClipboard }
								aria-label={ translate( 'Copy command to clipboard' ) }
							/>
						</div>
						<Text as="p" color="#646970">
							{ createInterpolateElement(
								translate( 'Then run <code/> in Claude Code to authenticate.' ),
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
							{ translate( 'Install in Cursor' ) }
						</Button>
					</VStack>
				);
			default:
				return null;
		}
	};

	if ( isSquareCorners ) {
		const quickSetup = renderQuickSetupG();
		const isLegacyStyle = variation === 'F';

		return renderLayout(
			<>
				<HeaderCake backText={ translate( 'Back' ) } backHref="/me/mcp">
					{ translate( 'Connect AI assistant' ) }
				</HeaderCake>
				{ isLegacyStyle ? (
					<>
						{ /* Client picker */ }
						<LegacySectionHeader label={ translate( 'AI assistant' ) } />
						<Card isRounded={ false }>
							<CardBody>
								<SelectControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={ translate( 'Choose your AI assistant' ) }
									value={ selectedMcpClient }
									options={ mcpClientOptions }
									onChange={ setSelectedMcpClient }
								/>
							</CardBody>
						</Card>

						{ /* Quick setup (client-specific) */ }
						{ quickSetup && (
							<>
								<LegacySectionHeader
									label={ translate( 'Quick setup' ) }
									className="mcp__section-header"
								/>
								<Card isRounded={ false }>
									<CardBody>{ quickSetup }</CardBody>
								</Card>
							</>
						) }

						{ /* Manual setup — JSON config */ }
						<LegacySectionHeader
							label={ translate( 'Manual setup' ) }
							className="mcp__section-header"
						>
							<Button
								icon={ getCopyIcon() }
								variant="tertiary"
								iconSize={ 16 }
								size="small"
								style={ {
									minWidth: '24px',
									height: '24px',
									padding: 0,
									color: copyStatus === 'error' ? 'var(--color-error)' : undefined,
								} }
								onClick={ copyToClipboard }
								aria-label={ translate( 'Copy configuration to clipboard' ) }
							/>
						</LegacySectionHeader>
						<Card isRounded={ false }>
							<CardBody>
								<VStack spacing={ 4 }>
									<p style={ { color: '#646970', margin: 0, fontSize: '14px' } }>
										{ translate( "Copy this configuration into your client's MCP settings." ) }
									</p>
									<TextareaControl
										__nextHasNoMarginBottom
										value={ JSON.stringify( generateMcpConfig( selectedMcpClient ), null, 2 ) }
										onChange={ () => {} }
										readOnly
										style={ { minHeight: '140px' } }
									/>
									{ clientDocumentation[ selectedMcpClient ] && (
										<ExternalLink
											href={ clientDocumentation[ selectedMcpClient ] }
											style={ { fontSize: '13px' } }
										>
											{ selectedMcpClient === 'default'
												? translate( 'View setup instructions' )
												: sprintf( translate( '%s documentation' ), clientLabel ) }
										</ExternalLink>
									) }
								</VStack>
							</CardBody>
						</Card>
					</>
				) : (
					<VStack spacing={ 6 }>
						{ /* Card 1: Client picker */ }
						<Card isRounded={ false } style={ { borderRadius: 0 } }>
							<CardBody>
								<SelectControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={ translate( 'Choose your AI assistant' ) }
									value={ selectedMcpClient }
									options={ mcpClientOptions }
									onChange={ setSelectedMcpClient }
								/>
							</CardBody>
						</Card>

						{ /* Card 2: Quick setup (client-specific) */ }
						{ quickSetup && (
							<Card isRounded={ false } style={ { borderRadius: 0 } }>
								<CardBody>
									<VStack spacing={ 4 }>
										<SectionHeader level={ 3 } title={ translate( 'Quick setup' ) } />
										{ quickSetup }
									</VStack>
								</CardBody>
							</Card>
						) }

						{ /* Card 3: Manual setup — JSON config */ }
						<Card isRounded={ false } style={ { borderRadius: 0 } }>
							<CardBody>
								<VStack spacing={ 4 }>
									<div
										style={ {
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
										} }
									>
										<SectionHeader
											level={ 3 }
											title={ translate( 'Manual setup' ) }
											description={ translate(
												"Copy this configuration into your client's MCP settings."
											) }
										/>
										<Button
											icon={ getCopyIcon() }
											variant="tertiary"
											iconSize={ 20 }
											style={ {
												color: copyStatus === 'error' ? 'var(--color-error)' : undefined,
											} }
											onClick={ copyToClipboard }
											aria-label={ translate( 'Copy configuration to clipboard' ) }
										/>
									</div>
									<TextareaControl
										__nextHasNoMarginBottom
										value={ JSON.stringify( generateMcpConfig( selectedMcpClient ), null, 2 ) }
										onChange={ () => {} }
										readOnly
										style={ { minHeight: '140px' } }
									/>
									{ clientDocumentation[ selectedMcpClient ] && (
										<ExternalLink
											href={ clientDocumentation[ selectedMcpClient ] }
											style={ { fontSize: '13px' } }
										>
											{ selectedMcpClient === 'default'
												? translate( 'View setup instructions' )
												: sprintf( translate( '%s documentation' ), clientLabel ) }
										</ExternalLink>
									) }
								</VStack>
							</CardBody>
						</Card>
					</VStack>
				) }
			</>
		);
	}

	return renderLayout(
		<>
			<HeaderCake backText={ translate( 'Back' ) } backHref="/me/mcp">
				{ translate( 'WordPress.com MCP Setup' ) }
			</HeaderCake>

			<Card>
				<CardBody>
					<VStack spacing={ 6 }>
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ translate( 'MCP Client' ) }
							value={ selectedMcpClient }
							options={ mcpClientOptions }
							onChange={ setSelectedMcpClient }
							help={ translate(
								'Choose your MCP client to get the correct configuration format.'
							) }
						/>

						{ /* Quick Setup for Claude */ }
						{ selectedMcpClient === 'claude' && (
							<VStack spacing={ 4 } style={ { borderBottom: '1px solid rgba(0, 0, 0, 0.1)' } }>
								<CardHeading tagName="h1" size={ 16 } isBold>
									{ translate( 'Quick Setup' ) }
								</CardHeading>
								<Text as="p" size="medium">
									{ translate( 'For Claude users, connect WordPress.com from Claude Connectors.' ) }
								</Text>
								<Text as="p" size="medium">
									{ translate( 'Installation steps:' ) }
								</Text>
								<ol>
									<li>
										<Text as="p" size="medium">
											{ createInterpolateElement(
												/* translators: %s is the link to the Claude settings page */
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
											{ translate( 'Click the "Browse connectors" button.' ) }
										</Text>
									</li>
									<li>
										<Text as="p" size="medium">
											{ translate( 'Search for WordPress.com.' ) }
										</Text>
									</li>
									<li>
										<Text as="p" size="medium">
											{ translate( 'Select WordPress.com and follow the prompts to connect.' ) }
										</Text>
									</li>
								</ol>
							</VStack>
						) }

						{ /* Quick Setup for Claude Code */ }
						{ selectedMcpClient === 'claude-code' && (
							<VStack
								spacing={ 4 }
								style={ { borderBottom: '1px solid rgba(0, 0, 0, 0.1)', paddingBottom: '24px' } }
							>
								<CardHeading tagName="h1" size={ 16 } isBold>
									{ translate( 'Quick Setup' ) }
								</CardHeading>
								<Text as="p" size="medium">
									{ translate(
										'Claude Code uses a different config format with type: "http". Use the CLI or copy the configuration below.'
									) }
								</Text>
								<Text as="p" size="medium">
									{ translate( 'Installation steps:' ) }
								</Text>
								<ol>
									<li>
										<Text as="p" size="medium">
											{ createInterpolateElement(
												translate( 'Run this command in your terminal: <code>%s</code>' ).replace(
													'%s',
													'claude mcp add --transport http wpcom-mcp https://public-api.wordpress.com/wpcom/v2/mcp/v1'
												),
												{
													code: (
														<code
															key="claude-code-cmd"
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
														<code
															key="mcp-json"
															style={ {
																backgroundColor: '#f0f0f1',
																padding: '2px 6px',
																borderRadius: '3px',
																fontFamily: 'monospace',
																fontSize: '13px',
															} }
														>
															.mcp.json
														</code>
													),
													claudeJson: (
														<code
															key="claude-json"
															style={ {
																backgroundColor: '#f0f0f1',
																padding: '2px 6px',
																borderRadius: '3px',
																fontFamily: 'monospace',
																fontSize: '13px',
															} }
														>
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
														<code
															key="mcp-cmd"
															style={ {
																backgroundColor: '#f0f0f1',
																padding: '2px 6px',
																borderRadius: '3px',
																fontFamily: 'monospace',
																fontSize: '13px',
															} }
														>
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
							<VStack
								spacing={ 4 }
								style={ { borderBottom: '1px solid rgba(0, 0, 0, 0.1)', paddingBottom: '24px' } }
							>
								<CardHeading tagName="h1" size={ 16 } isBold>
									{ translate( 'Quick Setup' ) }
								</CardHeading>
								<Text as="p" size="medium">
									{ translate(
										'For Cursor users, use the one-click install to add the WordPress.com MCP app.'
									) }
								</Text>
								<Button
									variant="primary"
									href="cursor://anysphere.cursor-deeplink/mcp/install?name=WordPress.com&config=eyJjb21tYW5kIjoibnB4IC15IG1jcC1yZW1vdGUgaHR0cHM6Ly9wdWJsaWMtYXBpLndvcmRwcmVzcy5jb20vd3Bjb20vdjIvbWNwL3YxIn0%3D"
									target="_blank"
									style={ { alignSelf: 'flex-start' } }
								>
									{ translate( 'Install in Cursor' ) }
								</Button>
							</VStack>
						) }

						<VStack spacing={ 4 }>
							<CardHeading tagName="h1" size={ 16 } isBold>
								{ translate( 'Manual Setup' ) }
							</CardHeading>

							<VStack spacing={ 3 }>
								<div
									style={ {
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
									} }
								>
									{ clientDocumentation[ selectedMcpClient ] && (
										<ExternalLink
											href={ clientDocumentation[ selectedMcpClient ] }
											target="_blank"
											style={ { fontSize: 'inherit' } }
										>
											{ /* translators: %s is the name of the MCP client */ }
											{ selectedMcpClient === 'default'
												? translate( 'View setup instructions for other MCP client' )
												: sprintf(
														translate( 'View setup instructions for %s' ),
														mcpClientOptions.find( ( opt ) => opt.value === selectedMcpClient )
															?.label
												  ) }
										</ExternalLink>
									) }
									<Button
										icon={ getCopyIcon() }
										variant="tertiary"
										size="small"
										style={ {
											color: copyStatus === 'error' ? 'var(--color-error)' : undefined,
										} }
										onClick={ copyToClipboard }
										aria-label={ translate( 'Copy configuration to clipboard' ) }
									/>
								</div>
								<TextareaControl
									__nextHasNoMarginBottom
									value={ JSON.stringify( generateMcpConfig( selectedMcpClient ), null, 2 ) }
									onChange={ () => {} } // Required prop for read-only textarea
									readOnly
									help={ translate(
										"Copy this configuration and paste it into your MCP client's settings."
									) }
									style={ { minHeight: '160px' } }
								/>
							</VStack>
						</VStack>
					</VStack>
					<VStack spacing={ 3 }>
						<ul style={ { listStyle: 'none', padding: '0', margin: '0' } }>
							<li>
								{ createInterpolateElement(
									translate(
										'<code>%s</code> is a unique identifier for this WordPress.com account connection'
									).replace( '%s', serverName ),
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
							</li>
							<li>
								{ createInterpolateElement(
									translate(
										'<code>%s</code> is the official WordPress.com MCP server endpoint'
									).replace( '%s', 'https://public-api.wordpress.com/wpcom/v2/mcp/v1' ),
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
												https://public-api.wordpress.com/wpcom/v2/mcp/v1
											</code>
										),
									}
								) }
							</li>
						</ul>
					</VStack>
				</CardBody>
			</Card>
		</>
	);
}

export default McpSetupComponent;
