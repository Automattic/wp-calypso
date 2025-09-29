import { siteBySlugQuery, userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery, useQuery } from '@tanstack/react-query';
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
import { __, sprintf } from '@wordpress/i18n';
import { copy, check, error } from '@wordpress/icons';
import { useState, useMemo } from 'react';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import { getSiteMcpAbilities } from './utils';

function McpSetupComponent( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: userSettings } = useQuery( userSettingsQuery() );
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
	];

	// Documentation links for each client
	const clientDocumentation = {
		claude: 'https://docs.claude.com/en/docs/mcp',
		vscode: 'https://code.visualstudio.com/docs/copilot/customization/mcp-servers',
		cursor: 'https://docs.cursor.com/en/context/mcp',
		continue: 'https://docs.continue.dev/customize/deep-dives/mcp',
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

	// Check if any tools are enabled using the new userSettings structure
	const hasEnabledTools = useMemo( () => {
		const abilities = getSiteMcpAbilities( userSettings, site.ID );
		return Object.values( abilities ).some( ( tool ) => tool.enabled );
	}, [ userSettings, site.ID ] );

	if ( ! hasEnabledTools ) {
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
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<Text as="p" variant="muted">
								{ __( 'No MCP tools are currently enabled for this site.' ) }
							</Text>
							<Text as="p" variant="muted">
								{ __(
									'MCP tools define what actions and data your MCP client can access on this site. You need to enable at least one tool in the main MCP settings before configuring your client.'
								) }
							</Text>
							<Button variant="primary" href={ `/sites/${ siteSlug }/settings/mcp` }>
								{ __( 'Go to MCP Settings' ) }
							</Button>
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
				<SettingsPageHeader
					title={ __( 'MCP Setup' ) }
					description={ __( 'Configure your MCP client to connect to this site.' ) }
					backPath={ `/sites/${ siteSlug }/settings/mcp` }
					backLabel={ __( 'MCP Settings' ) }
				/>
			}
		>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<Text as="p">
							{ __(
								'WordPress.com provides MCP (Model Context Protocol) support, which allows AI assistants to interact directly with your WordPress.com site.'
							) }
						</Text>
						<Text as="p">
							{ __(
								'The JSON configuration below sets up a secure connection between your AI assistant and your WordPress.com site. It works by:'
							) }
						</Text>
						<VStack spacing={ 2 }>
							<Text as="li" style={ { listStyle: 'none' } }>
								{ __( 'Running a bridge server using the WordPress.com-specific MCP package' ) }
							</Text>
							<Text as="li" style={ { listStyle: 'none' } }>
								{ __(
									'Handling OAuth 2.1 authentication to securely connect to your WordPress.com site'
								) }
							</Text>
							<Text as="li" style={ { listStyle: 'none' } }>
								{ __(
									"Providing real-time access to your site's content and management features"
								) }
							</Text>
						</VStack>
					</VStack>
				</CardBody>
			</Card>

			<div style={ { marginTop: '24px' } }>
				<Card>
					<CardBody>
						<VStack spacing={ 6 }>
							<SelectControl
								label={ __( 'MCP Client' ) }
								value={ selectedMcpClient }
								options={ mcpClientOptions }
								onChange={ setSelectedMcpClient }
								help={ __( 'Choose your MCP client to get the correct configuration format.' ) }
							/>

							<VStack spacing={ 4 }>
								<Text as="h3">{ __( 'MCP Server Configuration' ) }</Text>

								<VStack spacing={ 3 }>
									<div
										style={ {
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
										} }
									>
										{ clientDocumentation[
											selectedMcpClient as keyof typeof clientDocumentation
										] && (
											<ExternalLink
												href={
													clientDocumentation[
														selectedMcpClient as keyof typeof clientDocumentation
													]
												}
											>
												{ __( 'View setup instructions for' ) }{ ' ' }
												{
													mcpClientOptions.find( ( opt ) => opt.value === selectedMcpClient )?.label
												}
											</ExternalLink>
										) }
										<Button
											icon={ getCopyIcon() }
											variant="tertiary"
											size="small"
											style={ {
												cursor: 'pointer',
												color: copyStatus === 'error' ? 'var(--color-error)' : undefined,
											} }
											onClick={ copyToClipboard }
											aria-label={ __( 'Copy configuration to clipboard' ) }
										/>
									</div>
									<TextareaControl
										value={ JSON.stringify( generateMcpConfig( selectedMcpClient ), null, 2 ) }
										onChange={ () => {} } // Required prop for read-only textarea
										readOnly
										help={ __(
											"Copy this configuration and paste it into your MCP client's settings."
										) }
										style={ { minHeight: '240px' } }
									/>
								</VStack>
							</VStack>
						</VStack>
						<VStack spacing={ 3 }>
							<Text as="li" style={ { listStyle: 'none' } }>
								{ createInterpolateElement(
									sprintf(
										/* translators: %s is the unique server name for this WordPress.com site */
										__(
											'<code>%s</code> is a unique identifier for this WordPress.com connection'
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
							<Text as="li" style={ { listStyle: 'none' } }>
								{ createInterpolateElement(
									sprintf(
										/* translators: @automattic/mcp-wpcom-remote is the package name and should not be translated */
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
							<Text as="li" style={ { listStyle: 'none' } }>
								{ createInterpolateElement(
									sprintf(
										/* translators: @automattic/mcp-wpcom-remote is the package name and should not be translated */
										__( '<code>%s</code> is the site-specific API endpoint' ),
										'WP_API_URL'
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
												WP_API_URL
											</code>
										),
									}
								) }
							</Text>
						</VStack>
					</CardBody>
				</Card>
			</div>
		</PageLayout>
	);
}

export default McpSetupComponent;
