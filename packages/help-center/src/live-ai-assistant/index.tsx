import { useLocale } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close, Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRealtimeSession } from './use-realtime-session';
import './style.scss';

const PhoneIcon = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path
			d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const PhoneHangupIcon = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path
			d="M2 12c5-5 15-5 20 0l-2.5 2.5a1.5 1.5 0 0 1-2 .12l-1.9-1.51a2 2 0 0 0-1.25-.43h-4.7a2 2 0 0 0-1.25.43l-1.9 1.5a1.5 1.5 0 0 1-2-.11L2 12z"
			fill="currentColor"
		/>
	</svg>
);

const MicIcon = ( { muted }: { muted: boolean } ) => (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path
			d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		{ muted && <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> }
	</svg>
);

interface LiveAIAssistantProps {
	contextualInstructions?: string;
}

const PAGE_EVENT_DEBOUNCE_MS = 100;
const PUBLIC_API_WPCOM_ORIGIN = 'https://public-api.wordpress.com';

function buildInstructions(
	flowName: string,
	stepName: string,
	locale: string,
	extra?: string
): string {
	const base = [
		'You are the WordPress.com sign-up assistant.',
		'Your job is to help the user complete the sign-up and onboarding flow they are currently in.',
		'Be as concise as humanly possible.',
		'Do not speak unless the user directly asks a question, asks for help, or asks you to do something.',
		'Never greet proactively, narrate what you are doing, or volunteer extra details.',
		'When you do answer, prefer the shortest possible response, ideally a few words or one short sentence.',
		`The current UI locale is "${ locale }", but you must always speak and write in English unless the user explicitly asks you to switch languages.`,
		'If the user seems stuck, offer to walk through the current step. If they ask questions about plans, domains, or features, answer clearly and honestly.',
		'Never ask for or repeat passwords, credit card numbers, or two-factor codes out loud.',
		'If you do not know something specific, say so and suggest checking the on-screen options.',
		'Use page_summary_tool whenever you need page context, and use it before highlight_tool.',
		'Use pointed_element_tool when the user refers to something they are pointing at, such as “this” or “that”.',
		'When referring to anything on the page, prefer using highlight_tool instead of verbally describing where it is.',
		'If the user asks where something is, highlight it rather than explaining its location in words.',
		`Current flow: "${ flowName || 'unknown' }". Current step: "${ stepName || 'unknown' }".`,
	];
	if ( extra ) {
		base.push( extra );
	}
	return base.join( ' ' );
}

function getStatusLabel( status: ReturnType< typeof useRealtimeSession >[ 'status' ] ): string {
	switch ( status ) {
		case 'requesting-token':
			return __( 'Getting things ready…' );
		case 'requesting-mic':
			return __( 'Requesting microphone…' );
		case 'connecting':
			return __( 'Connecting…' );
		case 'active':
			return __( 'On the line' );
		case 'ending':
			return __( 'Ending call…' );
		case 'error':
			return __( 'Something went wrong' );
		case 'idle':
		default:
			return __( 'Ready to call' );
	}
}

export function LiveAIAssistant( { contextualInstructions }: LiveAIAssistantProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const location = useLocation();
	const locale = useLocale();
	const eventTimeoutRef = useRef< number | null >( null );

	const { flowName, stepName } = useMemo( () => {
		const parts = location.pathname.split( '/' ).filter( Boolean );
		return {
			flowName: parts[ 0 ] ?? '',
			stepName: parts[ 1 ] ?? '',
		};
	}, [ location.pathname ] );

	const instructions = useMemo(
		() => buildInstructions( flowName, stepName, locale, contextualInstructions ),
		[ flowName, stepName, locale, contextualInstructions ]
	);

	const {
		status,
		error,
		isMuted,
		transcript,
		start,
		stop,
		toggleMute,
		sendEvent,
		updatePointerPosition,
	} = useRealtimeSession( { instructions } );

	const transcriptRef = useRef< HTMLDivElement | null >( null );
	useEffect( () => {
		const el = transcriptRef.current;
		if ( el ) {
			el.scrollTop = el.scrollHeight;
		}
	}, [ transcript ] );

	const isCallActive = status === 'active';
	const isCallBusy =
		status === 'requesting-token' ||
		status === 'requesting-mic' ||
		status === 'connecting' ||
		status === 'ending';

	useEffect( () => {
		if ( status !== 'active' ) {
			return;
		}

		const scheduleEvent = ( eventName: string, details?: string ) => {
			if ( eventTimeoutRef.current !== null ) {
				window.clearTimeout( eventTimeoutRef.current );
			}

			eventTimeoutRef.current = window.setTimeout( () => {
				eventTimeoutRef.current = null;
				sendEvent( eventName, details );
			}, PAGE_EVENT_DEBOUNCE_MS );
		};

		const handleKeydown = ( event: KeyboardEvent ) => {
			const target = event.target as HTMLElement | null;
			const tagName = target?.tagName?.toLowerCase() ?? 'unknown';
			scheduleEvent( 'user-typed', `target=${ tagName }` );
		};

		const handleClick = ( event: MouseEvent ) => {
			const target = event.target as HTMLElement | null;
			const tagName = target?.tagName?.toLowerCase() ?? 'unknown';
			scheduleEvent( 'user-clicked', `target=${ tagName }` );
		};

		const handlePointerMove = ( event: PointerEvent ) => {
			updatePointerPosition( event.clientX, event.clientY );
		};

		const handleScroll = () => {
			scheduleEvent( 'user-scrolled' );
		};

		const handleWpcomMessage = ( event: MessageEvent ) => {
			if ( event.origin !== PUBLIC_API_WPCOM_ORIGIN ) {
				return;
			}
			scheduleEvent( 'network-request-done', `origin=${ event.origin }` );
		};

		window.addEventListener( 'keydown', handleKeydown, true );
		window.addEventListener( 'click', handleClick, true );
		window.addEventListener( 'pointermove', handlePointerMove, true );
		window.addEventListener( 'scroll', handleScroll, true );
		window.addEventListener( 'message', handleWpcomMessage );

		return () => {
			if ( eventTimeoutRef.current !== null ) {
				window.clearTimeout( eventTimeoutRef.current );
				eventTimeoutRef.current = null;
			}
			window.removeEventListener( 'keydown', handleKeydown, true );
			window.removeEventListener( 'click', handleClick, true );
			window.removeEventListener( 'pointermove', handlePointerMove, true );
			window.removeEventListener( 'scroll', handleScroll, true );
			window.removeEventListener( 'message', handleWpcomMessage );
		};
	}, [ sendEvent, status, updatePointerPosition ] );

	useEffect( () => {
		if ( status !== 'active' ) {
			return;
		}

		sendEvent( 'page-changed', `path=${ location.pathname }` );
	}, [ location.key, location.pathname, sendEvent, status ] );

	const handleTogglePanel = () => {
		setIsOpen( ( prev ) => {
			const next = ! prev;
			if ( ! next && ( isCallActive || isCallBusy ) ) {
				stop();
			}
			return next;
		} );
	};

	const handleCallToggle = () => {
		if ( isCallActive || isCallBusy ) {
			stop();
		} else {
			start();
		}
	};

	const handleClose = () => {
		if ( isCallActive || isCallBusy ) {
			stop();
		}
		setIsOpen( false );
	};

	return (
		<div className="live-ai-assistant">
			{ isOpen && (
				<div
					className={ clsx( 'live-ai-assistant__panel', {
						'is-active': isCallActive,
					} ) }
					role="dialog"
					aria-label={ __( 'Live AI sign-up assistant' ) }
				>
					<div className="live-ai-assistant__header">
						<div className="live-ai-assistant__header-info">
							<div
								className={ clsx( 'live-ai-assistant__avatar', {
									'is-active': isCallActive,
								} ) }
								aria-hidden="true"
							>
								<PhoneIcon />
							</div>
							<div className="live-ai-assistant__header-text">
								<div className="live-ai-assistant__title">{ __( 'Sign-up Assistant' ) }</div>
								<div className="live-ai-assistant__subtitle">{ getStatusLabel( status ) }</div>
							</div>
						</div>
						<Button
							className="live-ai-assistant__close"
							icon={ close }
							label={ __( 'Close' ) }
							onClick={ handleClose }
						/>
					</div>

					<div className="live-ai-assistant__body">
						{ status === 'idle' && transcript.length === 0 && (
							<p className="live-ai-assistant__intro">
								{ __(
									'Tap the call button to start a voice conversation. Your assistant can answer questions and guide you through sign-up.'
								) }
							</p>
						) }

						{ error && (
							<div className="live-ai-assistant__error" role="alert">
								{ error }
							</div>
						) }

						{ transcript.length > 0 && (
							<div className="live-ai-assistant__transcript" ref={ transcriptRef }>
								{ transcript.map( ( entry ) => (
									<div
										key={ entry.id }
										className={ clsx( 'live-ai-assistant__message', `is-${ entry.role }` ) }
									>
										<span className="live-ai-assistant__message-role">
											{ entry.role === 'user' ? __( 'You' ) : __( 'Assistant' ) }
										</span>
										<span className="live-ai-assistant__message-text">{ entry.text || '…' }</span>
									</div>
								) ) }
							</div>
						) }
					</div>

					<div className="live-ai-assistant__controls">
						<Button
							variant="secondary"
							className="live-ai-assistant__mute"
							onClick={ toggleMute }
							disabled={ ! isCallActive }
							aria-pressed={ isMuted }
						>
							<MicIcon muted={ isMuted } />
							<span>{ isMuted ? __( 'Unmute' ) : __( 'Mute' ) }</span>
						</Button>
						<Button
							variant="primary"
							className={ clsx( 'live-ai-assistant__call-button', {
								'is-hangup': isCallActive || isCallBusy,
							} ) }
							onClick={ handleCallToggle }
							isBusy={ isCallBusy }
						>
							{ isCallActive || isCallBusy ? (
								<>
									<PhoneHangupIcon />
									<span>{ __( 'End call' ) }</span>
								</>
							) : (
								<>
									<PhoneIcon />
									<span>{ __( 'Start call' ) }</span>
								</>
							) }
						</Button>
					</div>
				</div>
			) }

			<button
				type="button"
				className={ clsx( 'live-ai-assistant__fab', {
					'is-open': isOpen,
					'is-active': isCallActive,
				} ) }
				onClick={ handleTogglePanel }
				aria-label={ isOpen ? __( 'Hide sign-up assistant' ) : __( 'Open sign-up assistant' ) }
				aria-expanded={ isOpen }
			>
				{ isOpen ? <Icon icon={ close } size={ 22 } /> : <PhoneIcon /> }
				{ isCallActive && <span className="live-ai-assistant__fab-pulse" aria-hidden="true" /> }
			</button>
		</div>
	);
}

export default LiveAIAssistant;
