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
import { AGENT_CONFIGS, DEFAULT_AGENT_ID } from './agent-configs';
import type { AgentConfig } from './agent-configs';
import type { RecordTracksEvent } from './types';

import './style.scss';

export default function McpConnectAgent( {
	recordTracksEvent = () => {},
}: {
	recordTracksEvent?: RecordTracksEvent;
} ) {
	const [ selectedAgentId, setSelectedAgentId ] = useState< string >( DEFAULT_AGENT_ID );
	const [ copied, setCopied ] = useState( false );

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

	const onCopy = useCallback( async () => {
		try {
			await navigator.clipboard.writeText( selectedAgent.manualSetupSnippet );
			recordTracksEvent( 'calypso_a4a_ai_mcp_manual_config_copied', {
				agent_id: selectedAgent.id,
			} );
			setCopied( true );
			setTimeout( () => setCopied( false ), 2000 );
		} catch {
			// If the clipboard write fails, stay silent — the user can select the
			// snippet manually from the text area.
		}
	}, [ recordTracksEvent, selectedAgent ] );

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

				{ selectedAgent.quickSetup && selectedAgent.quickSetup.length > 0 && (
					<Card>
						<CardBody>
							<VStack spacing={ 3 }>
								<Text weight={ 600 } size={ 15 }>
									{ __( 'Quick setup' ) }
								</Text>
								{ selectedAgent.quickSetupDescription && (
									<Text variant="muted">{ selectedAgent.quickSetupDescription }</Text>
								) }
								<ol>
									{ selectedAgent.quickSetup.map( ( step, index ) => (
										<li key={ index }>
											<Text>{ step }</Text>
										</li>
									) ) }
								</ol>
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

				<Card>
					<CardBody>
						<VStack spacing={ 3 }>
							<HStack alignment="center">
								<Text weight={ 600 } size={ 15 }>
									{ __( 'Manual setup' ) }
								</Text>
								<Spacer />
								<Button
									variant="tertiary"
									icon={ copied ? check : copy }
									label={ copied ? __( 'Copied' ) : __( 'Copy configuration' ) }
									showTooltip
									onClick={ onCopy }
								/>
							</HStack>
							<Text variant="muted">
								{ selectedAgent.manualSetupFile
									? sprintf(
											/* translators: %(file)s is the config file name */
											__( 'Copy this configuration into %(file)s.' ),
											{ file: selectedAgent.manualSetupFile }
									  )
									: __( 'Copy this configuration into your client’s MCP settings.' ) }
							</Text>
							<TextareaControl
								__nextHasNoMarginBottom
								className="mcp-config-textarea"
								value={ selectedAgent.manualSetupSnippet }
								onChange={ () => {} }
								readOnly
							/>
							<ExternalLink href={ selectedAgent.docsUrl } children={ selectedAgent.docsLabel } />
						</VStack>
					</CardBody>
				</Card>
			</VStack>
		</>
	);
}
