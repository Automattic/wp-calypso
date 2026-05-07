import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLocale } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Notice } from '@wordpress/ui';
import clsx from 'clsx';
import { useEffect, useMemo, useRef } from 'react';
import introArtworkUrl from './assets/voice-control-gutenberg.mp4';
import AudioFftBlobs from './components/audio-fft-blobs';
import { MicIcon } from './components/mic-icon';
import { DictationFileUpload, ImagePickerModal } from './image-picker-modal';
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

function recordPaneEvent( action: 'opened' | 'closed' ) {
	recordTracksEvent( `calypso_smart_dictation_pane_${ action }` );
}

interface LiveAIAssistantProps {
	contextualInstructions?: string;
}

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
		'Structural cues: when the user says "new paragraph" / "next paragraph", start a fresh core/paragraph block appended at the END of the article (same placement default as inserts) unless they told you a specific spot. "Heading" / "heading two" / "subheading" → core/heading at the END unless they specified otherwise. "Bullet list" / "bulleted list" / "numbered list" → core/list (with ordered=true for numbered) containing core/list-item children, inserted at the END by default. "Quote" / "blockquote" → core/quote. "Horizontal line" / "divider" → core/separator. "Image of X" / "picture of X" / "draw / generate / create / make an image of X" → call generate_image_tool with a vivid English prompt describing X (the tool inserts a core/image at the end of the post and fills it with a freshly generated AI image, no URL needed). "Add an image" / "insert an image" / "add a picture" / "I want a photo here" with NO subject and NO source specified → IMMEDIATELY call pick_image_tool with action "menu" — DO NOT speak the three options out loud, the on-screen chooser shows them. After the user says one of "upload" / "select" (or "library") / "generate" + description, route to the matching tool: pick_image_tool action "upload", pick_image_tool action "open", or generate_image_tool. If they say "from my media library" / "pick from library" up front → pick_image_tool action "open" directly. If they say "upload an image" up front → pick_image_tool action "upload" directly.',
		'Editing cues: "delete that" / "remove the last block" → remove the most recently inserted block (or the selected block). "Change this to a heading" → replace the selected/last paragraph with a heading carrying the same content. "Make this the title" → set the post title.',
		'Punctuation: convert spoken cues like "comma", "period" / "full stop", "question mark", "exclamation mark", "colon", "semicolon", "open quote" / "close quote", "new line" into actual punctuation. Capitalize sentence beginnings and proper nouns.',
		'Never greet proactively, never narrate what you are doing, never explain the tools, and never volunteer extra commentary. Focus on writing.',
		`The current UI locale is "${ locale }". Write the article in the language the user is dictating in. Spoken responses to the user should be in English unless they explicitly switch.`,
		'Never ask follow-up questions while the user is dictating. If something is genuinely ambiguous, make the most reasonable choice and continue; the user can correct you afterwards.',
		'Block workflow:',
		'1. get_block_types_tool returns registered block names only (strings). Use it sparingly to discover or search names. Before EVERY insert_block_tool, insert_blocks_tool, update_block_attributes_tool, replace_block_tool, or any write that sets attributes on a block, you MUST call get_block_type_tool with that block\'s exact name first — every time, including each distinct type in inner_blocks. Never skip this for "simple" blocks. After the first discovery pass, do not spam get_block_types_tool; reuse get_block_type_tool per type as needed. From the get_block_type_tool response, when block_type.example.attributes exists, use it as the scheme for your attributes object (preserve structure and keys; fill with the user\'s content). If there is no example, derive attribute values from block_type.attributes (defaults and types).',
		'2. Use get_editor_blocks_tool to read the post structure, get_block_tool to fetch one block by clientId, get_selected_block_tool for the current selection, and has_selected_block_tool for a quick check before acting on "this" / "that".',
		'3. Use insert_block_tool to add a single new block. DEFAULT is ALWAYS the END: call insert_block_tool with NO index, NO root_client_id, and NO after_client_id, so the block lands after every existing top-level block. Never tuck a block into an earlier hole because of selection or ambiguity — middles are forbidden unless the user clearly asked for them (e.g. "put this at the top", "insert this after the heading", "add this inside that group"). Casual "add X" means append new material at the end. Always keep update_selection at its default (true) so the freshly inserted block becomes the active one for the next dictation.',
		'4. Use insert_blocks_tool to lay down a structured chunk in one shot (e.g. heading + paragraph + list). Same rule: only at the END unless they explicitly directed a middle or inline placement. Faster than several insert_block_tool calls.',
		"5. Use update_block_attributes_tool to tweak an existing block (rewrite a paragraph's content, change heading level, set image alt text). Prefer this over replace_block_tool when the block type stays the same.",
		'Cursor placement: after EVERY write that commits content to a block (update_block_attributes_tool extending a paragraph, insert_block_tool / insert_blocks_tool adding new blocks, replace_block_tool swapping a block, format_text_tool formatting inline text), make sure the editor selection (the caret) ends up at the END of the block whose content you just wrote, so the user can keep dictating from where they left off without ever clicking. Concretely: insert_block_tool / insert_blocks_tool already do this when update_selection stays true (the default — never set it to false during dictation). For update_block_attributes_tool, follow up with a select_block call on the same clientId so focus snaps back to that block. Never leave the caret in a previous, now-stale block.',
		'6. Use replace_block_tool when the user wants to convert a block into a different type ("turn this paragraph into a heading", "make this a quote"). Reuse the previous block\'s text content where it makes sense.',
		'7. Use remove_block_tool when the user says "delete that", "remove the last paragraph", "scratch the heading". Defaults to selecting the previous block so dictation can continue.',
		'8. Use move_block_tool to reorder blocks ("move that up", "move this to the top" → to_index: 0).',
		"9. Use format_text_tool for inline RichText formatting: bold, italic, strikethrough, code, link (with url), underline, subscript, superscript. Pass target_text to format a substring of the current/selected block, or omit it to use the editor's active text selection.",
		//'Formatting fallback: if you cannot achieve what the user asked on a paragraph (format_text_tool errors, RichText strips forbidden tags or refuses the markup, update_block_attributes on core/paragraph will not persist the layout/colors/snippet — do not spiral on retries forever) — swap to the Custom HTML block (core/html) via replace_block_tool on that paragraph or insert_block_tool at the end following placement rules, with attributes.content as valid equivalent HTML preserving their dictated text.',
		'10. Use select_block to move focus when the user says "go back to the first paragraph". Use get_inserter_items_tool only when you need to know what is allowed inside a particular container (rare).',
		'Post-level workflow:',
		'- Use set_post_title_tool when the user dictates a title or says "make this the title" / "the title is …". The title is NOT a block — it has its own field above the blocks.',
		'- Use save_post_tool when the user says "save", "save draft", "save my work". This does not change publish status.',
		'- Use stop_dictation_tool immediately when the user asks to stop, end, cancel, or finish dictation.',
		'- Use publish_post_tool ONLY when the user explicitly says "publish" / "publish it" / "go ahead and publish". Never publish proactively.',
		'- Use undo_tool / redo_tool for "undo that" / "redo".',
		'- Use get_post_info_tool sparingly, e.g. when the user asks "is it saved?" / "did it publish?" / "what\'s the status?".',
		'Common attribute shapes (always confirm with get_block_type_tool immediately before writes; prefer block_type.example.attributes as the template when the block registers one): core/paragraph → { content: "..." }; core/html (Custom HTML) → { content: "<p>...</p>" } raw markup when paragraph/RichText cannot hold what they asked; core/heading → { content: "...", level: 2 }; core/list → { ordered: false } with inner_blocks of core/list-item, each { content: "..." }; core/quote → inner_blocks of core/paragraph plus optional citation; core/image → { url, alt }.',
		'YouTube embeds: when the user asks for a YouTube video, recall up to 5 candidate canonical URLs from your own knowledge ordered by confidence, then ALWAYS call verify_youtube_url_tool first with `urls` set to that array — the tool tries them in order and returns the first that loads in the player, plus the real title and uploader. Match the returned title/author against the user\'s request using the criteria below. If nothing in the batch matches, recall a fresh batch and call again — up to 3 batches total. Only after a confirmed match should you insert the embed via insert_block_tool with name "core/embed" and attributes { url, providerNameSlug: "youtube", responsive: true, type: "video" }. Never embed a YouTube URL you have not verified.',
		'Match criteria — SPECIFIC request ("Britney Spears Toxic", "the Diana Ross Upside Down clip", "Metallica\'s Enter Sandman official video"): BOTH the title AND the uploader must match the user\'s request. The uploader can be the artist directly or their official channel / VEVO / "- Topic" auto-channel (e.g. "BritneySpearsVEVO" or "Britney Spears - Topic" both count as Britney Spears). If only the artist matches but the song is wrong, that is NOT a match — keep searching.',
		'Match criteria — OPEN-ENDED request ("any song from Metallica", "a Beatles track", "something by Daft Punk", "a tutorial on React hooks", "a clip about the SpaceX launch"): treat "any" / "some" / "a" / "something by" as permission to choose the title for them. When the user named an artist / channel / creator, the uploader still must match (a Metallica request requires a Metallica / MetallicaTV / "Metallica - Topic" upload, not a cover, not a different band). When the user named a topic instead of a creator, the title or channel must clearly be on that topic. DO NOT ask the user which one — pick the most iconic / well-known canonical choice yourself, verify, and embed.',
		'When no match is found after 10 batches: DO NOT embed a substitute video from a different artist, creator, or topic — that is strictly worse than embedding nothing. Instead, briefly tell the user out loud "I couldn\'t find a working YouTube URL for that — could you give me a link?" and stop. This is one of the rare cases where you should speak; keep it to one short sentence. After they paste or dictate a URL, verify it and embed it. If their URL also fails verification or does not match, tell them so and stop — never silently substitute.',
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

export function LiveAIAssistant( { contextualInstructions }: LiveAIAssistantProps ) {
	const locale = useLocale();
	const instructions = useMemo(
		() => buildInstructions( locale, contextualInstructions ),
		[ locale, contextualInstructions ]
	);

	const {
		status,
		error,
		isMuted,
		localStream,
		transcript,
		toolEvents,
		imagePickerState,
		start,
		stop,
		toggleMute,
	} = useRealtimeSession( { instructions } );

	const timelineRows = useMemo(
		() => buildTimelineRows( transcript, toolEvents ),
		[ transcript, toolEvents ]
	);

	const bodyScrollRef = useRef< HTMLDivElement | null >( null );

	useEffect( () => {
		recordPaneEvent( 'opened' );
		return () => {
			recordPaneEvent( 'closed' );
		};
	}, [] );

	useEffect( () => {
		if ( bodyScrollRef.current ) {
			bodyScrollRef.current.scrollTop = bodyScrollRef.current.scrollHeight;
		}
	}, [ transcript, toolEvents ] );

	const isSessionActive = status === 'active';
	const isSessionBusy =
		status === 'requesting-token' ||
		status === 'requesting-mic' ||
		status === 'connecting' ||
		status === 'ending';

	const handleSessionToggle = () => {
		if ( isSessionActive || isSessionBusy ) {
			stop();
		} else {
			start();
		}
	};
	const statusContent = isSessionActive ? (
		<>
			<AudioFftBlobs
				className="live-ai-assistant__status-blobs"
				stream={ localStream }
				isActive={ ! isMuted }
				size={ 64 }
			/>
			<span className="screen-reader-text">{ __( 'Listening' ) }</span>
		</>
	) : (
		getStatusLabel( status )
	);
	const showSubtitle =
		isSessionActive || isSessionBusy || timelineRows.length > 0 || status === 'error';

	return (
		<>
			<div className="live-ai-assistant">
				<div
					className={ clsx( 'live-ai-assistant__panel', {
						'is-active': isSessionActive,
					} ) }
					aria-label={ __( 'WP.com Smart Dictation' ) }
				>
					<div className="live-ai-assistant__body" ref={ bodyScrollRef }>
						{ showSubtitle && (
							<div
								className={ clsx( 'live-ai-assistant__subtitle', { isActive: isSessionActive } ) }
								aria-live="polite"
							>
								{ statusContent }
							</div>
						) }

						{ status === 'idle' && timelineRows.length === 0 && (
							<div className="live-ai-assistant__intro">
								<video
									className="live-ai-assistant__intro-artwork"
									src={ introArtworkUrl }
									aria-hidden="true"
									autoPlay
									loop
									muted
									playsInline
									preload="metadata"
								/>
								<h3>{ __( 'Sit back and dictate' ) }</h3>
								<p>
									{ __(
										'Tap Start dictation and speak naturally. This is more than a dictation tool: it gives you full voice control of the editor. Format text, insert pictures, manipulate any available block, and even save the post.'
									) }
								</p>
							</div>
						) }

						{ error && (
							<Notice.Root intent="error">
								<Notice.Title>{ __( 'Error' ) }</Notice.Title>
								<Notice.Description>{ error }</Notice.Description>
							</Notice.Root>
						) }

						{ timelineRows.length > 0 && (
							<div className="live-ai-assistant__transcript">
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
												'is-running': row.evt.status === 'running',
											} ) }
										>
											<span className="live-ai-assistant__transcript-tool-dot" aria-hidden="true" />
											<span className="live-ai-assistant__transcript-tool-label">
												{ row.evt.label }
											</span>
										</div>
									)
								) }
							</div>
						) }
					</div>

					<div className="live-ai-assistant__footer">
						<Notice.Root intent="info">
							<Notice.Title>Beta feature</Notice.Title>
							<Notice.Description>Only available for proxied a11ns</Notice.Description>
							<Notice.Actions>
								<Notice.ActionLink href="https://wp.me/phcsdm-3kj" openInNewTab>
									Share feedback
								</Notice.ActionLink>
							</Notice.Actions>
						</Notice.Root>
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
				</div>
			</div>
			<ImagePickerModal state={ imagePickerState } />
			<DictationFileUpload />
		</>
	);
}

export default LiveAIAssistant;
