import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { noop, useOdieAssistantContext } from '../context';
import { useOdieSendMessageFeedback } from '../query';
import { ThumbsDownIcon, ThumbsUpIcon } from './thumbs-icons';
import type { Message } from '../types';

import './style.scss';

const WasThisHelpfulButtons = ( {
	message,
	onDislike = noop,
}: {
	message: Message;
	onDislike?: () => void;
} ) => {
	const THUMBS_DOWN_RATING_VALUE = 2;
	const THUMBS_UP_RATING_VALUE = 4;

	const translate = useTranslate();
	const { setMessageLikedStatus } = useOdieAssistantContext();
	const { mutateAsync: sendOdieMessageFeedback } = useOdieSendMessageFeedback();

	const liked = message.liked === true;
	const disliked = message.liked === false;
	const rated = message.liked !== null && message.liked !== undefined;

	const handleIsHelpful = ( isHelpful: boolean ) => {
		sendOdieMessageFeedback( {
			message,
			rating_value: isHelpful ? THUMBS_UP_RATING_VALUE : THUMBS_DOWN_RATING_VALUE,
		} );
		setMessageLikedStatus( message, isHelpful );
		if ( ! isHelpful ) {
			onDislike();
		}
	};

	const thumbsUpClasses = classnames( {
		'odie-feedback-component-button-icon-disabled': rated && disliked,
		'odie-feedback-component-button-icon-pressed': rated && liked,
	} );

	const thumbsDownClasses = classnames( {
		'odie-feedback-component-button-icon-disabled': rated && liked,
		'odie-feedback-component-button-icon-pressed': rated && disliked,
	} );

	const questionClasses = classnames( 'odie-feedback-component-question', {
		'odie-question-out': rated,
		'odie-question-hidden': rated,
	} );

	const thanksClasses = classnames( 'odie-feedback-component-thanks', {
		'odie-thanks-in': rated,
		'odie-thanks-hidden': ! rated,
	} );

	const buttonLikedClasses = classnames( 'odie-feedback-component-button', {
		'odie-feedback-component-button-liked-pressed': rated && liked,
		'odie-feedback-component-button-liked-disabled': rated && disliked,
	} );

	const buttonDislikedClasses = classnames( 'odie-feedback-component-button', {
		'odie-feedback-component-button-disliked-pressed': rated && disliked,
		'odie-feedback-component-button-disliked-disabled': rated && liked,
	} );

	const containerClasses = classnames( 'odie-feedback-component-container', {
		'odie-question-collapse': rated,
	} );

	return (
		<div className={ containerClasses }>
			<div className="odie-feedback-message">
				<span className={ questionClasses }>
					{ translate( 'Was this helpful?', {
						context: 'Indicates if a messaged provided by a chatbot was helpful or not',
					} ) }
				</span>
				<span className={ thanksClasses }>
					{ translate( 'Thanks!', {
						context: 'Indicates that the user has provided feedback to a chatbot message',
					} ) }
				</span>
			</div>
			<span className="odie-feedback-component-button-container">
				<button
					className={ buttonLikedClasses }
					onClick={ () => handleIsHelpful( true ) }
					disabled={ disliked }
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
