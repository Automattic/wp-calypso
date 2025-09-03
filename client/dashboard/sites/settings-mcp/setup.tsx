import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button, ExternalLink, TextareaControl, SelectControl } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { copy, check } from '@wordpress/icons';
import { useState } from 'react';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import '../settings-mcp/style.scss';

export default function McpSetup( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: siteSettings } = useSuspenseQuery( siteSettingsQuery( site.ID ) );
	// MCP client selection for configuration format
	const [ selectedMcpClient, setSelectedMcpClient ] = useState< string >( 'claude' );

	// Copy button state
	const [ copyStatus, setCopyStatus ] = useState< 'idle' | 'success' | 'error' >( 'idle' );

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
	const serverName = `${ site.slug }-mcp`;

	// Generate MCP configuration based on selected client
	const generateMcpConfig = ( client: string ) => {
		const baseConfig = {
			command: 'npx',
			args: [ '-y', '@automattic/mcp-wpcom-remote@latest' ],
			env: {
				WP_API_URL: `https://public-api.wordpress.com/wp/v2/sites/${ site.ID }/mcp/v1`,
			},
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
		siteSettings?.mcp_abilities &&
		Object.values( siteSettings.mcp_abilities ).some( ( ability ) => ability.enabled );

	if ( ! hasEnabledAbilities ) {
		return (
			<PageLayout
				size="small"
				header={
					<SettingsPageHeader
						title={ __( 'MCP Setup' ) }
						description={ __( 'Configure your MCP client to connect to this site.' ) }
					/>
				}
			>
				<div className="mcp-setup__no-abilities">
					<p>{ __( 'No MCP abilities are currently enabled for this site.' ) }</p>
					<p>
						{ __(
							'MCP abilities define what actions and data your MCP client can access on this site. You need to enable at least one ability in the main MCP settings before configuring your client.'
						) }
					</p>
					<Button variant="primary" href={ `/sites/${ siteSlug }/settings/mcp` }>
						{ __( 'Go to MCP Settings' ) }
					</Button>
				</div>
			</PageLayout>
		);
	}

	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'MCP Setup' ) }
					description={ __( 'Configure your MCP client to connect to this site.' ) }
					backPath={ `/sites/${ siteSlug }/settings/mcp` }
					backLabel={ __( 'MCP Settings' ) }
				/>
			}
		>
			<div className="mcp-setup">
				<div className="mcp-setup__intro">
					<p>
						{ __(
							'WordPress.com provides MCP (Model Context Protocol) support, which allows AI assistants to interact directly with your WordPress.com site.'
						) }
					</p>
					<p>
						{ __(
							'The JSON configuration below sets up a secure connection between your AI assistant and your WordPress.com site. It works by:'
						) }
					</p>
					<ul>
						<li>
							{ __( 'Running a bridge server using the WordPress.com-specific MCP package' ) }
						</li>
						<li>
							{ __(
								'Handling OAuth 2.1 authentication to securely connect to your WordPress.com site'
							) }
						</li>
						<li>
							{ __( "Providing real-time access to your site's content and management features" ) }
						</li>
					</ul>
				</div>

				<div className="mcp-setup__client-selection">
					<SelectControl
						label={ __( 'MCP Client' ) }
						value={ selectedMcpClient }
						options={ mcpClientOptions }
						onChange={ setSelectedMcpClient }
						help={ __( 'Choose your MCP client to get the correct configuration format.' ) }
					/>
				</div>

				<div className="mcp-setup__config-section">
					<h3 className="mcp-setup__config-title">{ __( 'MCP Server Configuration' ) }</h3>

					<div className="mcp-setup__config-textarea-wrapper">
						<div className="mcp-setup__config-header">
							<Button
								icon={ copyStatus === 'success' ? check : copy }
								variant="tertiary"
								size="small"
								onClick={ copyToClipboard }
								className="mcp-setup__copy-button"
								aria-label={ __( 'Copy configuration to clipboard' ) }
							/>
						</div>
						<TextareaControl
							value={ JSON.stringify( generateMcpConfig( selectedMcpClient ), null, 2 ) }
							onChange={ () => {} } // Required prop for read-only textarea
							readOnly
							className="mcp-setup__config-textarea"
							help={ __( "Copy this configuration and paste it into your MCP client's settings." ) }
						/>

						{ clientDocumentation[ selectedMcpClient as keyof typeof clientDocumentation ] && (
							<div className="mcp-setup__documentation-link">
								<ExternalLink
									href={
										clientDocumentation[ selectedMcpClient as keyof typeof clientDocumentation ]
									}
									className="mcp-setup__docs-link"
								>
									{ __( 'View setup instructions for' ) }{ ' ' }
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
								sprintf(
									/* translators: %s is the unique server name for this WordPress.com site */
									__(
										'Server name: A unique identifier <code>%s</code> for this WordPress.com connection'
									),
									serverName
								),
								{
									code: <code key="server-name">{ serverName }</code>,
								}
							) }
						</li>
						<li>
							{ createInterpolateElement(
								sprintf(
									/* translators: @automattic/mcp-wpcom-remote is the package name and should not be translated */
									__( 'Package: <code>%s</code> is the official WordPress.com MCP server' ),
									'@automattic/mcp-wpcom-remote'
								),
								{
									code: <code key="package-name">@automattic/mcp-wpcom-remote</code>,
								}
							) }
						</li>
						<li>
							{ createInterpolateElement(
								sprintf(
									/* translators: WP_API_URL is the environment variable name and should not be translated */
									__(
										'Environment variable: <code>%s</code> automatically points to your site-specific API endpoint'
									),
									'WP_API_URL'
								),
								{
									code: <code key="env-var">WP_API_URL</code>,
								}
							) }
						</li>
					</ul>
				</div>
			</div>
		</PageLayout>
	);
}
