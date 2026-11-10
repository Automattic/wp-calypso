import { useGetSupportInteractions } from './use-get-support-interactions';

/**
 * Whether the user has a human support chat that is still open.
 * Users with one can always get back to it, even without paid support:
 * a free user who reached a human from checkout must still see the reply after a page reload.
 * @returns Whether one of the user's Zendesk support interactions is open, and whether that's still loading.
 */
export const useHasOpenZendeskChat = () => {
	const { data: zendeskInteractions, isLoading } = useGetSupportInteractions( 'zendesk' );

	return {
		hasOpenZendeskChat: !! zendeskInteractions?.some(
			( interaction ) => interaction.status === 'open'
		),
		isLoading,
	};
};
