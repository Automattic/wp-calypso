import {
	Button,
	SelectControl,
	TextareaControl,
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { check, copy } from '@wordpress/icons';
import { useCallback, useMemo, useState } from 'react';
import { Card, CardBody } from '../../../components/card';
import { CollapsibleCard } from '../../../components/collapsible-card';
import { AGENT_CONFIGS, DEFAULT_AGENT_ID } from './agent-configs';
import type { AgentConfig } from './agent-configs';
import type { RecordTracksEvent } from './types';

import './style.scss';

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
				<Text variant="muted">
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

	return (
		<>
			<Spacer marginBottom={ 8 } style={ { maxWidth: '650px' } }>
				<Text size={ 15 }>
					{ __(
						'Get instructions for connecting your external AI assistant to your Automattic for Agencies account via MCP.'
					) }
				</Text>
			</Spacer>

			<VStack spacing={ 4 } className="mcp-connect-agent">
				<Card>
					<CardBody>
						<SelectControl
							__nextHasNoMarginBottom
							label={ __( 'Choose your AI assistant' ) }
							value={ selectedAgent.id }
							options={ AGENT_CONFIGS.map( ( agent ) => ( {
								label: agent.label,
								value: agent.id,
							} ) ) }
							onChange={ onAgentChange }
						/>
					</CardBody>
				</Card>

				{ hasQuickSetup && (
					<Card>
						<CardBody>
							<VStack spacing={ 3 }>
								<Text weight={ 600 } size={ 15 }>
									{ __( 'Quick setup' ) }
								</Text>
								{ selectedAgent.quickSetupDescription && (
									<Text variant="muted">{ selectedAgent.quickSetupDescription }</Text>
								) }
								{ hasSteps && (
									<ol>
										{ selectedAgent.quickSetup!.map( ( step, index ) => (
											<li key={ index }>
												<Text>{ step }</Text>
											</li>
										) ) }
									</ol>
								) }
								{ selectedAgent.installAction && (
									<>
										<Text>
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
							<VStack spacing={ 3 }>
								<Text weight={ 600 } size={ 15 }>
									{ __( 'Manual setup' ) }
								</Text>
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
							</VStack>
						</CardBody>
					</Card>
				) }

				{ selectedAgent.fallbackSetup && (
					<CollapsibleCard
						initialExpanded={ false }
						toggleLabel={ __( 'Toggle fallback setup' ) }
						header={
							<Text weight={ 600 } size={ 15 }>
								{ __( 'Older clients or troubleshooting' ) }
							</Text>
						}
					>
						<VStack spacing={ 3 }>
							<Text variant="muted">{ selectedAgent.fallbackSetup.description }</Text>
							{ selectedAgent.fallbackSetup.steps && (
								<ol>
									{ selectedAgent.fallbackSetup.steps.map( ( step, index ) => (
										<li key={ index }>
											<Text>{ step }</Text>
										</li>
									) ) }
								</ol>
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
						</VStack>
					</CollapsibleCard>
				) }

				<ExternalLink href={ selectedAgent.docsUrl } children={ selectedAgent.docsLabel } />
			</VStack>
		</>
	);
}
