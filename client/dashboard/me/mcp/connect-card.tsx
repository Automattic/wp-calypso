import { __experimentalVStack as VStack, Button, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { arrowUpRight, copy } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import { useMcpTracksAudienceProps } from '../../../me/mcp/tracks';
import { useAnalytics } from '../../app/analytics';
import { Card, CardBody, CardFooter } from '../../components/card';
import { Notice } from '../../components/notice';
import { SectionHeader } from '../../components/section-header';
import { getConnectAgents, HELPER_PROMPT } from './connect-agents';
import type { ConnectAgent } from './connect-agents';

const COPIED_DURATION_MS = 1600;

function AgentLogo( { agent }: { agent: ConnectAgent } ) {
	const [ isBroken, setIsBroken ] = useState( false );

	return (
		<span className="mcp-connect__logo" aria-hidden="true">
			{ isBroken ? (
				agent.name[ 0 ]
			) : (
				<img src={ agent.logo } alt="" onError={ () => setIsBroken( true ) } />
			) }
		</span>
	);
}

export default function McpConnectCard( {
	mcpEnabled,
	onTurnOn,
	isTurningOn,
}: {
	mcpEnabled: boolean;
	onTurnOn: () => void;
	isTurningOn: boolean;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const tracksAudienceProps = useMcpTracksAudienceProps();
	const [ copiedKey, setCopiedKey ] = useState< string | null >( null );
	const copiedTimeout = useRef< ReturnType< typeof setTimeout > >( undefined );

	useEffect( () => () => clearTimeout( copiedTimeout.current ), [] );

	const copyText = async ( key: string, text: string ) => {
		try {
			await navigator.clipboard.writeText( text );
		} catch {
			// Clipboard access may be blocked; there is nothing useful to show.
			return;
		}
		setCopiedKey( key );
		clearTimeout( copiedTimeout.current );
		copiedTimeout.current = setTimeout( () => setCopiedKey( null ), COPIED_DURATION_MS );
	};

	const trackAgentClick = ( agent: ConnectAgent ) => {
		recordTracksEvent( 'calypso_dashboard_mcp_connect_click', {
			...tracksAudienceProps,
			agent: agent.key,
			action: agent.href ? 'open' : 'copy',
		} );
	};

	const renderTileContent = ( agent: ConnectAgent ) => (
		<>
			<AgentLogo agent={ agent } />
			<span className="mcp-connect__text">
				<span className="mcp-connect__name">{ agent.name }</span>
				<span className="mcp-connect__description">{ agent.description }</span>
			</span>
			<span className="mcp-connect__action">
				<span>{ copiedKey === agent.key ? __( 'Copied' ) : agent.actionLabel }</span>
				<Icon icon={ agent.href ? arrowUpRight : copy } size={ 12 } />
			</span>
		</>
	);

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						level={ 3 }
						title={ __( 'Connect an AI assistant' ) }
						description={ __(
							'Add WordPress.com to your assistant, then sign in to approve the connection.'
						) }
					/>
					{ ! mcpEnabled && (
						<Notice
							variant="warning"
							title={ __( 'MCP access is off' ) }
							actions={
								<Button
									variant="secondary"
									size="compact"
									onClick={ onTurnOn }
									isBusy={ isTurningOn }
									disabled={ isTurningOn }
								>
									{ __( 'Turn on MCP access' ) }
								</Button>
							}
						>
							{ __(
								'Assistants can still connect, but they can’t read or change anything until you turn it on.'
							) }
						</Notice>
					) }
					<ul className="mcp-connect__grid">
						{ getConnectAgents().map( ( agent ) => (
							<li key={ agent.key }>
								{ agent.href !== undefined ? (
									<a
										className="mcp-connect__tile"
										href={ agent.href }
										target="_blank"
										rel="noreferrer"
										onClick={ () => trackAgentClick( agent ) }
									>
										{ renderTileContent( agent ) }
									</a>
								) : (
									<button
										type="button"
										className="mcp-connect__tile"
										onClick={ () => {
											trackAgentClick( agent );
											copyText( agent.key, agent.code );
										} }
									>
										{ renderTileContent( agent ) }
									</button>
								) }
							</li>
						) ) }
					</ul>
				</VStack>
			</CardBody>
			<CardFooter className="mcp-connect__footer">
				<span>{ __( 'Not sure where to start? Have the agent connect itself.' ) }</span>
				<Button
					className="mcp-connect__helper-button"
					variant="tertiary"
					size="small"
					icon={ copy }
					iconSize={ 16 }
					onClick={ () => {
						recordTracksEvent( 'calypso_dashboard_mcp_connect_helper_copy', tracksAudienceProps );
						copyText( 'helper', HELPER_PROMPT );
					} }
				>
					{ copiedKey === 'helper' ? __( 'Copied' ) : __( 'Copy prompt' ) }
				</Button>
			</CardFooter>
		</Card>
	);
}
