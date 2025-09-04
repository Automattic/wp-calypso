import { isAutomatticianQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button, ExternalLink, TextareaControl, SelectControl } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { copy, check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import './style.scss';

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
		} catch ( error ) {
			setCopyStatus( 'error' );
			setTimeout( () => setCopyStatus( 'idle' ), 2000 );
		}
	};

	// Check if any abilities are enabled
	const hasEnabledAbilities =
		userSettings?.mcp_abilities &&
		Object.values( userSettings.mcp_abilities ).some( ( ability ) => ability.enabled );

	if ( ! isAutomattician ) {
		return null;
	}

	if ( ! hasEnabledAbilities ) {
		return (
			<Main wideLayout className="mcp-setup">
				<PageViewTracker path={ path } title="MCP Setup" />
				<DocumentHead title={ translate( 'MCP Setup' ) } />
				<NavigationHeader navigationItems={ [] } title={ translate( 'MCP Setup' ) } />
				<div className="mcp-setup__no-abilities">
					<p>{ translate( 'No MCP abilities are currently enabled for your account.' ) }</p>
					<p>
						{ translate(
							'MCP abilities define what actions and data your MCP client can access on your account. You need to enable at least one ability in the main MCP settings before configuring your client.'
						) }
					</p>
					<Button variant="primary" href="/me/mcp">
						{ translate( 'Go to MCP Settings' ) }
					</Button>
				</div>
			</Main>
		);
	}

	return (
		<Main wideLayout className="mcp-setup">
			<PageViewTracker path={ path } title="MCP Setup" />
			<DocumentHead title={ translate( 'MCP Setup' ) } />
			<NavigationHeader navigationItems={ [] } title={ translate( 'MCP Setup' ) } />

			<HeaderCake backText={ translate( 'Back' ) } backHref="/me/mcp">
				{ translate( 'MCP Setup' ) }
			</HeaderCake>

			<div className="mcp-setup">
				<div className="mcp-setup__intro">
					<p>
						{ translate(
							'WordPress.com provides MCP (Model Context Protocol) support, which allows AI assistants to interact directly with your WordPress.com account.'
						) }
					</p>
					<p>
						{ translate(
							'The JSON configuration below sets up a secure connection between your AI assistant and your WordPress.com account. It works by:'
						) }
					</p>
					<ul>
						<li>
							{ translate(
								'Running a bridge server using the WordPress.com-specific MCP package'
							) }
						</li>
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
				</div>

				<div className="mcp-setup__client-selection">
					<SelectControl
						label={ translate( 'MCP Client' ) }
						value={ selectedMcpClient }
						options={ mcpClientOptions }
						onChange={ setSelectedMcpClient }
						help={ translate( 'Choose your MCP client to get the correct configuration format.' ) }
					/>
				</div>

				<div className="mcp-setup__config-section">
					<h3 className="mcp-setup__config-title">{ translate( 'MCP Server Configuration' ) }</h3>

					<div className="mcp-setup__config-textarea-wrapper">
						<div className="mcp-setup__config-header">
							<Button
								icon={ copyStatus === 'success' ? check : copy }
								variant="tertiary"
								size="small"
								onClick={ copyToClipboard }
								className="mcp-setup__copy-button"
								aria-label={ translate( 'Copy configuration to clipboard' ) }
							/>
						</div>
						<TextareaControl
							value={ JSON.stringify( generateMcpConfig( selectedMcpClient ), null, 2 ) }
							onChange={ () => {} } // Required prop for read-only textarea
							readOnly
							className="mcp-setup__config-textarea"
							help={ translate(
								"Copy this configuration and paste it into your MCP client's settings."
							) }
						/>

						{ clientDocumentation[ selectedMcpClient ] && (
							<div className="mcp-setup__documentation-link">
								<ExternalLink
									href={ clientDocumentation[ selectedMcpClient ] }
									className="mcp-setup__docs-link"
								>
									{ translate( 'View setup instructions for' ) }{ ' ' }
									{ mcpClientOptions.find( ( opt ) => opt.value === selectedMcpClient )?.label }
								</ExternalLink>
							</div>
						) }
					</div>
				</div>

				<div className="mcp-setup__config-explanation">
					<ul>
						<li>
							{ createInterpolateElement(
								translate(
									'Server name: A unique identifier <code>%s</code> for this WordPress.com account connection'
								).replace( '%s', serverName ),
								{
									code: <code key="server-name">{ serverName }</code>,
								}
							) }
						</li>
						<li>
							{ createInterpolateElement(
								translate(
									'Package: <code>%s</code> is the official WordPress.com MCP server'
								).replace( '%s', '@automattic/mcp-wpcom-remote' ),
								{
									code: <code key="package-name">@automattic/mcp-wpcom-remote</code>,
								}
							) }
						</li>
						<li>
							{ createInterpolateElement(
								translate(
									'Environment variable: <code>%s</code> automatically points to your account-specific API endpoint'
								).replace( '%s', 'WP_API_URL' ),
								{
									code: <code key="env-var">WP_API_URL</code>,
								}
							) }
						</li>
					</ul>
				</div>
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
