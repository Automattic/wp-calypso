import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { ODIE_THUMBS_DOWN_RATING_VALUE, ODIE_THUMBS_UP_RATING_VALUE } from '../../constants';
import { useOdieAssistantContext } from '../../context';
import { useSendOdieFeedback } from '../../data';
import { ThumbsDownIcon, ThumbsUpIcon } from './thumbs-icons';
import type { Message } from '../../types';

const WasThisHelpfulButtons = ( {
	message,
	isDisliked = false,
}: {
	message: Message;
	isDisliked?: boolean;
} ) => {
	const { setMessageLikedStatus, trackEvent, setChatStatus } = useOdieAssistantContext();
	const { mutateAsync: sendOdieMessageFeedback } = useSendOdieFeedback();

	const liked = message.rating_value?.toString() === '1' || message.liked || false;
	const notLiked = message.rating_value?.toString() === '0' || message.liked === false;
	const rated =
		( message.rating_value !== null && message.rating_value !== undefined ) ||
		( message.liked !== null && message.liked !== undefined );

	const handleIsHelpful = ( isHelpful: boolean ) => {
		sendOdieMessageFeedback( {
			messageId: Number( message.message_id ),
			ratingValue: isHelpful ? ODIE_THUMBS_UP_RATING_VALUE : ODIE_THUMBS_DOWN_RATING_VALUE,
		} );

		setMessageLikedStatus( message, isHelpful );
		if ( ! isHelpful ) {
			setTimeout( () => {
				setChatStatus( 'dislike' );
			}, 1000 );
		}

		trackEvent( 'chat_message_action_feedback', {
			action: 'feedback',
			is_helpful: isHelpful,
			message_id: message.message_id,
		} );
	};

	const thumbsUpClasses = clsx( {
		'odie-feedback-component-button-icon-disabled': rated && notLiked,
		'odie-feedback-component-button-icon-pressed': rated && liked,
	} );

	const thumbsDownClasses = clsx( {
		'odie-feedback-component-button-icon-disabled': rated && liked,
		'odie-feedback-component-button-icon-pressed': rated && notLiked,
	} );

	const questionClasses = clsx( 'odie-feedback-component-question', {
		'odie-question-out': rated,
		'odie-question-hidden': rated,
	} );

	const thanksClasses = clsx( 'odie-feedback-component-thanks', {
		'odie-thanks-in': rated,
		'odie-thanks-hidden': ! rated,
	} );

	const buttonLikedClasses = clsx( 'odie-feedback-component-button', {
		'odie-feedback-component-button-liked-pressed': rated && liked,
		'odie-feedback-component-button-liked-disabled': rated && notLiked,
	} );

	const buttonDislikedClasses = clsx( 'odie-feedback-component-button', {
		'odie-feedback-component-button-disliked-pressed': rated && notLiked,
		'odie-feedback-component-button-disliked-disabled': rated && liked,
	} );

	const containerClasses = clsx( 'odie-feedback-component-container', {
		'odie-question-collapse': rated || isDisliked,
	} );

	return (
		<div className={ containerClasses }>
			<div className="odie-feedback-message">
				<span className={ questionClasses }>
					{ __( 'Was this helpful?', __i18n_text_domain__ ) }
				</span>
				<span className={ thanksClasses }>
					{ __( 'We appreciate your feedback.', __i18n_text_domain__ ) }
				</span>
			</div>
			<span className="odie-feedback-component-button-container">
				<button
					className={ buttonLikedClasses }
					onClick={ () => handleIsHelpful( true ) }
					disabled={ notLiked }
				>
					<ThumbsUpIcon className={ thumbsUpClasses } />
				</button>
				<button
					className={ buttonDislikedClasses }
					onClick={ () => handleIsHelpful( false ) }
					disabled={ liked }
				>
					<ThumbsDownIcon className={ thumbsDownClasses } />
				</button>
			</span>
		</div>
	);
};

export default WasThisHelpfulButtons;
