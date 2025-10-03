import { MessageActions, CopyIcon, ThumbsDownIcon, ThumbsUpIcon } from '@automattic/agenttic-ui';
import { Icon } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { ODIE_THUMBS_DOWN_RATING_VALUE, ODIE_THUMBS_UP_RATING_VALUE } from '../../constants';
import { useOdieAssistantContext } from '../../context';
import { useSendOdieFeedback } from '../../data';
import type { Message } from '../../types';

const BotMessageActions = ( { message }: { message: Message } ) => {
	const { setMessageLikedStatus, trackEvent } = useOdieAssistantContext();
	const { mutateAsync: sendOdieMessageFeedback } = useSendOdieFeedback();
	const [ isCopied, setIsCopied ] = useState( false );

	const liked = message.rating_value?.toString() === '1' || message.liked || false;
	const notLiked = message.rating_value?.toString() === '0' || message.liked === false;
	const rated = liked || notLiked;

	const handleIsHelpful = ( isHelpful: boolean ) => {
		sendOdieMessageFeedback( {
			messageId: Number( message.message_id ),
			ratingValue: isHelpful ? ODIE_THUMBS_UP_RATING_VALUE : ODIE_THUMBS_DOWN_RATING_VALUE,
		} );

		setMessageLikedStatus( message, isHelpful );

		trackEvent( 'chat_message_action_feedback', {
			action: 'feedback',
			is_helpful: isHelpful,
			message_id: message.message_id,
		} );
	};

	const handleCopyToClipboard = async () => {
		try {
			const messageText = typeof message.content === 'string' ? message.content : '';
			await navigator.clipboard.writeText( messageText );

			setIsCopied( true );
			setTimeout( () => {
				setIsCopied( false );
			}, 1000 );

			trackEvent( 'chat_message_action_copy', {
				action: 'copy',
				message_id: message.message_id,
			} );
		} catch ( error ) {
			// Fallback for older browsers or when clipboard API is not available
		}
	};

	const messageActions = [
		// Only show thumbs up if not already disliked
		...( notLiked
			? []
			: [
					{
						id: 'thumbs-up',
						icon: <ThumbsUpIcon />,
						label: __( 'Yes, this was helpful', __i18n_text_domain__ ),
						onClick: () => handleIsHelpful( true ),
						disabled: rated,
						pressed: rated && liked,
						tooltip: __( 'Yes, this was helpful', __i18n_text_domain__ ),
					},
			  ] ),
		// Only show thumbs down if not already liked
		...( liked
			? []
			: [
					{
						id: 'thumbs-down',
						icon: <ThumbsDownIcon />,
						label: __( 'No, this was not helpful', __i18n_text_domain__ ),
						onClick: () => handleIsHelpful( false ),
						disabled: rated,
						pressed: rated && notLiked,
						tooltip: __( 'No, this was not helpful', __i18n_text_domain__ ),
					},
			  ] ),
		{
			id: 'copy',
			icon: isCopied ? <Icon icon={ check } size={ 24 } /> : <CopyIcon />,
			label: isCopied ? __( 'Copied', __i18n_text_domain__ ) : __( 'Copy', __i18n_text_domain__ ),
			onClick: handleCopyToClipboard,
			tooltip: isCopied
				? __( 'Copied to clipboard', __i18n_text_domain__ )
				: __( 'Copy message to clipboard', __i18n_text_domain__ ),
		},
	];

	return (
		<MessageActions
			message={ {
				id: message.message_id?.toString() || '',
				role: message.role === 'bot' ? 'agent' : 'user',
				content: [
					{ type: 'text', text: typeof message.content === 'string' ? message.content : '' },
				],
				timestamp: Date.now(),
				archived: false,
				showIcon: false,
				actions: messageActions,
			} }
		/>
	);
};

export default BotMessageActions;
