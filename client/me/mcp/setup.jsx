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
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import { hasEnabledAccountTools } from './utils';

function McpSetupComponent( { path } ) {
	const translate = useTranslate();
	const {
		data: userSettings,
		isLoading: isLoadingUserSettings,
		error: userSettingsError,
	} = useQuery( userSettingsQuery() );

	// MCP client selection for configuration format
	const [ selectedMcpClient, setSelectedMcpClient ] = useState( 'claude' );

	// Copy button state
	const [ copyStatus, setCopyStatus ] = useState( 'idle' );

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
		{ label: 'Cursor', value: 'cursor' },
		{ label: 'VS Code', value: 'vscode' },
		{ label: 'Continue', value: 'continue' },
		{ label: translate( 'Other MCP client' ), value: 'default' },
	];

	// Documentation links for each client
	const clientDocumentation = {
		claude: 'https://docs.claude.com/en/docs/mcp',
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

	// Handle error states only - allow loading to continue so reauth can show
	if ( userSettingsError ) {
		return null;
	}

	// Common layout wrapper
	const renderLayout = ( children ) => (
		<Main wideLayout className="mcp-setup">
			<PageViewTracker path={ path } title="MCP Setup" />
			<DocumentHead title={ translate( 'MCP Setup' ) } />
			<NavigationHeader navigationItems={ [] } title={ translate( 'MCP Setup' ) } />
			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
			{ ! isLoadingUserSettings && ! reauthRequired && children }
		</Main>
	);

	// Check if any account-level tools are enabled using the new nested structure
	const hasEnabledTools = hasEnabledAccountTools( userSettings );

	if ( ! hasEnabledTools ) {
		return renderLayout(
			<>
				<SectionHeader label={ translate( 'Setup Required' ) } />
				<Card isRounded={ false }>
					<CardBody>
						<VStack spacing={ 4 }>
							<Text as="p" size="medium">
								{ translate( 'No MCP tools are currently enabled for your account.' ) }
							</Text>
							<Text as="p" size="medium">
								{ translate(
									'MCP tools define what actions and data your MCP client can access on your account. You need to enable at least one tool in the main MCP settings before configuring your client.'
								) }
							</Text>
							<Button variant="primary" href="/me/mcp" style={ { alignSelf: 'flex-start' } }>
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
				{ translate( 'WordPress.com MCP Setup' ) }
			</HeaderCake>

			<Card style={ { borderRadius: '0' } }>
				<CardBody>
					<VStack spacing={ 4 }>
						<Text as="p" size="medium">
							{ translate(
								'WordPress.com provides MCP (Model Context Protocol) support, which allows AI assistants to interact directly with your WordPress.com account.'
							) }
						</Text>
						<Text as="p" size="medium">
							{ translate(
								'The JSON configuration below sets up a secure connection between your AI assistant and your WordPress.com account by:'
							) }
						</Text>
						<VStack spacing={ 2 }>
							<ul>
								<li>{ translate( 'Connecting to the WordPress.com MCP endpoint' ) }</li>
								<li>
									{ translate(
										'Handling OAuth 2.1 authentication to securely connect to your WordPress.com account'
									) }
								</li>
								<li>
									{ translate(
										"Providing real-time access to your account's content and management features"
									) }
								</li>
							</ul>
						</VStack>
					</VStack>
				</CardBody>
			</Card>

			<div style={ { marginTop: '24px' } }>
				<SectionHeader label={ translate( 'MCP Client Configuration' ) } />
				<Card isRounded={ false }>
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
								<VStack spacing={ 4 } style={ { borderBottom: '1px solid #e0e0e0' } }>
									<CardHeading tagName="h1" size={ 16 } isBold>
										{ translate( 'Quick Setup' ) }
									</CardHeading>
									<Text as="p" size="medium">
										{ translate(
											'For Claude users, connect WordPress.com from Claude Connectors.'
										) }
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

							{ /* Quick Setup for Cursor */ }
							{ selectedMcpClient === 'cursor' && (
								<VStack
									spacing={ 4 }
									style={ { borderBottom: '1px solid #e0e0e0', paddingBottom: '24px' } }
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
			</div>
		</>
	);
}

export default McpSetupComponent;
