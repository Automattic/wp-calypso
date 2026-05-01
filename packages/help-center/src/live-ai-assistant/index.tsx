import { useLocale } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close, Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRealtimeSession } from './use-realtime-session';
import type { RealtimeToolEvent, RealtimeTranscriptEntry } from './use-realtime-session';
import './style.scss';

type TimelineRow =
	| { kind: 'message'; timestamp: number; entry: RealtimeTranscriptEntry }
	| { kind: 'tool'; timestamp: number; evt: RealtimeToolEvent };

function buildTimelineRows(
	transcript: RealtimeTranscriptEntry[],
	toolEvents: RealtimeToolEvent[]
): TimelineRow[] {
	const rows: TimelineRow[] = [
		...transcript.map( ( entry ) => ( {
			kind: 'message' as const,
			timestamp: entry.timestamp,
			entry,
		} ) ),
		...toolEvents.map( ( evt ) => ( { kind: 'tool' as const, timestamp: evt.timestamp, evt } ) ),
	];
	rows.sort( ( a, b ) => {
		const d = a.timestamp - b.timestamp;
		if ( d !== 0 ) {
			return d;
		}
		if ( a.kind !== b.kind ) {
			return a.kind === 'message' ? -1 : 1;
		}
		const idA = a.kind === 'message' ? a.entry.id : a.evt.id;
		const idB = b.kind === 'message' ? b.entry.id : b.evt.id;
		return idA.localeCompare( idB );
	} );
	return rows;
}

/**
 * Heroicons v2 solid microphone (MIT) — filled geometry reads clearly at 18–20px;
 * thick stroked outlines were visually merging into one blob.
 * @see https://github.com/tailwindlabs/heroicons
 */
const MicIcon = ( { size = 18, muted = false }: { size?: number; muted?: boolean } ) => (
	<svg
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fill="currentColor"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
		<path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
		{ muted && (
			<path
				d="M4 4l16 16"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		) }
	</svg>
);

const StopIcon = () => (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="currentColor"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<rect x="6" y="6" width="12" height="12" rx="2" />
	</svg>
);

interface LiveAIAssistantProps {
	contextualInstructions?: string;
	/**
	 * Icon shown on the floating action button when the panel is closed.
	 * Defaults to a microphone icon. Only used when `layout` is `floating`.
	 */
	fabIcon?: React.ReactNode;
	/** `floating`: FAB + anchored panel (default). `sidebar`: fills an editor PluginSidebar. */
	layout?: 'floating' | 'sidebar';
}

const PAGE_EVENT_DEBOUNCE_MS = 100;
const PUBLIC_API_WPCOM_ORIGIN = 'https://public-api.wordpress.com';

function buildInstructions( locale: string, extra?: string ): string {
	const base = [
		'You are the WordPress.com Dictation Assistant for the Gutenberg block editor.',
		'Your job is to let the user write and structure a full article entirely by voice, without ever touching the keyboard.',
		'Treat anything the user says as content to be written into the post, not as chat — unless they are clearly asking a question, asking for help, or giving you an editing or structural instruction (e.g. "make that a heading", "add a list", "delete the last paragraph", "what blocks can I add?").',
		'Default behavior: capture what the user says and place it into the post by inserting or updating blocks via the editor tools. Do not paraphrase, summarize, or rewrite their words unless they explicitly ask you to. Preserve their voice, vocabulary, and tone.',
		'End-of-post rule: never add paragraphs, headings, lists, splits, quotes, insertions, or any new material in the middle of the article unless the user explicitly names a placement (e.g. "after the third paragraph", "below the intro heading", "insert this above the footer"). When they say "add", continue dictating without naming a spot, give no location, or otherwise imply ordinary forward writing — always extend or append at the END after every existing top-level block. Ignore the caret or incidental selection alone: do not splice new dictation into an earlier section because the cursor happened to sit there.',
		'Save dictation as often as possible. DO NOT wait for the user to pause, finish a sentence, or stop speaking before writing to the editor. The instant you have any new transcribed text — even a partial clause, a few words, or a single phrase — commit it to the LAST trailing block(s) at the END of the post via update_block_attributes_tool (typically the bottom paragraph / last block stream), or insert a NEW block THERE if a structural cue requires it. Use get_editor_blocks_tool when unsure which clientId is truly last at the root. Treat each incoming chunk of speech as something to commit immediately so the user can always see their words materializing in the editor in near real-time.',
		'Streaming writes: keep extending the current TRAILING block at the end of the article as the user keeps talking (not a mid-post block unless they explicitly asked you to write there). When you append, set attributes.content to the FULL accumulated content of that block (existing content + new words), not just the new words, so RichText stays consistent. If you accidentally duplicate a phrase, immediately fix it with another update_block_attributes_tool call rather than waiting.',
		'Never buffer dictation internally hoping for a "complete" thought. There is no such thing as too-frequent a write. If in doubt, write now and refine later.',
		'Be extremely quiet on audio. NEVER EVER speak verbal acknowledgements like "Done.", "Got it.", "Added.", "Okay.". Instead, after successfully writing what the user dictated (or completing any other action), call play_done_sound_tool to play a brief gentle tone as a non-verbal "done" cue. The tone is the only acknowledgement the user wants — do not also say anything. Never read the dictated text back. Frequent silent writes plus a play_done_sound_tool ping are strongly preferred over any verbal confirmation. The only time you should speak is when the user has clearly asked you a question or asked for help (not while they are dictating).',
		'Structural cues: when the user says "new paragraph" / "next paragraph", start a fresh core/paragraph block appended at the END of the article (same placement default as inserts) unless they told you a specific spot. "Heading" / "heading two" / "subheading" → core/heading at the END unless they specified otherwise. "Bullet list" / "bulleted list" / "numbered list" → core/list (with ordered=true for numbered) containing core/list-item children, inserted at the END by default. "Quote" / "blockquote" → core/quote. "Horizontal line" / "divider" → core/separator. "Image of X" → core/image (leave url empty if none provided; the user can fill it in).',
		'Editing cues: "delete that" / "remove the last block" → remove the most recently inserted block (or the selected block). "Change this to a heading" → replace the selected/last paragraph with a heading carrying the same content. "Make this the title" → set the post title.',
		'Punctuation: convert spoken cues like "comma", "period" / "full stop", "question mark", "exclamation mark", "colon", "semicolon", "open quote" / "close quote", "new line" into actual punctuation. Capitalize sentence beginnings and proper nouns.',
		'Never greet proactively, never narrate what you are doing, never explain the tools, and never volunteer extra commentary. Focus on writing.',
		`The current UI locale is "${ locale }". Write the article in the language the user is dictating in. Spoken responses to the user should be in English unless they explicitly switch.`,
		'Never ask follow-up questions while the user is dictating. If something is genuinely ambiguous, make the most reasonable choice and continue; the user can correct you afterwards.',
		'Block workflow:',
		"1. Use get_block_types_tool to discover which blocks exist — it returns a slim catalog of just { name, title, description } for every registered block. Then, BEFORE inserting/replacing/editing a non-trivial block, call get_block_examples_tool with the exact block name to see if there is a curated example you should mirror (especially important for structured/data-driven blocks like jetpack/map, embeds, and anything where the data-* attributes on the saved fallback markup must line up with the JSON in the comment). If get_block_examples_tool returns examples, copy the attribute shape verbatim and just substitute the user's data — do not invent attribute keys. If no example exists, fall back to get_block_type_tool with the exact name to fetch the FULL attribute schema. Do not call get_block_types_tool repeatedly — call it once for discovery, and use get_block_examples_tool / get_block_type_tool on demand.",
		'2. Use get_editor_blocks_tool to read the post structure, get_block_tool to fetch one block by clientId, get_selected_block_tool for the current selection, and has_selected_block_tool for a quick check before acting on "this" / "that".',
		'3. Use insert_block_tool to add a single new block. DEFAULT is ALWAYS the END: call insert_block_tool with NO index, NO root_client_id, and NO after_client_id, so the block lands after every existing top-level block. Never tuck a block into an earlier hole because of selection or ambiguity — middles are forbidden unless the user clearly asked for them (e.g. "put this at the top", "insert this after the heading", "add this inside that group"). Casual "add X" means append new material at the end. Always keep update_selection at its default (true) so the freshly inserted block becomes the active one for the next dictation.',
		'4. Use insert_blocks_tool to lay down a structured chunk in one shot (e.g. heading + paragraph + list). Same rule: only at the END unless they explicitly directed a middle or inline placement. Faster than several insert_block_tool calls.',
		"5. Use update_block_attributes_tool to tweak an existing block (rewrite a paragraph's content, change heading level, set image alt text). Prefer this over replace_block_tool when the block type stays the same.",
		'Cursor placement: after EVERY write that commits content to a block (update_block_attributes_tool extending a paragraph, insert_block_tool / insert_blocks_tool adding new blocks, replace_block_tool swapping a block, format_text_tool formatting inline text), make sure the editor selection (the caret) ends up at the END of the block whose content you just wrote, so the user can keep dictating from where they left off without ever clicking. Concretely: insert_block_tool / insert_blocks_tool already do this when update_selection stays true (the default — never set it to false during dictation). For update_block_attributes_tool, follow up with a select_block call on the same clientId so focus snaps back to that block. Never leave the caret in a previous, now-stale block.',
		'6. Use replace_block_tool when the user wants to convert a block into a different type ("turn this paragraph into a heading", "make this a quote"). Reuse the previous block\'s text content where it makes sense.',
		'7. Use remove_block_tool when the user says "delete that", "remove the last paragraph", "scratch the heading". Defaults to selecting the previous block so dictation can continue.',
		'8. Use move_block_tool to reorder blocks ("move that up", "move this to the top" → to_index: 0).',
		"9. Use format_text_tool for inline RichText formatting: bold, italic, strikethrough, code, link (with url), underline, subscript, superscript. Pass target_text to format a substring of the current/selected block, or omit it to use the editor's active text selection.",
		'10. Use select_block to move focus when the user says "go back to the first paragraph". Use get_inserter_items_tool only when you need to know what is allowed inside a particular container (rare).',
		'Post-level workflow:',
		'- Use set_post_title_tool when the user dictates a title or says "make this the title" / "the title is …". The title is NOT a block — it has its own field above the blocks.',
		'- Use save_post_tool when the user says "save", "save draft", "save my work". This does not change publish status.',
		'- Use publish_post_tool ONLY when the user explicitly says "publish" / "publish it" / "go ahead and publish". Never publish proactively.',
		'- Use undo_tool / redo_tool for "undo that" / "redo".',
		'- Use get_post_info_tool sparingly, e.g. when the user asks "is it saved?" / "did it publish?" / "what\'s the status?".',
		'Common attribute shapes: core/paragraph → { content: "..." }; core/heading → { content: "...", level: 2 }; core/list → { ordered: false } with inner_blocks of core/list-item, each { content: "..." }; core/quote → inner_blocks of core/paragraph plus optional citation; core/image → { url, alt }. When unsure, call get_block_type_tool with the exact block name to see its full attribute schema.',
		'Coloring blocks: to set the text color or background color of a block (e.g. "make that paragraph red", "make the heading on a black background"), call update_block_attributes_tool and write to attributes.style.color. Text color goes at attributes.style.color.text and background goes at attributes.style.color.background. Use a hex string like "#ff0000". To recolor inline links inside the same block, also set attributes.style.elements.link.color.text to the same value. Example: a red core/paragraph looks like { "name": "core/paragraph", "attributes": { "content": "I was there twenty years ago…", "dropCap": false, "style": { "color": { "text": "#ff0000" }, "elements": { "link": { "color": { "text": "#ff0000" } } } } } }. Always merge with existing attributes — do not drop other style keys you did not intend to change.',
		'Reading block content: when get_editor_blocks_tool / get_selected_block_tool / get_block_tool return a block, the readable content lives in attributes.content (a string of HTML for RichText blocks like core/paragraph, core/heading, core/list-item, core/code, core/html). Each top-level block also includes a saved_html field — the canonical Gutenberg-serialized markup including comment delimiters — and may include originalContent (the parsed HTML the block was loaded from). Trust attributes.content for editing decisions and use saved_html only as a sanity check; never echo the raw HTML back to the user.',
		'Never speak passwords, credit card numbers, or two-factor codes out loud, and never write them into the post.',
		'The goal: by the end of the session the user should have a complete, well-structured, optionally published article composed of real Gutenberg blocks, written entirely with their voice.',
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
			return __( 'Listening' );
		case 'ending':
			return __( 'Stopping…' );
		case 'error':
			return __( 'Something went wrong' );
		case 'idle':
		default:
			return __( 'Ready to dictate' );
	}
}

export function LiveAIAssistant( {
	contextualInstructions,
	fabIcon,
	layout = 'floating',
}: LiveAIAssistantProps ) {
	const isSidebar = layout === 'sidebar';
	const [ isFloatingPanelOpen, setFloatingPanelOpen ] = useState( false );
	const showPanel = isSidebar ? true : isFloatingPanelOpen;
	const locale = useLocale();
	const eventTimeoutRef = useRef< number | null >( null );

	const instructions = useMemo(
		() => buildInstructions( locale, contextualInstructions ),
		[ locale, contextualInstructions ]
	);

	const { status, error, isMuted, transcript, toolEvents, start, stop, toggleMute, sendEvent } =
		useRealtimeSession( { instructions } );

	const timelineRows = useMemo(
		() => buildTimelineRows( transcript, toolEvents ),
		[ transcript, toolEvents ]
	);

	const transcriptRef = useRef< HTMLDivElement | null >( null );
	const sidebarBodyScrollRef = useRef< HTMLDivElement | null >( null );
	useEffect( () => {
		const scrollEl = isSidebar ? sidebarBodyScrollRef.current : transcriptRef.current;
		if ( scrollEl ) {
			scrollEl.scrollTop = scrollEl.scrollHeight;
		}
	}, [ transcript, toolEvents, isSidebar ] );

	const isSessionActive = status === 'active';
	const isSessionBusy =
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
		window.addEventListener( 'scroll', handleScroll, true );
		window.addEventListener( 'message', handleWpcomMessage );

		return () => {
			if ( eventTimeoutRef.current !== null ) {
				window.clearTimeout( eventTimeoutRef.current );
				eventTimeoutRef.current = null;
			}
			window.removeEventListener( 'keydown', handleKeydown, true );
			window.removeEventListener( 'scroll', handleScroll, true );
			window.removeEventListener( 'message', handleWpcomMessage );
		};
	}, [ sendEvent, status ] );

	const handleToggleFloatingPanel = () => {
		if ( isSidebar ) {
			return;
		}
		setFloatingPanelOpen( ( prev ) => {
			const next = ! prev;
			if ( ! next && ( isSessionActive || isSessionBusy ) ) {
				stop();
			}
			return next;
		} );
	};

	const handleSessionToggle = () => {
		if ( isSessionActive || isSessionBusy ) {
			stop();
		} else {
			start();
		}
	};

	const handleCloseFloatingPanel = () => {
		if ( isSessionActive || isSessionBusy ) {
			stop();
		}
		if ( ! isSidebar ) {
			setFloatingPanelOpen( false );
		}
	};

	return (
		<>
			{ ! isSidebar && (
				<Button
					type="button"
					className={ clsx( 'live-ai-assistant__fab', {
						'is-active': isSessionActive,
						'is-open': isFloatingPanelOpen,
					} ) }
					onClick={ handleToggleFloatingPanel }
					aria-label={
						isFloatingPanelOpen
							? __( 'Hide dictation assistant' )
							: __( 'Open dictation assistant' )
					}
					aria-expanded={ isFloatingPanelOpen }
				>
					{ isFloatingPanelOpen ? (
						<Icon icon={ close } size={ 22 } />
					) : (
						fabIcon ?? <MicIcon size={ 20 } />
					) }
					{ isSessionActive && (
						<span className="live-ai-assistant__fab-pulse" aria-hidden="true" />
					) }
				</Button>
			) }
			<div className={ clsx( 'live-ai-assistant', isSidebar && 'live-ai-assistant--sidebar' ) }>
				{ showPanel && (
					<div
						className={ clsx( 'live-ai-assistant__panel', {
							'is-active': isSessionActive,
						} ) }
						role={ isSidebar ? undefined : 'dialog' }
						aria-label={ __( 'WP.com Smart Dictation' ) }
						{ ...( ! isSidebar ? { ariaModal: true } : {} ) }
					>
						{ ! isSidebar ? (
							<div className="live-ai-assistant__header">
								<div className="live-ai-assistant__header-info">
									<div
										className={ clsx( 'live-ai-assistant__avatar', {
											'is-active': isSessionActive,
										} ) }
										aria-hidden="true"
									>
										<MicIcon size={ 20 } />
									</div>
									<div className="live-ai-assistant__header-text">
										<div className="live-ai-assistant__title">
											{ __( 'WP.com Smart Dictation' ) }
										</div>
										<div className="live-ai-assistant__subtitle">{ getStatusLabel( status ) }</div>
									</div>
								</div>
								<Button
									className="live-ai-assistant__close"
									icon={ close }
									label={ __( 'Close' ) }
									onClick={ handleCloseFloatingPanel }
								/>
							</div>
						) : (
							<div
								className={ clsx( 'live-ai-assistant__sidebar-status', {
									'is-session-active': isSessionActive || isSessionBusy,
								} ) }
								aria-live="polite"
							>
								{ getStatusLabel( status ) }
							</div>
						) }

						<div
							className="live-ai-assistant__body"
							ref={ isSidebar ? sidebarBodyScrollRef : undefined }
						>
							{ status === 'idle' && timelineRows.length === 0 && (
								<p className="live-ai-assistant__intro">
									{ __(
										'Tap Start dictation and speak naturally. Your words will be turned into blocks in the editor.'
									) }
								</p>
							) }

							{ error && (
								<div className="live-ai-assistant__error" role="alert">
									{ error }
								</div>
							) }

							{ timelineRows.length > 0 && (
								<div
									className="live-ai-assistant__transcript"
									ref={ ! isSidebar ? transcriptRef : undefined }
								>
									{ timelineRows.map( ( row ) =>
										row.kind === 'message' ? (
											<div
												key={ row.entry.id }
												className={ clsx( 'live-ai-assistant__message', `is-${ row.entry.role }` ) }
											>
												<span className="live-ai-assistant__message-role">
													{ row.entry.role === 'user' ? __( 'You' ) : __( 'Assistant' ) }
												</span>
												<span className="live-ai-assistant__message-text">
													{ row.entry.text || '…' }
												</span>
											</div>
										) : (
											<div
												key={ `tool-${ row.evt.id }` }
												className={ clsx( 'live-ai-assistant__transcript-tool', {
													'is-error': row.evt.status === 'error',
												} ) }
											>
												<span
													className="live-ai-assistant__transcript-tool-dot"
													aria-hidden="true"
												/>
												<span className="live-ai-assistant__transcript-tool-label">
													{ row.evt.label }
												</span>
											</div>
										)
									) }
								</div>
							) }
						</div>

						<div className="live-ai-assistant__controls">
							<Button
								variant="secondary"
								className="live-ai-assistant__mute"
								onClick={ toggleMute }
								disabled={ ! isSessionActive }
								aria-pressed={ isMuted }
							>
								<MicIcon muted={ isMuted } />
								<span>{ isMuted ? __( 'Unmute' ) : __( 'Mute' ) }</span>
							</Button>
							<Button
								variant="primary"
								className={ clsx( 'live-ai-assistant__call-button', {
									'is-hangup': isSessionActive || isSessionBusy,
								} ) }
								onClick={ handleSessionToggle }
								isBusy={ isSessionBusy }
							>
								{ isSessionActive || isSessionBusy ? (
									<>
										<StopIcon />
										<span>{ __( 'Stop dictation' ) }</span>
									</>
								) : (
									<>
										<MicIcon />
										<span>{ __( 'Start dictation' ) }</span>
									</>
								) }
							</Button>
						</div>
					</div>
				) }
			</div>
		</>
	);
}

export default LiveAIAssistant;
