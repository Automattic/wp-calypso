import { HelpCenterSelect, HelpCenter } from '@automattic/data-stores';
import { useGetSupportInteractions } from '@automattic/odie-client/src/data';
import { useSelect } from '@wordpress/data';
import Smooch from 'smooch';

const HELP_CENTER_STORE = HelpCenter.register();

export const useGetMostRecentOpenConversation = () => {
	let supportInteractionId = null;
	let totalNumberOfConversations = 0;

	const { isChatLoaded } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			isChatLoaded: store.getIsChatLoaded(),
		};
	}, [] );

	const { data: supportInteractionsResolved, isLoading: isLoadingResolvedInteractions } =
		useGetSupportInteractions( 'zendesk', 100, 'resolved' );

	const { data: supportInteractionsOpen, isLoading: isLoadingOpenInteractions } =
		useGetSupportInteractions( 'zendesk', 10, 'open' );

	const isLoadingInteractions = isLoadingResolvedInteractions || isLoadingOpenInteractions;

	if ( isChatLoaded && ! isLoadingInteractions ) {
		const allConversations = Smooch?.getConversations?.() ?? [];
		const supportInteractions = [
			...( supportInteractionsResolved || [] ),
			...( supportInteractionsOpen || [] ),
		];

		const filteredConversations = allConversations.filter( ( conversation ) =>
			supportInteractions.some(
				( interaction ) => interaction.uuid === conversation.metadata?.supportInteractionId
			)
		);

		const sortedConversations = filteredConversations.sort( ( conversationA, conversationB ) => {
			const aCreatedAt = conversationA?.metadata?.createdAt;
			const bCreatedAt = conversationB?.metadata?.createdAt;
			if (
				aCreatedAt &&
				bCreatedAt &&
				typeof aCreatedAt === 'number' &&
				typeof bCreatedAt === 'number'
			) {
				return new Date( bCreatedAt ).getTime() - new Date( aCreatedAt ).getTime();
			}
			return 0;
		} );

		if ( sortedConversations?.length > 0 ) {
			supportInteractionId =
				sortedConversations.length === 1
					? sortedConversations[ 0 ]?.metadata?.supportInteractionId
					: null;
			totalNumberOfConversations = sortedConversations.length;
		}
	}
	return { supportInteractionId, totalNumberOfConversations };
};
