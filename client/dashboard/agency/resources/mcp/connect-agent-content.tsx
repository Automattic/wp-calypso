import {
	Button,
	SelectControl,
	TextareaControl,
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { check, copy } from '@wordpress/icons';
import { useCallback, useMemo, useState } from 'react';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { AGENT_CONFIGS, DEFAULT_AGENT_ID } from './agent-configs';
import type { AgentConfig } from './agent-configs';
import type { RecordTracksEvent } from './types';
import type { ReactNode } from 'react';

import './style.scss';

function SetupSteps( { steps }: { steps: ReactNode[] } ) {
	return (
		<ol className="mcp-connect-agent__steps">
			{ steps.map( ( step, index ) => (
				<li key={ index }>
					<Text as="p" variant="muted">
						{ step }
					</Text>
				</li>
			) ) }
		</ol>
	);
}

function ConfigSnippet( {
	snippet,
	file,
	copied,
	onCopy,
}: {
	snippet: string;
	file?: string;
	copied: boolean;
	onCopy: () => void;
} ) {
	return (
		<>
			<HStack alignment="center" justify="space-between" spacing={ 2 }>
				<Text as="p" variant="muted">
					{ file
						? sprintf(
								/* translators: %(file)s is the config file name */
								__( 'Copy this configuration into %(file)s.' ),
								{ file }
						  )
						: __( 'Copy this configuration into your client’s MCP settings.' ) }
				</Text>
				<Button
					style={ { flexShrink: 0 } }
					variant="tertiary"
					icon={ copied ? check : copy }
					iconSize={ 20 }
					label={ copied ? __( 'Copied' ) : __( 'Copy configuration' ) }
					showTooltip
					onClick={ onCopy }
				/>
			</HStack>
			<TextareaControl
				__nextHasNoMarginBottom
				className="mcp-config-textarea"
				value={ snippet }
				onChange={ () => {} }
				readOnly
			/>
		</>
	);
}

export default function McpConnectAgent( {
	recordTracksEvent = () => {},
}: {
	recordTracksEvent?: RecordTracksEvent;
} ) {
	const [ selectedAgentId, setSelectedAgentId ] = useState< string >( DEFAULT_AGENT_ID );
	const [ copied, setCopied ] = useState( false );
	const [ fallbackCopied, setFallbackCopied ] = useState( false );

	const selectedAgent: AgentConfig = useMemo( () => {
		return (
			AGENT_CONFIGS.find( ( agent ) => agent.id === selectedAgentId ) ??
			( AGENT_CONFIGS[ 0 ] as AgentConfig )
		);
	}, [ selectedAgentId ] );

	const onAgentChange = useCallback(
		( next: string ) => {
			recordTracksEvent( 'calypso_a4a_ai_mcp_connect_agent_selected', { agent_id: next } );
			setSelectedAgentId( next );
		},
		[ recordTracksEvent ]
	);

	const onInstallActionClick = useCallback( () => {
		recordTracksEvent( 'calypso_a4a_ai_mcp_install_action_clicked', {
			agent_id: selectedAgent.id,
		} );
	}, [ recordTracksEvent, selectedAgent ] );

	const copySnippet = useCallback(
		async ( snippet: string, eventName: string, setState: ( value: boolean ) => void ) => {
			try {
				await navigator.clipboard.writeText( snippet );
				recordTracksEvent( eventName, { agent_id: selectedAgent.id } );
				setState( true );
				setTimeout( () => setState( false ), 2000 );
			} catch {
				// If the clipboard write fails, stay silent — the user can select the
				// snippet manually from the text area.
			}
		},
		[ recordTracksEvent, selectedAgent ]
	);

	const hasSteps = !! selectedAgent.quickSetup && selectedAgent.quickSetup.length > 0;
	const hasQuickSetup = hasSteps || !! selectedAgent.installAction;

	// The documentation link belongs at the end of the last configuration card, so
	// it stays reachable whichever setup paths this agent offers.
	const docsLink = (
		<ExternalLink href={ selectedAgent.docsUrl }>{ selectedAgent.docsLabel }</ExternalLink>
	);

	return (
		<VStack spacing={ 4 } className="mcp-connect-agent">
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader level={ 3 } title={ __( 'Choose your AI assistant' ) } />
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'AI assistant' ) }
							help={ __( 'Pick your assistant to get the matching setup instructions.' ) }
							value={ selectedAgent.id }
							options={ AGENT_CONFIGS.map( ( agent ) => ( {
								label: agent.label,
								value: agent.id,
							} ) ) }
							onChange={ onAgentChange }
						/>
					</VStack>
				</CardBody>
			</Card>

			{ hasQuickSetup && (
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader level={ 3 } title={ __( 'Quick setup' ) } />
							{ selectedAgent.quickSetupDescription && (
								<Text as="p" variant="muted">
									{ selectedAgent.quickSetupDescription }
								</Text>
							) }
							{ hasSteps && <SetupSteps steps={ selectedAgent.quickSetup as ReactNode[] } /> }
							{ selectedAgent.installAction && (
								<>
									<Text as="p" variant="muted">
										{ __(
											'Or use the one-click install to add the Automattic for Agencies MCP app.'
										) }
									</Text>
									<Button
										style={ { width: 'fit-content' } }
										variant="primary"
										href={ selectedAgent.installAction.deepLink }
										onClick={ onInstallActionClick }
									>
										{ selectedAgent.installAction.label }
									</Button>
								</>
							) }
						</VStack>
					</CardBody>
				</Card>
			) }

			{ selectedAgent.manualSetupSnippet && (
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader level={ 3 } title={ __( 'Manual setup' ) } />
							<ConfigSnippet
								snippet={ selectedAgent.manualSetupSnippet }
								file={ selectedAgent.manualSetupFile }
								copied={ copied }
								onCopy={ () =>
									copySnippet(
										selectedAgent.manualSetupSnippet as string,
										'calypso_a4a_ai_mcp_manual_config_copied',
										setCopied
									)
								}
							/>
							{ ! selectedAgent.fallbackSetup && docsLink }
						</VStack>
					</CardBody>
				</Card>
			) }

			{ selectedAgent.fallbackSetup && (
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader level={ 3 } title={ __( 'Older clients or troubleshooting' ) } />
							<Text as="p" variant="muted">
								{ selectedAgent.fallbackSetup.description }
							</Text>
							{ selectedAgent.fallbackSetup.steps && (
								<SetupSteps steps={ selectedAgent.fallbackSetup.steps } />
							) }
							<ConfigSnippet
								snippet={ selectedAgent.fallbackSetup.snippet }
								file={ selectedAgent.fallbackSetup.file }
								copied={ fallbackCopied }
								onCopy={ () =>
									copySnippet(
										selectedAgent.fallbackSetup!.snippet,
										'calypso_a4a_ai_mcp_fallback_config_copied',
										setFallbackCopied
									)
								}
							/>
							{ docsLink }
						</VStack>
					</CardBody>
				</Card>
			) }

			{ ! selectedAgent.manualSetupSnippet && ! selectedAgent.fallbackSetup && docsLink }
		</VStack>
	);
}
