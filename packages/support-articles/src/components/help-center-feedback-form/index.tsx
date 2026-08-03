import { recordTracksEvent } from '@automattic/calypso-analytics';
import { GetSupport } from '@automattic/odie-client';
import { useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { ThumbsDownIcon, ThumbsUpIcon } from '../../icons/thumbs';

declare const __i18n_text_domain__: string;

import './help-center-feedback-form.scss';

type FeedbackAnswer = 1 | 2;

const getFeedbackStorageKey = ( postId: number, userId?: number ) =>
	`help-center-article-feedback-${ userId ?? 'anonymous' }-${ postId }`;

const getStoredFeedback = ( postId: number, userId?: number ): FeedbackAnswer | null => {
	try {
		const value = window.localStorage.getItem( getFeedbackStorageKey( postId, userId ) );
		if ( value === '1' ) {
			return 1;
		}
		if ( value === '2' ) {
			return 2;
		}
		return null;
	} catch {
		return null;
	}
};

const storeFeedback = ( postId: number, value: FeedbackAnswer, userId?: number ) => {
	try {
		window.localStorage.setItem( getFeedbackStorageKey( postId, userId ), String( value ) );
	} catch {
		return;
	}
};

const HelpCenterFeedbackForm = ( {
	postId,
	userId,
	isEligibleForChat,
	forceEmailSupport,
}: {
	postId: number;
	userId?: number;
	isEligibleForChat: boolean;
	forceEmailSupport: boolean;
} ) => {
	const { __ } = useI18n();
	const [ answerValue, setAnswerValue ] = useState< FeedbackAnswer | null >( () =>
		getStoredFeedback( postId, userId )
	);

	const { data: canConnectToZendesk } = useCanConnectToZendeskMessaging();

	const handleFeedbackClick = ( value: FeedbackAnswer ) => {
		const storedFeedback = getStoredFeedback( postId, userId );
		if ( storedFeedback !== null ) {
			setAnswerValue( storedFeedback );
			return;
		}

		setAnswerValue( value );
		storeFeedback( postId, value, userId );

		recordTracksEvent( 'calypso_inlinehelp_article_feedback_click', {
			did_the_article_help: value === 1 ? 'yes' : 'no',
			post_id: postId,
		} );
	};

	const FeedbackButtons = () => {
		return (
			<>
				<p>{ __( 'Was this helpful?', __i18n_text_domain__ ) }</p>
				<div className="help-center-feedback-form__buttons">
					<button
						// 1 is used as `yes` in crowdsignal as well, do not change
						onClick={ () => handleFeedbackClick( 1 ) }
					>
						{ __( 'Yes' ) } <ThumbsUpIcon />
					</button>
					<button
						// 2 is used as `no` in crowdsignal as well, do not change
						onClick={ () => handleFeedbackClick( 2 ) }
					>
						{ __( 'No' ) } <ThumbsDownIcon />
					</button>
				</div>
			</>
		);
	};

	const handleContactSupportClick = async ( destination: string ) => {
		recordTracksEvent( 'calypso_odie_chat_get_support', {
			location: 'article-feedback',
			destination,
			is_user_eligible: isEligibleForChat,
		} );
	};

	return (
		<div className="help-center-feedback__form">
			{ answerValue === null && <FeedbackButtons /> }
			{ answerValue === 1 && <p>{ __( 'Great! Thanks.', __i18n_text_domain__ ) }</p> }
			{ answerValue === 2 && (
				<>
					<div className="odie-chatbox-dislike-feedback-message">
						<p>
							{ __(
								'Would you like to get support? Select an option below:',
								__i18n_text_domain__
							) }
						</p>
					</div>
					<GetSupport
						onClickAdditionalEvent={ handleContactSupportClick }
						isUserEligibleForPaidSupport={ isEligibleForChat }
						canConnectToZendesk={ canConnectToZendesk }
						forceEmailSupport={ forceEmailSupport }
						forceAIConversation
					/>
				</>
			) }
		</div>
	);
};

export default HelpCenterFeedbackForm;
