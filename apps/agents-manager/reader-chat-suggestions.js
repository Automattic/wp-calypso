/**
 * Reader Chat Suggestions
 *
 * Builds suggested prompts for the empty chat view based on the current
 * page context (blog vs P2, stream vs single post).
 *
 * Extracted from reader-chat.js so the logic can be unit-tested
 * independently of the entry-point side-effects (window globals, createRoot).
 */

/**
 * Build suggested prompts based on the current page context.
 *
 * @param {Object}  config            - Page config (mirrors window.JetpackReaderChatConfig).
 * @param {Object}  [config.currentPost] - Post data, or null/undefined on stream views.
 * @param {boolean} [config.isP2]     - Whether the site is a P2.
 * @returns {Array<{id: string, label: string, prompt: string}>} Suggestion list.
 */
function getReaderSuggestions( config = {} ) {
	const post = config.currentPost;
	const isP2 = !! config.isP2;

	if ( isP2 ) {
		if ( ! post ) {
			return [
				{
					id: 'catch-me-up',
					label: 'Catch me up',
					prompt: 'What have been the most active discussions on this P2 this week?',
				},
				{
					id: 'action-items',
					label: 'Any open action items?',
					prompt: 'Are there any unresolved action items or open questions from recent posts?',
				},
				{
					id: 'recent-decisions',
					label: 'What was decided recently?',
					prompt: 'What decisions have been made on this P2 recently?',
				},
				{
					id: 'whos-active',
					label: "Who's been active?",
					prompt: 'Who has been posting or commenting most actively recently?',
				},
			];
		}

		const title = post.title || 'this post';
		const hasComments = ( post.commentCount || 0 ) > 0;

		return [
			{
				id: 'summarize-discussion',
				label: 'Summarize this discussion',
				prompt: hasComments
					? `Summarize "${ title }" including the key points from the comments.`
					: `Summarize the main points of "${ title }".`,
			},
			{
				id: 'key-decisions',
				label: 'What was decided?',
				prompt: `What was decided or agreed on in "${ title }"?`,
			},
			{
				id: 'whos-involved',
				label: "Who's involved?",
				prompt: `Who weighed in on "${ title }" and what were their main points?`,
			},
			{
				id: 'open-questions',
				label: 'Any open questions?',
				prompt: `Are there any open questions or unresolved threads in "${ title }"?`,
			},
		];
	}

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

module.exports = { getReaderSuggestions };
