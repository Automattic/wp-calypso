/**
 * Reader Chat Entry Point
 *
 * Loads the Agents Manager chat UI for blog readers (logged-out visitors).
 * Reads config from window.JetpackReaderChatConfig, mounts to #jetpack-reader-chat.
 *
 * IMPORTANT: This bundle is built without DependencyExtractionWebpackPlugin so
 * React, @wordpress/data, and all other WP packages are bundled inline. This
 * makes it safe to load on the frontend where WordPress's script loader is absent.
 */

import './config';
import AgentsManager, { AGENTS_MANAGER_STORE } from '@automattic/agents-manager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { dispatch, select, subscribe } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { createRoot } from 'react-dom/client';

/**
 * Push a Tracks event onto the global _tkq queue.
 *
 * Equivalent to @automattic/calypso-analytics' recordTracksEvent but
 * without the 23MB of transitive deps (getCurrentUser, super-props,
 * tracking prefs, event-name validation, etc.) that would bloat this
 * public-facing blog bundle. The queue is drained by stats.js / the
 * Tracks library if/when it loads on the page — and on blogs where
 * it doesn't load, events simply stay queued with no ill effect.
 *
 * @param {string} eventName Must start with an allowed source prefix
 *                           (e.g. 'jetpack_...') to be accepted by Tracks.
 * @param {Object} [props]   Flat property bag. Nested objects are not
 *                           supported by Tracks — keep values scalar.
 */
function recordTracksEvent( eventName, props ) {
	if ( typeof window === 'undefined' ) {
		return;
	}
	window._tkq = window._tkq || [];
	window._tkq.push( [ 'recordEvent', eventName, props || {} ] );
}

const queryClient = new QueryClient();

/**
 * Reset inherited styles from the host theme. Blog themes often set a
 * serif body font that cascades into the chat UI and makes it look
 * foreign. Scoping font-family and line-height to the mount node
 * restores the AgentsManager's intended look without affecting the
 * rest of the page.
 */
function injectScopedReset() {
	if ( document.getElementById( 'jetpack-reader-chat-reset' ) ) {
		return;
	}
	const style = document.createElement( 'style' );
	style.id = 'jetpack-reader-chat-reset';
	style.textContent = `
		#jetpack-reader-chat,
		#jetpack-reader-chat *,
		.agents-manager-chat,
		.agents-manager-chat *,
		.components-popover,
		.components-popover * {
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", Arial, sans-serif !important;
		}
		/*
		 * Form controls don't inherit font-family by default — browsers
		 * apply UA styles. The * selector above is unreliable across
		 * browsers for input/textarea/button, so target them explicitly
		 * to match the display text.
		 */
		#jetpack-reader-chat input,
		#jetpack-reader-chat textarea,
		#jetpack-reader-chat button,
		.agents-manager-chat input,
		.agents-manager-chat textarea,
		.agents-manager-chat button {
			font-family: inherit !important;
			font-size: inherit !important;
		}
		/*
		 * Themes often give inputs/textareas thick borders that leak
		 * into the chat composer. Reset them to let the AgentsManager's
		 * own focus ring show through.
		 */
		#jetpack-reader-chat input,
		#jetpack-reader-chat textarea,
		.agents-manager-chat input,
		.agents-manager-chat textarea {
			border: 0 !important;
			outline: 0 !important;
			box-shadow: none !important;
			background: transparent !important;
		}
		#jetpack-reader-chat,
		.agents-manager-chat {
			line-height: 1.5 !important;
			color: #1e1e1e !important;
		}
		/*
		 * wp-components dropdown/menu fix: the popover is portalled to body
		 * and the theme's global CSS doesn't always include the full
		 * components-dropdown-menu rules. Items default to display: inline-block
		 * via .components-button and end up flowing horizontally. Force them
		 * block and give the menu a usable layout.
		 */
		/*
		 * Popover itself has z-index: auto by default — sits behind the
		 * chat container's stacking context. Force it above everything
		 * so the menu is actually visible when opened.
		 */
		.components-popover {
			z-index: 2147483647 !important;
		}
		.components-dropdown-menu__menu {
			display: flex !important;
			flex-direction: column !important;
			min-width: 200px !important;
			padding: 4px !important;
			background: #ffffff !important;
			border: 1px solid #dddddd !important;
			border-radius: 4px !important;
			box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
		}
		.components-dropdown-menu__menu-item {
			display: flex !important;
			align-items: center !important;
			gap: 8px !important;
			width: 100% !important;
			padding: 8px 12px !important;
			background: transparent !important;
			border: 0 !important;
			text-align: left !important;
			cursor: pointer !important;
		}
		.components-dropdown-menu__menu-item:hover {
			background: #f0f0f0 !important;
		}
		.components-dropdown-menu__menu-item[aria-disabled="true"] {
			opacity: 0.5 !important;
			cursor: default !important;
		}
		/*
		 * Move reader-chat launcher and panel to the bottom-left.
		 * Default agents-manager positioning is bottom-right (see
		 * packages/agents-manager/src/components/agent-dock/style.scss).
		 * Reader-chat is opt-in per-blog so the FAB sits in the reader's
		 * lower-left to avoid clashing with the host theme's floating
		 * widgets (share buttons, cookie banners) that almost always
		 * anchor to the bottom-right.
		 */
		.agents-manager-sidebar-fab {
			left: 16px !important;
			right: auto !important;
		}

	`;
	document.head.appendChild( style );
}

// Read config injected by PHP.
const readerConfig = window.JetpackReaderChatConfig || {};
const readerAgentId = readerConfig.agentId || 'reader-chat';

// Set agentId for useAgentConfig() to pick up via agentsManagerData global.
window.agentsManagerData = window.agentsManagerData || {};
window.agentsManagerData.agentId = readerAgentId;

// Expose page context on the global so the default context provider
// and agent hooks can read it. The AgentsManager default context
// provider sends window.location info; we augment with post-level data.
window.agentsManagerData.currentPost = readerConfig.currentPost || null;
window.agentsManagerData.siteName = readerConfig.siteName || '';
window.agentsManagerData.siteUrl = readerConfig.siteUrl || '';

/**
 * Build fallback suggested prompts based on the current page context.
 * These appear immediately while AI-generated suggestions fetch, and
 * stay if the AI call fails.
 */
function getFallbackSuggestions() {
	const post = readerConfig.currentPost;

	if ( ! post ) {
		return [
			{
				id: 'popular',
				label: 'What are the most popular posts here?',
				prompt: 'What are the most popular posts on this blog?',
			},
			{
				id: 'about',
				label: 'What is this blog about?',
				prompt: 'What is this blog about? What topics does it cover?',
			},
			{
				id: 'recommend',
				label: 'Recommend something to read',
				prompt: 'Can you recommend a good post to read on this blog?',
			},
		];
	}

	const title = post.title || 'this post';

	return [
		{
			id: 'summarize',
			label: 'Summarize this post',
			prompt: `Can you summarize "${ title }" for me?`,
		},
		{
			id: 'explain',
			label: 'Explain something from this post',
			prompt: `Can you explain the main points of "${ title }" in simple terms?`,
		},
		{
			id: 'related',
			label: 'Find related posts',
			prompt: `What other posts on this blog are related to "${ title }"?`,
		},
	];
}

const SUGGESTIONS_ENDPOINT =
	'https://public-api.wordpress.com/wpcom/v2/ai/agent/reader-chat-suggestions';
const SUGGESTIONS_TIMEOUT_MS = 15000;
const FOLLOWUP_DEBOUNCE_MS = 2500;
const MIN_FOLLOWUP_AGENT_TEXT_LENGTH = 40;

function createAbortController() {
	return typeof window.AbortController === 'function' ? new window.AbortController() : null;
}

function slugify( label ) {
	return String( label || '' )
		.toLowerCase()
		.replace( /[^a-z0-9]+/g, '-' )
		.replace( /^-|-$/g, '' )
		.slice( 0, 40 );
}

/**
 * Extract the assistant text from a JSON-RPC SSE response like:
 *   data: {"jsonrpc":"2.0","result":{"status":{"message":{"parts":[{"type":"text","text":"..."}]}}}}
 *
 * Returns the first "text" part content, or null if not found.
 */
function parseAgentSseResponse( raw ) {
	for ( const line of raw.split( /\r?\n/ ) ) {
		const trimmed = line.trim();
		if ( ! trimmed.startsWith( 'data:' ) ) {
			continue;
		}
		const json = trimmed.slice( 'data:'.length ).trim();
		if ( ! json || json === '[DONE]' ) {
			continue;
		}
		try {
			const payload = JSON.parse( json );
			const parts = payload?.result?.status?.message?.parts;
			if ( Array.isArray( parts ) ) {
				const textPart = parts.find( ( p ) => p?.type === 'text' && typeof p.text === 'string' );
				if ( textPart ) {
					return textPart.text;
				}
			}
		} catch {
			// skip malformed events
		}
	}
	return null;
}

/**
 * Call the reader-chat-suggestions agent with an arbitrary user message and
 * return a list of {id,label,prompt} suggestions, or null on failure.
 *
 * Both the initial contextual chips and the post-turn follow-ups use this
 * path — the only differences are the prompt text, the JSON-RPC request-id
 * prefix, and the fallback id prefix applied to normalized results.
 * @param   {Object} params                 Parameters.
 * @param   {string} params.messageText     Prose message to send to the agent.
 * @param   {string} params.requestIdPrefix JSON-RPC request id prefix (debugging aid).
 * @param   {string} params.resultIdPrefix  Prefix used when synthesizing missing ids on returned items.
 * @param   {AbortSignal} [params.signal]   Optional signal for cancelling stale requests.
 * @returns {Promise<Array|null>}           Normalized suggestions, or null on failure.
 */
async function fetchSuggestions( { messageText, requestIdPrefix, resultIdPrefix, signal } ) {
	const body = {
		jsonrpc: '2.0',
		id: `${ requestIdPrefix }-${ Date.now() }`,
		method: 'message/stream',
		params: {
			message: {
				role: 'user',
				parts: [
					{ type: 'text', text: messageText },
					{
						type: 'data',
						data: {
							clientContext: {
								post_url: readerConfig.currentPost?.url || '',
								selectedSiteId: readerConfig.siteId,
							},
						},
					},
				],
				kind: 'message',
				messageId: `msg-${ Date.now() }`,
			},
		},
		tokenStreaming: false,
	};

	if ( signal?.aborted ) {
		return null;
	}

	const controller = createAbortController();
	const timeoutId = controller
		? setTimeout( () => controller.abort(), SUGGESTIONS_TIMEOUT_MS )
		: null;
	const abortRequest = () => controller?.abort();
	signal?.addEventListener( 'abort', abortRequest, { once: true } );

	try {
		const fetchOptions = {
			method: 'POST',
			credentials: 'omit',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( body ),
		};
		if ( controller ) {
			fetchOptions.signal = controller.signal;
		}
		const response = await fetch( SUGGESTIONS_ENDPOINT, fetchOptions );
		if ( ! response.ok ) {
			return null;
		}
		// SSE response wraps a JSON-RPC result; we read the whole thing and
		// pull out the assistant message text from the first completed event.
		const text = parseAgentSseResponse( await response.text() );
		if ( ! text ) {
			return null;
		}

		const parsed = JSON.parse( text );
		const items = Array.isArray( parsed ) ? parsed : [];
		const valid = items.filter(
			( s ) => s && typeof s.label === 'string' && typeof s.prompt === 'string'
		);
		if ( valid.length === 0 ) {
			return null;
		}
		// Normalize: ensure every item has an id (stable React key).
		return valid.slice( 0, 3 ).map( ( s, i ) => ( {
			id: s.id || `${ resultIdPrefix }-${ i }-${ slugify( s.label ) }`,
			label: s.label,
			prompt: s.prompt,
		} ) );
	} catch {
		return null;
	} finally {
		if ( timeoutId ) {
			clearTimeout( timeoutId );
		}
		signal?.removeEventListener( 'abort', abortRequest );
	}
}

/**
 * Fetch AI-generated suggestions based on the current page context.
 * Falls back to static templates if the call fails or returns empty.
 *
 * Called fire-and-forget after mount — the empty view shows fallback
 * chips immediately and re-renders with AI suggestions when they arrive.
 */
function fetchAiSuggestions( signal ) {
	const post = readerConfig.currentPost;
	const siteName = readerConfig.siteName || '';
	const siteUrl = readerConfig.siteUrl || '';

	// Build the message: post-specific if we're on a singular view, site-level
	// if we're on the home/archive. The agent handles both — it just needs a
	// prose description of what the reader is looking at.
	const messageText = post?.url
		? `Context: reader is on a specific blog post.\nPost title: ${
				post.title || ''
		  }\n\nPost excerpt:\n${
				post.excerpt || ''
		  }\n\nGenerate 3 questions a reader might click to learn more ABOUT THIS POST specifically.`
		: `Context: reader is on the home/stream of a blog (no specific post selected).\nSite name: ${ siteName }\nSite URL: ${ siteUrl }\n\nGenerate 3 questions a reader might click to explore THIS BLOG overall — its topics, recent posts, or recommendations. Infer topics from the site name and URL.`;

	return fetchSuggestions( {
		messageText,
		requestIdPrefix: 'reader-suggestions',
		resultIdPrefix: 'ai-suggestion',
		signal,
	} );
}

/**
 * Fetch 2-3 follow-up questions based on the last user+agent turn.
 * Reuses the reader-chat-suggestions agent with a message shape that
 * describes the exchange and asks for follow-ups.
 */
function fetchFollowupSuggestions( userText, agentText, signal ) {
	if ( ! userText || ! agentText ) {
		return Promise.resolve( null );
	}

	const messageText = `The reader just had this exchange on a blog:

Reader asked: ${ userText }

Blog replied: ${ agentText }

Generate 2-3 follow-up questions the reader might want to ask next, based on what was discussed. Questions should feel like natural next-step curiosity — go deeper on a point, connect to a related theme, or explore an implication. Not generic.`;

	return fetchSuggestions( {
		messageText,
		requestIdPrefix: 'reader-followup',
		resultIdPrefix: 'followup',
		signal,
	} );
}

/**
 * Append a "follow-up chips" strip below the chat panel. Clicking a chip
 * fills the input and submits it. Observes the chat thread for new
 * assistant messages via MutationObserver; after each one, fires a
 * fetch for fresh follow-ups.
 */
function setupFollowupChips() {
	// Shared state the useSuggestions hook will read.
	// A MutationObserver watches the chat DOM for new assistant messages;
	// when one completes, we fetch fresh chips and dispatch an event so
	// the React hook re-renders with them.
	window.agentsManagerData = window.agentsManagerData || {};
	window.__jetpackReaderFollowupChips = [];
	window.__jetpackReaderFollowupVersion = 0;

	// Supply a useSuggestions hook that AgentsManager will pick up via the
	// host-hook path in load-external-providers. This plugs our chips into
	// the native suggestion rendering (above the input, same as the
	// orchestrator's chip strip) — no custom DOM required.
	window.agentsManagerData.useSuggestions = function useReaderFollowupSuggestions() {
		const [ chips, setChips ] = useState( window.__jetpackReaderFollowupChips || [] );
		useEffect( () => {
			const handler = () => {
				setChips( window.__jetpackReaderFollowupChips || [] );
			};
			window.addEventListener( 'reader-chat-followups-updated', handler );
			return () => window.removeEventListener( 'reader-chat-followups-updated', handler );
		}, [] );
		return { suggestions: chips };
	};

	function publish( chips ) {
		window.__jetpackReaderFollowupChips = chips || [];
		window.__jetpackReaderFollowupVersion++;
		window.dispatchEvent( new Event( 'reader-chat-followups-updated' ) );
	}

	function getLatestExchange( chat ) {
		const agentMessages = chat.querySelectorAll(
			'[data-slot="message"][data-role="agent"], [data-slot="message"][data-role="assistant"]'
		);
		const userMessages = chat.querySelectorAll( '[data-slot="message"][data-role="user"]' );
		if ( agentMessages.length === 0 || userMessages.length === 0 ) {
			return null;
		}
		const agentText = ( agentMessages[ agentMessages.length - 1 ].textContent || '' ).trim();
		const userText = ( userMessages[ userMessages.length - 1 ].textContent || '' ).trim();
		if ( agentText.length < MIN_FOLLOWUP_AGENT_TEXT_LENGTH || ! userText ) {
			return null;
		}
		return {
			agentText,
			userText,
			key: `${ userMessages.length }:${ userText }`,
		};
	}

	// Observe the chat DOM for new complete assistant messages.
	let attempts = 0;
	let retryTimer = null;
	let debounceTimer = null;
	let pendingExchangeKey = '';
	let lastPublishedExchangeKey = '';
	let followupController = null;
	let requestSeq = 0;

	function cleanup() {
		if ( retryTimer ) {
			clearTimeout( retryTimer );
		}
		if ( debounceTimer ) {
			clearTimeout( debounceTimer );
		}
		followupController?.abort();
	}

	window.addEventListener( 'pagehide', cleanup, { once: true } );

	const tryObserve = () => {
		const chat = document.querySelector( '[data-slot=conversation-view]' );
		if ( ! chat ) {
			if ( attempts++ < 60 ) {
				retryTimer = setTimeout( tryObserve, 500 );
			}
			return;
		}
		if ( chat.__followupObserving ) {
			return;
		}
		chat.__followupObserving = true;

		const observer = new window.MutationObserver( () => {
			const exchange = getLatestExchange( chat );
			if (
				! exchange ||
				exchange.key === pendingExchangeKey ||
				exchange.key === lastPublishedExchangeKey
			) {
				return;
			}

			if ( debounceTimer ) {
				clearTimeout( debounceTimer );
			}

			debounceTimer = setTimeout( async () => {
				const stableExchange = getLatestExchange( chat );
				if (
					! stableExchange ||
					stableExchange.key !== exchange.key ||
					stableExchange.agentText !== exchange.agentText ||
					stableExchange.key === pendingExchangeKey ||
					stableExchange.key === lastPublishedExchangeKey
				) {
					return;
				}

				followupController?.abort();
				const requestController = createAbortController();
				followupController = requestController;
				const requestId = ++requestSeq;
				pendingExchangeKey = stableExchange.key;
				publish( [] ); // clear while fetching

				const chips = await fetchFollowupSuggestions(
					stableExchange.userText,
					stableExchange.agentText,
					requestController?.signal
				);

				if ( requestId !== requestSeq || requestController?.signal.aborted ) {
					return;
				}

				lastPublishedExchangeKey = stableExchange.key;
				pendingExchangeKey = '';
				followupController = null;
				publish( chips || [] );
			}, FOLLOWUP_DEBOUNCE_MS );
		} );

		window.addEventListener(
			'pagehide',
			() => {
				observer.disconnect();
			},
			{ once: true }
		);

		observer.observe( chat, { childList: true, subtree: true, characterData: true } );
	};
	tryObserve();
}

function setupInitialSuggestions() {
	const controller = createAbortController();
	window.addEventListener(
		'pagehide',
		() => {
			controller?.abort();
		},
		{ once: true }
	);

	fetchAiSuggestions( controller?.signal ).then( ( aiSuggestions ) => {
		if ( controller?.signal.aborted ) {
			return;
		}
		window.agentsManagerData.readerSuggestions = aiSuggestions || getFallbackSuggestions();
		// Signal to useEmptyViewSuggestions (inside AgentsManager) that
		// the global override changed — the hook re-reads on this event
		// and triggers a state update.
		window.dispatchEvent( new Event( 'reader-chat-suggestions-updated' ) );
	} );
}

/**
 * Wire up Reader-Chat-specific Tracks events.
 *
 * Reader Chat renders through an AgentsManager portal attached to `body`, so
 * UI events do not bubble through the #jetpack-reader-chat mount node. Attach
 * document-level listeners from this public reader-chat entry instead. All
 * events use the jetpack_reader_chat_* namespace to match the Jetpack-side
 * feature.
 *
 * Three events:
 * - jetpack_reader_chat_opened: chat UI goes from closed -> open
 * - jetpack_reader_chat_suggestion_click: a prompt suggestion chip was clicked
 * - jetpack_reader_chat_message_sent: the user submitted a message
 *   (button click or Enter keypress on the composer textarea)
 *
 * All three work for anonymous readers — calypso-analytics pings the
 * public pixel endpoint with _ut=anon when no user is known.
 *
 */
function setupTracksEvents() {
	const config = window.JetpackReaderChatConfig || {};
	const baseProps = config.siteId ? { blog_id: config.siteId } : {};

	// Chat open: watch the shared store for isOpen transitioning from
	// false -> true. Fires once per open; closing + reopening re-fires.
	let wasOpen = false;
	const unsubscribe = subscribe( () => {
		const state = select( AGENTS_MANAGER_STORE ).getAgentsManagerState?.();
		const isOpen = !! state?.isOpen;
		if ( isOpen && ! wasOpen ) {
			recordTracksEvent( 'jetpack_reader_chat_opened', baseProps );
		}
		wasOpen = isOpen;
	} );

	// Suggestion click + send-button click via event delegation so we
	// don't have to patch agenttic-ui or agents-manager.
	const handleClick = ( event ) => {
		const target = event.target;
		if ( ! target || typeof target.closest !== 'function' ) {
			return;
		}
		const suggestionBtn = target.closest( '.Suggestions-module_button' );
		if ( suggestionBtn ) {
			recordTracksEvent( 'jetpack_reader_chat_suggestion_click', {
				...baseProps,
				suggestion: ( suggestionBtn.textContent || '' ).trim().slice( 0, 200 ),
			} );
			return;
		}
		const sendBtn = target.closest( '[aria-label="Send message"]' );
		if ( sendBtn && ! sendBtn.disabled ) {
			recordTracksEvent( 'jetpack_reader_chat_message_sent', {
				...baseProps,
				trigger: 'button',
			} );
		}
	};
	// Enter-to-send on the composer textarea. Shift+Enter inserts a
	// newline, plain Enter submits — match that convention.
	const handleKeydown = ( event ) => {
		if ( event.key !== 'Enter' || event.shiftKey || event.isComposing ) {
			return;
		}
		const target = event.target;
		if ( ! target || target.tagName !== 'TEXTAREA' ) {
			return;
		}
		if ( ! target.closest( '[data-slot="chat-input"]' ) ) {
			return;
		}
		if ( target.value.trim() === '' ) {
			return;
		}
		recordTracksEvent( 'jetpack_reader_chat_message_sent', {
			...baseProps,
			trigger: 'enter',
		} );
	};
	document.addEventListener( 'click', handleClick );
	document.addEventListener( 'keydown', handleKeydown );

	window.addEventListener(
		'pagehide',
		() => {
			unsubscribe?.();
			document.removeEventListener( 'click', handleClick );
			document.removeEventListener( 'keydown', handleKeydown );
		},
		{ once: true }
	);
}

function isCollapsedLauncherTarget( target, root = document ) {
	if ( ! target || typeof target.closest !== 'function' ) {
		return false;
	}

	const collapsedView = target.closest( '[data-slot="collapsed-view"]' );
	return !! collapsedView && ( ! root || root.contains( collapsedView ) );
}

function setupCollapsedLauncherPointerFallback() {
	const handleLauncherStart = ( event ) => {
		if ( ! isCollapsedLauncherTarget( event.target ) ) {
			return;
		}

		// Agenttic's draggable wrapper can prevent the later click in some
		// browsers. Open on the initial pointer/mouse/touch event so the public
		// reader launcher remains usable without changing shared AgentsManager
		// behavior.
		dispatch( AGENTS_MANAGER_STORE ).setIsOpen( true, false );
	};

	document.addEventListener( 'pointerdown', handleLauncherStart, true );
	document.addEventListener( 'mousedown', handleLauncherStart, true );
	document.addEventListener( 'touchstart', handleLauncherStart, true );

	window.addEventListener(
		'pagehide',
		() => {
			document.removeEventListener( 'pointerdown', handleLauncherStart, true );
			document.removeEventListener( 'mousedown', handleLauncherStart, true );
			document.removeEventListener( 'touchstart', handleLauncherStart, true );
		},
		{ once: true }
	);
}

function ReaderChatApp() {
	const config = window.JetpackReaderChatConfig || {};

	const site = config.siteId
		? {
				ID: config.siteId,
				URL: config.siteUrl || window.location.origin,
				name: config.siteName || '',
		  }
		: null;

	return (
		<QueryClientProvider client={ queryClient }>
			<AgentsManager
				sectionName="reader-chat"
				site={ site }
				currentSiteId={ config.siteId || undefined }
				agentId={ readerAgentId }
			/>
		</QueryClientProvider>
	);
}

const container = document.getElementById( 'jetpack-reader-chat' );
if ( container ) {
	injectScopedReset();
	setupFollowupChips();
	setupTracksEvents();
	setupCollapsedLauncherPointerFallback();

	// Reader-chat defaults the floating panel to the left side of the
	// viewport. The shared AgentsManager reducer default is 'right' (set
	// for the wp-admin sidebar use-case); logged-out readers can't
	// persist preferences to the server, so we pass shouldSave=false to
	// avoid a doomed API call. Dragging within a session still works —
	// it just won't survive a reload, which is fine for anonymous
	// visitors.
	dispatch( AGENTS_MANAGER_STORE ).setFloatingPosition( 'left', false );

	// Start with an empty override so the empty view shows no chips
	// while we fetch AI suggestions. This avoids the flash where
	// generic "Summarize this post" chips appear for a beat and then
	// get replaced with contextual ones — the user sees the contextual
	// chips appear once, or the fallback if AI fails.
	window.agentsManagerData.readerSuggestions = [];

	const root = createRoot( container );
	root.render( <ReaderChatApp /> );

	setupInitialSuggestions();
}

// Exported for unit tests only — these are pure helpers with no side effects.
export { parseAgentSseResponse, slugify, getFallbackSuggestions, isCollapsedLauncherTarget };
