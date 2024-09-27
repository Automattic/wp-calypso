import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { ODIE_THUMBS_DOWN_RATING_VALUE, ODIE_THUMBS_UP_RATING_VALUE } from '../../';
import { noop, useOdieAssistantContext } from '../../context';
import { useOdieSendMessageFeedback } from '../../query';
import { ThumbsDownIcon, ThumbsUpIcon } from './thumbs-icons';
import type { Message } from '../../types/';

// import './style.scss';
import './style-v2.scss';

const WasThisHelpfulButtons = ( {
	message,
	onDislike = noop,
	isDisliked = false,
}: {
	message: Message;
	onDislike?: () => void;
	isDisliked?: boolean;
} ) => {
	const { _x } = useI18n();
	const { setMessageLikedStatus, trackEvent } = useOdieAssistantContext();
	const { mutateAsync: sendOdieMessageFeedback } = useOdieSendMessageFeedback();

	const liked = message.liked === true;
	const notLiked = message.liked === false;
	const rated = message.liked !== null && message.liked !== undefined;

	const handleIsHelpful = ( isHelpful: boolean ) => {
		sendOdieMessageFeedback( {
			message,
			rating_value: isHelpful ? ODIE_THUMBS_UP_RATING_VALUE : ODIE_THUMBS_DOWN_RATING_VALUE,
		} );

		setMessageLikedStatus( message, isHelpful );
		if ( ! isHelpful ) {
			onDislike();
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
					{
						/* translators: Indicates if a messaged provided by a chatbot was helpful or not */
						_x(
							'Was this helpful?',
							'Indicates if a messaged provided by a chatbot was helpful or not',
							__i18n_text_domain__
						)
					}
				</span>
				<span className={ thanksClasses }>
					{
						/* translators: Indicates that the user has provided feedback to a chatbot message */
						_x(
							'Thanks!',
							' Indicates that the user has provided feedback to a chatbot message',
							__i18n_text_domain__
						)
					}
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
