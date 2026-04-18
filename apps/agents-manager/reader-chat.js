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

	// No post context (stream views) or no site = skip AI call.
	if ( ! post?.url || ! siteId ) {
		return null;
	}

	const endpoint = `https://public-api.wordpress.com/wp/v2/sites/${ siteId }/wp-abilities/v1/abilities/jetpack/suggest-reader-questions/run`;

	try {
		const response = await fetch( endpoint, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( { input: { post_url: post.url } } ),
		} );

		if ( ! response.ok ) {
			return null;
		}

		const body = await response.json();
		const suggestions = Array.isArray( body ) ? body : body?.data;

		if ( ! Array.isArray( suggestions ) || suggestions.length === 0 ) {
			return null;
		}

		// Validate shape before returning — bad payloads should not crash
		// the empty-view renderer.
		const valid = suggestions.filter(
			( s ) => s && typeof s.label === 'string' && typeof s.prompt === 'string'
		);

		return valid.length > 0 ? valid : null;
	} catch {
		return null;
	}
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
	// Paint immediately with fallback suggestions — the chat UI never waits
	// on the AI suggestion call.
	window.agentsManagerData.readerSuggestions = getFallbackSuggestions();

	const root = createRoot( container );
	root.render( <ReaderChatApp /> );

	// When AI suggestions arrive, swap them in and re-render so the empty
	// view picks up the new chips. Failures or null responses leave the
	// fallback in place.
	fetchAiSuggestions().then( ( aiSuggestions ) => {
		if ( aiSuggestions ) {
			window.agentsManagerData.readerSuggestions = aiSuggestions;
			root.render( <ReaderChatApp /> );
		}
	} );
}
