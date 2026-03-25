import { userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	TextareaControl,
	SelectControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
} from '@wordpress/components';
import { copy, check, error } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
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
			<Card isRounded={ false }>
				<CardBody>
					<VStack spacing={ 4 }>
						<CardHeading tagName="h2" size={ 16 } isBold>
							{ translate( 'Setup Required' ) }
						</CardHeading>
						<VStack spacing={ 4 }>
							<p>{ translate( 'No MCP access is currently enabled for your account.' ) }</p>
							<Button variant="primary" href="/me/mcp" style={ { alignSelf: 'flex-start' } }>
								{ translate( 'Go to MCP Settings' ) }
							</Button>
						</VStack>
					</VStack>
				</CardBody>
			</Card>
		);
	}

	return renderLayout(
		<>
			<HeaderCake backText={ translate( 'Back' ) } backHref="/me/mcp">
				{ translate( 'Connect AI agent' ) }
			</HeaderCake>
			<VStack spacing={ 2 }>
				<Card isRounded={ false }>
					<CardBody style={ { padding: '16px' } }>
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ <strong>{ translate( 'Choose your AI agent' ) }</strong> }
							value={ selectedMcpClient }
							options={ mcpClientOptions }
							onChange={ setSelectedMcpClient }
						/>
					</CardBody>
				</Card>

				{ ( selectedMcpClient === 'claude' ||
					selectedMcpClient === 'claude-code' ||
					selectedMcpClient === 'cursor' ) && (
					<Card isRounded={ false }>
						<CardBody style={ { padding: '16px' } }>
							<VStack spacing={ 3 }>
								<CardHeading tagName="h2" size={ 16 } isBold>
									{ translate( 'Quick setup' ) }
								</CardHeading>

								{ selectedMcpClient === 'claude' && (
									<ol style={ { paddingInlineStart: '20px', margin: '0' } }>
										<li>
											<ExternalLink href="https://claude.ai/settings/connectors">
												{ translate( 'Open Claude settings' ) }
											</ExternalLink>
										</li>
										<li>
											{ translate( 'Click "Browse connectors" and search for WordPress.com' ) }
										</li>
										<li>{ translate( 'Select WordPress.com and follow the prompts' ) }</li>
									</ol>
								) }

								{ selectedMcpClient === 'claude-code' && (
									<ol style={ { paddingInlineStart: '20px', margin: '0' } }>
										<li>
											{ translate( 'Run in your terminal:' ) }{ ' ' }
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
										<li>{ translate( 'Run /mcp in Claude Code to authenticate' ) }</li>
									</ol>
								) }

								{ selectedMcpClient === 'cursor' && (
									<>
										<p style={ { margin: 0 } }>
											{ translate(
												'Use the one-click install to add the WordPress.com MCP server to Cursor.'
											) }
										</p>
										<Button
											variant="primary"
											href="cursor://anysphere.cursor-deeplink/mcp/install?name=WordPress.com&config=eyJjb21tYW5kIjoibnB4IC15IG1jcC1yZW1vdGUgaHR0cHM6Ly9wdWJsaWMtYXBpLndvcmRwcmVzcy5jb20vd3Bjb20vdjIvbWNwL3YxIn0%3D"
											target="_blank"
											style={ { alignSelf: 'flex-start' } }
										>
											{ translate( 'Install in Cursor' ) }
										</Button>
									</>
								) }
							</VStack>
						</CardBody>
					</Card>
				) }

				<Card isRounded={ false }>
					<CardBody style={ { padding: '16px' } }>
						<VStack spacing={ 2 }>
							<VStack spacing={ 2 }>
								<CardHeading tagName="h2" size={ 16 } isBold>
									{ translate( 'Manual setup' ) }
								</CardHeading>
								<HStack justify="space-between" alignment="center">
									<p style={ { margin: 0, fontSize: '13px', color: '#757575' } }>
										{ translate( "Copy this configuration into your client's MCP settings." ) }
									</p>
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
		</>
	);
}

export default McpSetupComponent;
