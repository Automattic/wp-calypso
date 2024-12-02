function ignoreFatalsForSessionStorage( callback: () => unknown ) {
	try {
		return callback();
	} catch {
		// Do nothing.
		return undefined;
	}
}

export const setHelpCenterZendeskConversationStarted = () =>
	ignoreFatalsForSessionStorage(
		() =>
			sessionStorage?.setItem(
				'help_center_zendesk_conversation_started',
				performance.now().toString()
			)
	);

export const getHelpCenterZendeskConversationStarted = () =>
	ignoreFatalsForSessionStorage(
		() => sessionStorage?.getItem( 'help_center_zendesk_conversation_started' )
	);

export const clearHelpCenterZendeskConversationStarted = () =>
	ignoreFatalsForSessionStorage(
		() => sessionStorage?.removeItem( 'help_center_zendesk_conversation_started' )
	);

export const getHelpCenterZendeskConversationStartedElapsedTime = () => {
	const startTime = getHelpCenterZendeskConversationStarted();

	if ( startTime == null ) {
		return null;
	}

	clearHelpCenterZendeskConversationStarted();

	return Math.floor( performance.now() - ( startTime as number ) );
};
