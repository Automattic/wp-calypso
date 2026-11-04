import { __experimentalVStack as VStack, Button, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { arrowUpRight, copy } from '@wordpress/icons';
import { useEffect, useId, useRef, useState } from 'react';
import { useMcpTracksAudienceProps } from '../../../me/mcp/tracks';
import { useAnalytics } from '../../app/analytics';
import { Card, CardBody, CardFooter } from '../../components/card';
import { Notice } from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';
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

// The agent name names the tile; the description and the action describe it.
function getTileAriaProps( id: string ) {
	return {
		'aria-labelledby': `${ id }-name`,
		'aria-describedby': `${ id }-description ${ id }-action`,
	};
}

function TileContent( {
	id,
	agent,
	isCopied,
}: {
	id: string;
	agent: ConnectAgent;
	isCopied: boolean;
} ) {
	return (
		<CardBody className="mcp-connect__tile-body">
			<AgentLogo agent={ agent } />
			<span className="mcp-connect__text">
				<span id={ `${ id }-name` } className="mcp-connect__name">
					{ agent.name }
				</span>
				<span id={ `${ id }-description` } className="mcp-connect__description">
					{ agent.description }
				</span>
			</span>
			<span id={ `${ id }-action` } className="mcp-connect__action">
				<span>{ isCopied ? __( 'Copied' ) : agent.actionLabel }</span>
				<Icon icon={ agent.href ? arrowUpRight : copy } size={ 12 } />
			</span>
		</CardBody>
	);
}

function AgentTile( {
	agent,
	isCopied,
	onOpen,
	onCopy,
}: {
	agent: ConnectAgent;
	isCopied: boolean;
	onOpen: () => void;
	onCopy: () => void;
} ) {
	const id = useId();
	// The link or button carries the semantics; the dashboard Card carries the look.
	const content = (
		<Card size="small" className="mcp-connect__tile">
			<TileContent id={ id } agent={ agent } isCopied={ isCopied } />
		</Card>
	);

	if ( agent.href !== undefined ) {
		return (
			<a
				className="mcp-connect__tile-target"
				href={ agent.href }
				target="_blank"
				rel="noreferrer"
				onClick={ onOpen }
				{ ...getTileAriaProps( id ) }
			>
				{ content }
			</a>
		);
	}

	return (
		<button
			type="button"
			className="mcp-connect__tile-target"
			onClick={ onCopy }
			{ ...getTileAriaProps( id ) }
		>
			{ content }
		</button>
	);
}

// A warning while MCP access is off, and a success message in the same place once it
// turns on, so the tiles and the toggle below don't move.
function AccessNotice( {
	mcpEnabled,
	onTurnOn,
	isTurningOn,
	onDismiss,
}: {
	mcpEnabled: boolean;
	onTurnOn: () => void;
	isTurningOn: boolean;
	onDismiss: () => void;
} ) {
	const [ wasEnabled, setWasEnabled ] = useState( mcpEnabled );
	const [ showTurnedOn, setShowTurnedOn ] = useState( false );

	// Set during render, not in an effect, so no frame paints without a notice.
	if ( mcpEnabled !== wasEnabled ) {
		setWasEnabled( mcpEnabled );
		setShowTurnedOn( mcpEnabled );
	}

	if ( ! mcpEnabled ) {
		return (
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
					'Agents can still connect, but they can’t read or change anything until you turn it on.'
				) }
			</Notice>
		);
	}

	if ( ! showTurnedOn ) {
		return null;
	}

	return (
		<Notice
			variant="success"
			title={ __( 'MCP access is on' ) }
			actions={
				<Button
					variant="secondary"
					size="compact"
					onClick={ () => {
						setShowTurnedOn( false );
						onDismiss();
					} }
				>
					{ __( 'Dismiss' ) }
				</Button>
			}
		>
			{ __( 'Connected agents can now use the tools you allow below.' ) }
		</Notice>
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
	const gridRef = useRef< HTMLUListElement >( null );

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

	// The notice closes with focus inside it, so move focus to the first tile.
	const focusFirstTile = () =>
		gridRef.current?.querySelector< HTMLElement >( '.mcp-connect__tile-target' )?.focus();

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						level={ 3 }
						title={ __( 'Connect an external AI agent' ) }
						description={ __(
							'Add WordPress.com to your agent, then sign in to approve the connection.'
						) }
					/>
					<AccessNotice
						mcpEnabled={ mcpEnabled }
						onTurnOn={ onTurnOn }
						isTurningOn={ isTurningOn }
						onDismiss={ focusFirstTile }
					/>
					<ul ref={ gridRef } className="mcp-connect__grid">
						{ getConnectAgents().map( ( agent ) => (
							<li key={ agent.key }>
								<AgentTile
									agent={ agent }
									isCopied={ copiedKey === agent.key }
									onOpen={ () => trackAgentClick( agent ) }
									onCopy={ () => {
										trackAgentClick( agent );
										if ( agent.code !== undefined ) {
											copyText( agent.key, agent.code );
										}
									} }
								/>
							</li>
						) ) }
					</ul>
				</VStack>
			</CardBody>
			<CardFooter className="mcp-connect__footer">
				<span>{ __( 'Not sure where to start? Have the agent connect itself.' ) }</span>
				<div className="mcp-connect__footer-actions">
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
					<RouterLinkButton
						className="mcp-connect__helper-button"
						variant="tertiary"
						size="small"
						to="/me/preferences/mcp/setup"
					>
						{ __( 'Manual setup' ) }
					</RouterLinkButton>
				</div>
			</CardFooter>
		</Card>
	);
}
