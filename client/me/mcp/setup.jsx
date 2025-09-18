import { isAutomatticianQuery } from '@automattic/api-queries';
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
import { useState } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { hasEnabledAccountTools } from './utils';

function McpSetupComponent( { path, userSettings } ) {
	const translate = useTranslate();
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );

	// MCP client selection for configuration format
	const [ selectedMcpClient, setSelectedMcpClient ] = useState( 'claude' );

	// Copy button state
	const [ copyStatus, setCopyStatus ] = useState( 'idle' );

	// MCP client options
	const mcpClientOptions = [
		{ label: 'Claude Desktop', value: 'claude' },
		{ label: 'VS Code', value: 'vscode' },
		{ label: 'Cursor', value: 'cursor' },
		{ label: 'Continue', value: 'continue' },
		{ label: 'Llamafile', value: 'llamafile' },
	];

	// Documentation links for each client
	const clientDocumentation = {
		claude: 'https://docs.anthropic.com/en/docs/claude-desktop-mcp',
		vscode: 'https://code.visualstudio.com/docs/copilot/customization/mcp-servers',
		cursor: 'https://docs.cursor.com/en/context/mcp',
		continue: 'https://docs.continue.dev/customize/deep-dives/mcp',
		llamafile: 'https://github.com/Mozilla-Ocho/llamafile',
		default: 'https://modelcontextprotocol.io/docs/servers',
	};

	const serverName = 'wpcom-mcp';

	// Generate MCP configuration based on selected client
	const generateMcpConfig = ( client ) => {
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
			case 'llamafile':
				return {
					mcpServers: {
						[ serverName ]: baseConfig,
					},
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
	const hasEnabledTools = hasEnabledAccountTools( userSettings );

	if ( ! isAutomattician ) {
		return null;
	}

	if ( ! hasEnabledTools ) {
		return (
			<Main wideLayout className="mcp-setup">
				<PageViewTracker path={ path } title="MCP Setup" />
				<DocumentHead title={ translate( 'MCP Setup' ) } />
				<NavigationHeader navigationItems={ [] } title={ translate( 'MCP Setup' ) } />
				<SectionHeader label={ translate( 'Setup Required' ) } />
				<Card style={ { borderRadius: '0' } }>
					<CardBody>
						<VStack spacing={ 4 }>
							<Text as="p" variant="muted">
								{ translate( 'No MCP tools are currently enabled for your account.' ) }
							</Text>
							<Text as="p" variant="muted">
								{ translate(
									'MCP tools define what actions and data your MCP client can access on your account. You need to enable at least one tool in the main MCP settings before configuring your client.'
								) }
							</Text>
							<Button variant="primary" href="/me/mcp">
								{ translate( 'Go to MCP Settings' ) }
							</Button>
						</VStack>
					</CardBody>
				</Card>
			</Main>
		);
	}

	return (
		<Main wideLayout className="mcp-setup">
			<PageViewTracker path={ path } title="MCP Setup" />
			<DocumentHead title={ translate( 'MCP Setup' ) } />
			<NavigationHeader navigationItems={ [] } title={ translate( 'MCP Setup' ) } />

			<HeaderCake backText={ translate( 'Back' ) } backHref="/me/mcp">
				{ translate( 'WordPress.com MCP Setup' ) }
			</HeaderCake>

			<Card style={ { borderRadius: '0' } }>
				<CardBody>
					<VStack spacing={ 4 }>
						<Text as="p">
							{ translate(
								'WordPress.com provides MCP (Model Context Protocol) support, which allows AI assistants to interact directly with your WordPress.com account.'
							) }
						</Text>
						<Text as="p">
							{ translate(
								'The JSON configuration below sets up a secure connection between your AI assistant and your WordPress.com account. It works by:'
							) }
						</Text>
						<VStack spacing={ 2 }>
							<Text as="li">
								{ translate(
									'Running a bridge server using the WordPress.com-specific MCP package'
								) }
							</Text>
							<Text as="li">
								{ translate(
									'Handling OAuth 2.1 authentication to securely connect to your WordPress.com account'
								) }
							</Text>
							<Text as="li">
								{ translate(
									"Providing real-time access to your account's content and management features"
								) }
							</Text>
						</VStack>
					</VStack>
				</CardBody>
			</Card>

			<div style={ { marginTop: '24px' } }>
				<SectionHeader label={ translate( 'Client Configuration' ) } />
				<Card style={ { borderRadius: '0' } }>
					<CardBody>
						<VStack spacing={ 6 }>
							<SelectControl
								label={ translate( 'MCP Client' ) }
								value={ selectedMcpClient }
								options={ mcpClientOptions }
								onChange={ setSelectedMcpClient }
								help={ translate(
									'Choose your MCP client to get the correct configuration format.'
								) }
							/>

							<VStack spacing={ 4 }>
								<Text as="h3">{ translate( 'MCP Server Configuration' ) }</Text>

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
												size="small"
											>
												{ /* translators: %s is the name of the MCP client */ }
												{ sprintf(
													translate( 'View setup instructions for %s' ),
													mcpClientOptions.find( ( opt ) => opt.value === selectedMcpClient )?.label
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
										value={ JSON.stringify( generateMcpConfig( selectedMcpClient ), null, 2 ) }
										onChange={ () => {} } // Required prop for read-only textarea
										readOnly
										help={ translate(
											"Copy this configuration and paste it into your MCP client's settings."
										) }
										style={ { 'min-height': '240px' } }
									/>
								</VStack>
							</VStack>
						</VStack>
						<VStack spacing={ 3 }>
							<Text as="li" variant="muted" style={ { listStyle: 'none' } }>
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
							</Text>
							<Text as="li" variant="muted" style={ { listStyle: 'none' } }>
								{ createInterpolateElement(
									translate(
										'<code>%s</code> is the official WordPress.com MCP server package'
									).replace( '%s', '@automattic/mcp-wpcom-remote' ),
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
					</CardBody>
				</Card>
			</div>
		</Main>
	);
}

export default connect(
	( state ) => ( {
		userSettings: getUserSettings( state ),
	} ),
	{}
)( McpSetupComponent );
