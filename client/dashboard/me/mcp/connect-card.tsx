import { formatNumber } from '@automattic/number-formatters';
import { speak } from '@wordpress/a11y';
import {
	__experimentalVStack as VStack,
	Button,
	Icon,
	TextareaControl,
	VisuallyHidden,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
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
	// The link or button holds only the name, so its markup stays valid, and the CSS
	// stretches it over the whole Card. The description and the action describe it.
	const targetProps = {
		className: 'mcp-connect__tile-target',
		'aria-describedby': `${ id }-description ${ id }-action`,
	};

	return (
		<Card size="small" className="mcp-connect__tile">
			<CardBody className="mcp-connect__tile-body">
				<AgentLogo agent={ agent } />
				<span className="mcp-connect__text">
					{ agent.href !== undefined ? (
						<a
							{ ...targetProps }
							href={ agent.href }
							target="_blank"
							rel="noreferrer"
							onClick={ onOpen }
						>
							{ agent.name }
						</a>
					) : (
						<button { ...targetProps } type="button" onClick={ onCopy }>
							{ agent.name }
						</button>
					) }
					<span id={ `${ id }-description` } className="mcp-connect__description">
						{ agent.description }
					</span>
				</span>
				<span id={ `${ id }-action` } className="mcp-connect__action">
					<span>{ isCopied ? __( 'Copied' ) : agent.actionLabel }</span>
					<Icon icon={ agent.href ? arrowUpRight : copy } size={ 12 } />
					{ agent.href && (
						<>
							{ ' ' }
							<VisuallyHidden as="span">
								{
									/* translators: accessibility text */
									__( '(opens in a new tab)' )
								}
							</VisuallyHidden>
						</>
					) }
				</span>
			</CardBody>
		</Card>
	);
}

function AccessOffNotice( {
	addedSiteCount,
	onTurnOn,
	isTurningOn,
}: {
	addedSiteCount: number;
	onTurnOn: () => void;
	isTurningOn: boolean;
} ) {
	if ( addedSiteCount > 0 ) {
		return (
			<Notice
				variant="info"
				title={ sprintf(
					/* translators: %s is the formatted number of sites added under "Add MCP to specific sites" */
					_n(
						'MCP access is read-only on %s site',
						'MCP access is read-only on %s sites',
						addedSiteCount
					),
					formatNumber( addedSiteCount )
				) }
			>
				{ __( 'Account access is off, so agents can only read the sites you added.' ) }
			</Notice>
		);
	}

	return (
		<Notice
			variant="warning"
			title={ __( 'MCP access is off' ) }
			actions={
				<Button
					__next40pxDefaultSize
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
			{ __( 'Turn it on so agents can read and change your sites.' ) }
		</Notice>
	);
}

function CopyFallback( { failure }: { failure: { text: string } } ) {
	const { text } = failure;
	const fieldRef = useRef< HTMLTextAreaElement >( null );

	// Select the text so people only need to press the copy shortcut.
	useEffect( () => {
		fieldRef.current?.focus();
		fieldRef.current?.select();
	}, [ failure ] );

	return (
		<Notice variant="warning" title={ __( 'Your browser blocked copying' ) }>
			<TextareaControl
				__nextHasNoMarginBottom
				ref={ fieldRef }
				className="mcp-connect__copy-fallback"
				label={ __( 'Your browser blocked copying' ) }
				hideLabelFromVision
				help={ __( 'Press Ctrl+C or ⌘C to copy this text.' ) }
				value={ text }
				onChange={ () => {} }
				readOnly
				rows={ text.length > 100 ? 3 : 2 }
			/>
		</Notice>
	);
}

export default function McpConnectCard( {
	mcpEnabled,
	addedSiteCount = 0,
	onTurnOn,
	isTurningOn,
}: {
	mcpEnabled: boolean;
	addedSiteCount?: number;
	onTurnOn: () => void;
	isTurningOn: boolean;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const tracksAudienceProps = useMcpTracksAudienceProps();
	const [ copiedKey, setCopiedKey ] = useState< string | null >( null );
	const [ failedCopy, setFailedCopy ] = useState< { text: string } | null >( null );
	const copiedTimeout = useRef< ReturnType< typeof setTimeout > >( undefined );
	const gridRef = useRef< HTMLUListElement >( null );
	const wasEnabled = useRef( mcpEnabled );
	const turnedOnFromNotice = useRef( false );

	useEffect( () => () => clearTimeout( copiedTimeout.current ), [] );

	const handleTurnOn = () => {
		turnedOnFromNotice.current = true;
		onTurnOn();
	};

	// Turning access on from the notice removes its button, so move focus to the first tile.
	// The toggle also disables while saving, so only do this after the notice button.
	useEffect( () => {
		if (
			! wasEnabled.current &&
			mcpEnabled &&
			turnedOnFromNotice.current &&
			document.activeElement === document.body
		) {
			gridRef.current?.querySelector< HTMLElement >( 'a, button' )?.focus();
		}
		wasEnabled.current = mcpEnabled;
		if ( mcpEnabled || ! isTurningOn ) {
			turnedOnFromNotice.current = false;
		}
	}, [ mcpEnabled, isTurningOn ] );

	const copyText = async ( key: string, text: string ) => {
		try {
			await navigator.clipboard.writeText( text );
		} catch {
			// A new object each time, so a repeat failure selects the text again.
			setFailedCopy( { text } );
			return false;
		}
		setFailedCopy( null );
		setCopiedKey( key );
		speak( __( 'Copied' ) );
		clearTimeout( copiedTimeout.current );
		copiedTimeout.current = setTimeout( () => setCopiedKey( null ), COPIED_DURATION_MS );
		return true;
	};

	const trackAgentClick = ( agent: ConnectAgent ) => {
		recordTracksEvent( 'calypso_dashboard_mcp_connect_click', {
			...tracksAudienceProps,
			agent: agent.key,
			action: agent.href ? 'open' : 'copy',
		} );
	};

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
					{ ! mcpEnabled && (
						<AccessOffNotice
							addedSiteCount={ addedSiteCount }
							onTurnOn={ handleTurnOn }
							isTurningOn={ isTurningOn }
						/>
					) }
					<ul ref={ gridRef } className="mcp-connect__grid">
						{ getConnectAgents().map( ( agent ) => (
							<li key={ agent.key }>
								<AgentTile
									agent={ agent }
									isCopied={ copiedKey === agent.key }
									onOpen={ () => trackAgentClick( agent ) }
									onCopy={ async () => {
										if ( agent.code !== undefined && ( await copyText( agent.key, agent.code ) ) ) {
											trackAgentClick( agent );
										}
									} }
								/>
							</li>
						) ) }
					</ul>
					{ failedCopy && <CopyFallback failure={ failedCopy } /> }
				</VStack>
			</CardBody>
			<CardFooter className="mcp-connect__footer">
				<span>{ __( 'Not sure where to start? Have the agent connect itself.' ) }</span>
				<div className="mcp-connect__footer-actions">
					<Button
						__next40pxDefaultSize
						className="mcp-connect__helper-button"
						variant="tertiary"
						size="small"
						icon={ copy }
						iconSize={ 16 }
						onClick={ async () => {
							if ( await copyText( 'helper', HELPER_PROMPT ) ) {
								recordTracksEvent(
									'calypso_dashboard_mcp_connect_helper_copy',
									tracksAudienceProps
								);
							}
						} }
					>
						{ copiedKey === 'helper' ? __( 'Copied' ) : __( 'Copy prompt' ) }
					</Button>
					{ /* The setup page needs MCP access, so offer it only while access is on. */ }
					{ mcpEnabled && (
						<RouterLinkButton
							__next40pxDefaultSize
							className="mcp-connect__helper-button"
							variant="tertiary"
							size="small"
							to="/me/preferences/mcp/setup"
						>
							{ __( 'Manual setup' ) }
						</RouterLinkButton>
					) }
				</div>
			</CardFooter>
		</Card>
	);
}
