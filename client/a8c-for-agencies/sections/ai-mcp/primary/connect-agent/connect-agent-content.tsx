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
import { Card, CardBody } from 'calypso/dashboard/components/card';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { AGENT_CONFIGS, DEFAULT_AGENT_ID } from './agent-configs';
import type { AgentConfig } from './agent-configs';

import '../style.scss';

export default function AiMcpConnectAgentContent() {
	const dispatch = useDispatch();

	const [ selectedAgentId, setSelectedAgentId ] = useState< string >( DEFAULT_AGENT_ID );
	const [ copied, setCopied ] = useState( false );

	const selectedAgent: AgentConfig = useMemo( () => {
		return (
			AGENT_CONFIGS.find( ( a ) => a.id === selectedAgentId ) ??
			( AGENT_CONFIGS[ 0 ] as AgentConfig )
		);
	}, [ selectedAgentId ] );

	const onAgentChange = useCallback(
		( next: string ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_ai_mcp_connect_agent_selected', {
					agent_id: next,
				} )
			);
			setSelectedAgentId( next );
		},
		[ dispatch ]
	);

	const onInstallActionClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_ai_mcp_install_action_clicked', {
				agent_id: selectedAgent.id,
			} )
		);
	}, [ dispatch, selectedAgent ] );

	const onCopy = useCallback( async () => {
		try {
			await navigator.clipboard.writeText( selectedAgent.manualSetupSnippet );
			dispatch(
				recordTracksEvent( 'calypso_a4a_ai_mcp_manual_config_copied', {
					agent_id: selectedAgent.id,
				} )
			);
			setCopied( true );
			setTimeout( () => setCopied( false ), 2000 );
		} catch {
			// If the clipboard write fails, stay silent — the user can select the
			// snippet manually from the pre block.
		}
	}, [ dispatch, selectedAgent ] );

	return (
		<>
			<Spacer className="a4a-ai-mcp-overview__intro" marginBottom={ 12 }>
				<Text size={ 15 }>
					{ preventWidows(
						__(
							'Get instructions for connecting your external AI assistant to your Automattic for Agencies account via MCP.'
						)
					) }
				</Text>
			</Spacer>

			<VStack spacing={ 4 } className="a4a-ai-mcp-connect-agent">
				<Card>
					<CardBody>
						<SelectControl
							label={ __( 'Choose your AI assistant' ) }
							value={ selectedAgent.id }
							options={ AGENT_CONFIGS.map( ( a ) => ( {
								label: a.label,
								value: a.id,
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
									{ selectedAgent.quickSetup.map( ( step, idx ) => (
										<li key={ idx }>
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
											{
												file: selectedAgent.manualSetupFile,
											}
									  )
									: __( 'Copy this configuration into your client’s MCP settings.' ) }
							</Text>
							<TextareaControl
								className="a4a-ai-mcp-code-block"
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
