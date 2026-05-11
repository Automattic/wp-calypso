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
const readerSiteId = normalizeReaderSiteId( readerConfig.siteId );
const readerCurrentPost = getReaderCurrentPost( readerConfig );

// Set agentId for useAgentConfig() to pick up via agentsManagerData global.
window.agentsManagerData = window.agentsManagerData || {};
window.agentsManagerData.agentId = readerAgentId;
window.agentsManagerData.siteId = readerSiteId;
window.agentsManagerData.emptyViewHeading = getReaderEmptyViewHeading( readerConfig );

// Expose page context on the global so the default context provider
// and agent hooks can read it. The AgentsManager default context
// provider sends window.location info; we augment with post-level data.
window.agentsManagerData.currentPost = readerCurrentPost;
window.agentsManagerData.siteName = readerConfig.siteName || '';
window.agentsManagerData.siteUrl = readerConfig.siteUrl || '';

/**
 * Build fallback suggested prompts based on the current page context.
 * These appear immediately while AI-generated suggestions fetch, and
 * stay if the AI call fails.
 */
function getFallbackSuggestions() {
	const post = readerCurrentPost;

	if ( ! post ) {
		return [
			{
				id: 'recent',
				label: 'Explore recent posts',
				prompt: 'What recent posts can I read on this blog?',
			},
			{
				id: 'about',
				label: 'Learn about this blog',
				prompt: 'What is this blog about? What topics does it cover?',
			},
			{
				id: 'recommend',
				label: 'Recommend a post',
				prompt: 'Can you recommend a good post to read on this blog?',
			},
		];
	}

	const title = decodeHtmlEntities( post.title || 'this post' );

	return [
		{
			id: 'takeaway',
			label: 'Main takeaway',
			prompt: `What is the main takeaway from "${ title }"?`,
		},
		{
			id: 'details',
			label: 'Key details',
			prompt: `What details from "${ title }" are most important?`,
		},
		{
			id: 'context',
			label: 'Related context',
			prompt: `What related ideas or posts help explain "${ title }"?`,
		},
	];
}

const SUGGESTIONS_ENDPOINT =
	'https://public-api.wordpress.com/wpcom/v2/ai/agent/reader-chat-suggestions';
const SUGGESTIONS_TIMEOUT_MS = 15000;
const FOLLOWUP_DEBOUNCE_MS = 2500;
const MIN_FOLLOWUP_AGENT_TEXT_LENGTH = 40;
const MAX_SUGGESTION_LABEL_LENGTH = 48;
const MAX_SUGGESTION_LABEL_WORDS = 7;
const POST_FALLBACK_LABELS = [ 'Main takeaway', 'Key details', 'Related context' ];
const BLOG_FALLBACK_LABELS = [
	'Explore recent posts',
	'Learn about this blog',
	'Recommend a post',
];
const FOLLOWUP_FALLBACK_LABELS = [ 'Go deeper', 'Learn more', 'Ask a follow-up' ];

function normalizeReaderSiteId( siteId ) {
	const numericSiteId = Number( siteId );
	return Number.isFinite( numericSiteId ) && numericSiteId > 0 ? numericSiteId : undefined;
}

function decodeHtmlEntities( text ) {
	if ( typeof document === 'undefined' ) {
		return String( text || '' );
	}
	const textarea = document.createElement( 'textarea' );
	textarea.innerHTML = String( text || '' );
	return textarea.value.replace( /\u00a0/g, ' ' );
}

function normalizeReaderUrl( url ) {
	try {
		const parsed = new URL( url );
		return `${ parsed.origin }${ parsed.pathname }`.replace( /\/+$/, '' );
	} catch {
		return String( url || '' ).replace( /\/+$/, '' );
	}
}

function getReaderCurrentPost( config ) {
	const post = config?.currentPost || null;
	if ( ! post ) {
		return null;
	}

	const postUrl = normalizeReaderUrl( post.url );
	const siteUrl = normalizeReaderUrl( config?.siteUrl );

	return postUrl && siteUrl && postUrl === siteUrl ? null : post;
}

function getReaderEmptyViewHeading( config ) {
	return getReaderCurrentPost( config )
		? 'Ask me anything about this post.'
		: 'Ask me anything about this blog.';
}

function getReaderClientContext( currentPost = readerCurrentPost, siteId = readerSiteId ) {
	return {
		...( siteId ? { selectedSiteId: siteId } : {} ),
		...( currentPost ? { currentPost } : {} ),
	};
}

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

function parseSuggestionsResponse( text ) {
	const unfenced = String( text || '' )
		.trim()
		.replace( /^```(?:json)?\s*/i, '' )
		.replace( /\s*```$/i, '' )
		.trim();

	try {
		return JSON.parse( unfenced );
	} catch {
		const start = unfenced.indexOf( '[' );
		const end = unfenced.lastIndexOf( ']' );
		if ( start === -1 || end <= start ) {
			return null;
		}
		try {
			return JSON.parse( unfenced.slice( start, end + 1 ) );
		} catch {
			return null;
		}
	}
}

function isConciseSuggestionLabel( label ) {
	if ( ! label ) {
		return false;
	}
	return (
		label.length <= MAX_SUGGESTION_LABEL_LENGTH &&
		label.split( /\s+/ ).length <= MAX_SUGGESTION_LABEL_WORDS
	);
}

function getFallbackSuggestionLabel( index, resultIdPrefix ) {
	if ( resultIdPrefix === 'followup' ) {
		return FOLLOWUP_FALLBACK_LABELS[ index ] || 'Ask a follow-up';
	}
	const labels = readerCurrentPost ? POST_FALLBACK_LABELS : BLOG_FALLBACK_LABELS;
	return labels[ index ] || ( readerCurrentPost ? 'Ask about this post' : 'Explore this blog' );
}

function normalizeSuggestions( items, resultIdPrefix ) {
	const valid = ( Array.isArray( items ) ? items : [] ).filter(
		( s ) => s && typeof s.label === 'string' && typeof s.prompt === 'string'
	);
	if ( valid.length === 0 ) {
		return null;
	}
	return valid.slice( 0, 3 ).map( ( s, i ) => {
		const prompt = decodeHtmlEntities( s.prompt ).trim();
		const labelCandidate = decodeHtmlEntities( s.label ).trim();
		const label = isConciseSuggestionLabel( labelCandidate )
			? labelCandidate
			: getFallbackSuggestionLabel( i, resultIdPrefix );
		return {
			id: s.id || `${ resultIdPrefix }-${ i }-${ slugify( prompt ) }`,
			label,
			prompt,
		};
	} );
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
							clientContext: getReaderClientContext(),
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

		const parsed = parseSuggestionsResponse( text );
		const suggestions = normalizeSuggestions( parsed, resultIdPrefix );
		if ( ! suggestions ) {
			return null;
		}
		return suggestions;
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
	const post = readerCurrentPost;
	const siteName = readerConfig.siteName || '';
	const siteUrl = readerConfig.siteUrl || '';
	const postTitle = decodeHtmlEntities( post?.title || '' );
	const postExcerpt = decodeHtmlEntities( post?.excerpt || '' );

	// Build the message: post-specific if we're on a singular view, site-level
	// if we're on the home/archive. The agent handles both — it just needs a
	// prose description of what the reader is looking at.
	const messageText = post?.url
		? `Context: a reader is on a specific blog post.
Post title: ${ postTitle }

Post excerpt:
${ postExcerpt }

Return only a JSON array of exactly 3 objects, with no markdown or commentary.
Each object must have:
- "label": short chip text, 2-5 words, max 48 characters. Prefer a specific reader question; question marks are okay.
- "prompt": a full question for the blog assistant to answer.

Generate questions a reader might click to learn more ABOUT THIS POST specifically.
Use concrete details from the title or excerpt when possible.
Avoid generic labels like "Summarize this post", "Explain this post", or "Find related posts".
Do not ask the author personal interview questions.
Do not address the author as "you" or "your".
Phrase prompts around "this post", "the post", "the author", or the topic discussed.`
		: `Context: a reader is on the home/stream of a blog (no specific post selected).
Site name: ${ siteName }
Site URL: ${ siteUrl }

Return only a JSON array of exactly 3 objects, with no markdown or commentary.
Each object must have:
- "label": short chip text, 2-5 words, max 48 characters. Question marks are okay.
- "prompt": a full question for the blog assistant to answer.

Generate questions a reader might click to explore THIS BLOG overall: its topics, recent posts, or recommendations.
Do not ask the site owner personal interview questions.
Do not address the site owner as "you" or "your".`;

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

Return only a JSON array of 2-3 objects, with no markdown or commentary. Each object must have "label" and "prompt" strings.
Labels must be short chip text, 2-5 words, max 48 characters. Question marks are okay.
Generate follow-up questions the reader might want to ask next, based only on the reader's question and the blog reply above.
Anchor every question in a concrete detail, place, person, phrase, or theme from the reply.
Do not ask for broad advice, outside recommendations, popularity, traffic, trends, or facts not implied by the reply.
Do not ask the author/site owner personal interview questions or address them as "you".
Questions should feel like natural next-step curiosity: clarify a detail, go deeper on a named point, or ask how two details connect.`;

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
	let debounceTimer = null;
	let pendingExchangeKey = '';
	let lastPublishedExchangeKey = '';
	let followupController = null;
	let requestSeq = 0;
	let observedChat = null;
	let chatObserver = null;
	let pageObserver = null;
	let unsubscribeOpen = null;
	let observeScheduled = false;

	function cleanup() {
		if ( debounceTimer ) {
			clearTimeout( debounceTimer );
		}
		followupController?.abort();
		chatObserver?.disconnect();
		pageObserver?.disconnect();
		unsubscribeOpen?.();
	}

	window.addEventListener( 'pagehide', cleanup, { once: true } );

	const handleChatMutation = () => {
		const exchange = getLatestExchange( observedChat );
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
			const stableExchange = getLatestExchange( observedChat );
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
				pendingExchangeKey = '';
				followupController = null;
				return;
			}

			lastPublishedExchangeKey = stableExchange.key;
			pendingExchangeKey = '';
			followupController = null;
			publish( chips || [] );
		}, FOLLOWUP_DEBOUNCE_MS );
	};

	function attachToChat( chat ) {
		if ( ! chat || chat === observedChat ) {
			return;
		}

		chatObserver?.disconnect();
		observedChat = chat;
		chatObserver = new window.MutationObserver( handleChatMutation );
		chatObserver.observe( chat, { childList: true, subtree: true, characterData: true } );
	}

	function tryObserve() {
		const chat = document.querySelector( '[data-slot=conversation-view]' );
		if ( chat ) {
			attachToChat( chat );
			return;
		}

		if ( observedChat && document.body && ! document.body.contains( observedChat ) ) {
			chatObserver?.disconnect();
			chatObserver = null;
			observedChat = null;
		}
	}

	function scheduleObserve() {
		if ( observeScheduled ) {
			return;
		}
		observeScheduled = true;
		const run = () => {
			observeScheduled = false;
			tryObserve();
		};
		if ( typeof window.requestAnimationFrame === 'function' ) {
			window.requestAnimationFrame( run );
		} else {
			setTimeout( run, 0 );
		}
	}

	if ( document.body ) {
		pageObserver = new window.MutationObserver( scheduleObserve );
		pageObserver.observe( document.body, { childList: true, subtree: true } );
	}

	unsubscribeOpen = subscribe( () => {
		const state = select( AGENTS_MANAGER_STORE ).getAgentsManagerState?.();
		if ( state?.isOpen ) {
			scheduleObserve();
		}
	} );

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

	const site = readerSiteId
		? {
				ID: readerSiteId,
				URL: config.siteUrl || window.location.origin,
				name: config.siteName || '',
		  }
		: null;

	return (
		<QueryClientProvider client={ queryClient }>
			<AgentsManager
				sectionName="reader-chat"
				site={ site }
				currentSiteId={ readerSiteId }
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
export {
	parseAgentSseResponse,
	slugify,
	getFallbackSuggestions,
	isCollapsedLauncherTarget,
	normalizeReaderSiteId,
	decodeHtmlEntities,
	getReaderEmptyViewHeading,
	getReaderClientContext,
	normalizeSuggestions,
	parseSuggestionsResponse,
};
