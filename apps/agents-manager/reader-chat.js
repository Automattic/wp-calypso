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
import AgentsManager from '@automattic/agents-manager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';

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
		.agents-manager-chat * {
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", Arial, sans-serif !important;
		}
		#jetpack-reader-chat,
		.agents-manager-chat {
			line-height: 1.5 !important;
			color: #1e1e1e !important;
		}
	`;
	document.head.appendChild( style );
}

// Read config injected by PHP.
const readerConfig = window.JetpackReaderChatConfig || {};

// Set agentId for useAgentConfig() to pick up via agentsManagerData global.
if ( readerConfig.agentId ) {
	window.agentsManagerData = window.agentsManagerData || {};
	window.agentsManagerData.agentId = readerConfig.agentId;
}

// Expose page context on the global so the default context provider
// and agent hooks can read it. The AgentsManager default context
// provider sends window.location info; we augment with post-level data.
window.agentsManagerData = window.agentsManagerData || {};
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

/**
 * Fetch AI-generated suggestions from the jetpack/suggest-reader-questions
 * ability. Falls back to static templates if the call fails or returns
 * empty.
 *
 * Called fire-and-forget after mount — the empty view shows fallback
 * chips immediately and re-renders with AI suggestions when they arrive.
 */
async function fetchAiSuggestions() {
	const post = readerConfig.currentPost;
	const siteId = readerConfig.siteId;

	// No post context (stream views) = skip AI call.
	if ( ! post?.url ) {
		return null;
	}

	// Call the dedicated reader-chat-suggestions agent. The /wpcom/v2/ai/agent
	// endpoint isn't site-specific, so it routes directly to wpcom without
	// going through jetpack-bridge — works on wpcom-native AND Jetpack sites.
	const endpoint = 'https://public-api.wordpress.com/wpcom/v2/ai/agent/reader-chat-suggestions';

	const messageText = `Post title: ${ post.title || '' }\n\nExcerpt: ${ post.excerpt || '' }`;

	const body = {
		jsonrpc: '2.0',
		id: `reader-suggestions-${ Date.now() }`,
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
								post_url: post.url,
								selectedSiteId: siteId,
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

	try {
		const response = await fetch( endpoint, {
			method: 'POST',
			credentials: 'omit',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( body ),
		} );

		if ( ! response.ok ) {
			return null;
		}

		// SSE response wraps a JSON-RPC result; we read the whole thing and
		// pull out the assistant message text from the first completed event.
		const raw = await response.text();
		const text = parseAgentSseResponse( raw );
		if ( ! text ) {
			return null;
		}

		const suggestions = JSON.parse( text );
		if ( ! Array.isArray( suggestions ) || suggestions.length === 0 ) {
			return null;
		}

		const valid = suggestions.filter(
			( s ) => s && typeof s.label === 'string' && typeof s.prompt === 'string'
		);
		if ( valid.length === 0 ) {
			return null;
		}

		// Normalize: ensure every item has an id (stable React key).
		return valid.slice( 0, 3 ).map( ( s, i ) => ( {
			id: s.id || `ai-suggestion-${ i }-${ slugify( s.label ) }`,
			label: s.label,
			prompt: s.prompt,
		} ) );
	} catch {
		return null;
	}
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

function slugify( label ) {
	return String( label || '' )
		.toLowerCase()
		.replace( /[^a-z0-9]+/g, '-' )
		.replace( /^-|-$/g, '' )
		.slice( 0, 40 );
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
			/>
		</QueryClientProvider>
	);
}

const container = document.getElementById( 'jetpack-reader-chat' );
if ( container ) {
	injectScopedReset();

	// Start with an empty override so the empty view shows no chips
	// while we fetch AI suggestions. This avoids the flash where
	// generic "Summarize this post" chips appear for a beat and then
	// get replaced with contextual ones — the user sees the contextual
	// chips appear once, or the fallback if AI fails.
	window.agentsManagerData.readerSuggestions = [];

	const root = createRoot( container );
	root.render( <ReaderChatApp /> );

	fetchAiSuggestions().then( ( aiSuggestions ) => {
		window.agentsManagerData.readerSuggestions = aiSuggestions || getFallbackSuggestions();
		// Signal to useEmptyViewSuggestions (inside AgentsManager) that
		// the global override changed — the hook re-reads on this event
		// and triggers a state update.
		window.dispatchEvent( new Event( 'reader-chat-suggestions-updated' ) );
	} );
}
