interface StaleChatUiOptions {
	/** The index of the message that shows the UI. */
	messageIndex: number;
	latestUserMessageIndex: number;
	/** The page the UI was built for, if any. */
	postId?: number | string;
	/** The page the editor has open, if any. */
	currentPostId?: number | string;
}

/**
 * Whether UI an agent showed in the chat, such as a picker, is stale: the user has replied past
 * it, or the editor has another page open than the one it was built for. Stale UI stays visible
 * as a record of a previous step, but can't be used.
 */
export function isChatUiStale( {
	messageIndex,
	latestUserMessageIndex,
	postId,
	currentPostId,
}: StaleChatUiOptions ): boolean {
	const hasUserReplied = latestUserMessageIndex > messageIndex;

	// Cached conversations stay open when the site editor moves to another page.
	const isPageChanged =
		!! postId && !! currentPostId && String( postId ) !== String( currentPostId );

	return hasUserReplied || isPageChanged;
}
