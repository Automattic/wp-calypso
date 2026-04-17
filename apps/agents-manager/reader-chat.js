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
 * Build suggested prompts based on the current page context.
 * These appear in the empty chat view.
 */
function getReaderSuggestions() {
	const post = readerConfig.currentPost;

	if ( ! post ) {
		// On non-singular pages (home, archive), show general suggestions.
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

	// On a specific post, tailor suggestions to its content.
	const title = post.title || 'this post';

	return [
		{
			id: 'summarize',
			label: `Summarize this post`,
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
	// Inject suggestions into agentsManagerData for the empty view.
	window.agentsManagerData.readerSuggestions = getReaderSuggestions();

	createRoot( container ).render( <ReaderChatApp /> );
}
