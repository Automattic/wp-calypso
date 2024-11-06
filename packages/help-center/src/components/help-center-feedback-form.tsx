import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { getPlan } from '@automattic/calypso-products';
import { HelpCenterSite } from '@automattic/data-stores';
import { useGetOdieStorage } from '@automattic/odie-client';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { ThumbsDownIcon, ThumbsUpIcon } from '../icons/thumbs';
import HelpCenterContactSupportOption from './help-center-contact-support-option';
import './help-center-feedback-form.scss';
interface HelpCenterFeedbackFormProps {
	postId: number;
	blogId?: number | null;
	slug?: string;
	articleUrl?: string | null | undefined;
}
const HelpCenterFeedbackForm = ( {
	postId,
	blogId,
	slug,
	articleUrl,
}: HelpCenterFeedbackFormProps ) => {
	const { __ } = useI18n();
	const [ startedFeedback, setStartedFeedback ] = useState< boolean | null >( null );
	const [ answerValue, setAnswerValue ] = useState< number | null >( null );

	const { sectionName, site } = useHelpCenterContext();
	const shouldUseHelpCenterExperience = config.isEnabled( 'help-center-experience' );
	const wapuuChatId = useGetOdieStorage( 'chat_id' );
	const productSlug = ( site as HelpCenterSite )?.plan?.product_slug;
	const plan = getPlan( productSlug );
	const productId = plan?.getProductId();

	const handleFeedbackClick = ( value: number ) => {
		setStartedFeedback( true );
		setAnswerValue( value );

		recordTracksEvent( `calypso_inlinehelp_article_feedback_click`, {
			did_the_article_help: value === 1 ? 'yes' : 'no',
			post_id: postId,
		} );
	};

	const FeedbackButtons = () => {
		const feedbackButtonsText = shouldUseHelpCenterExperience
			? __( 'Was this helpful?' )
			: __( 'Did you find the answer to your question?' );
		return (
			<>
				<p>{ feedbackButtonsText }</p>
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

	const feedbackFormUrl = addQueryArgs(
		'https://wordpressdotcom.survey.fm/helpcenter-articles-feedback',
		{
			q_1_choice: answerValue,
			guide: slug,
			postId,
			blogId,
		}
	);

	const FeedbackTextArea = () => {
		if ( shouldUseHelpCenterExperience ) {
			return <p>{ __( 'Great! Thanks.' ) }</p>;
		}
		return (
			<>
				<p>{ __( 'How we can improve?' ) }</p>
				<iframe
					title={ __( 'Feedback Form' ) }
					// This is the URL of the feedback form,
					// `answerValue` is either 1 or 2 and it is used to skip the first question since we are already asking it here.
					// it is necessary to help crowd signal to `skip` ( display none with css ) the first question and save the correct value.
					src={ feedbackFormUrl }
				></iframe>
			</>
		);
	};

	return (
		<div className="help-center-feedback__form">
			{ startedFeedback === null && <FeedbackButtons /> }
			{ startedFeedback !== null && answerValue === 1 && <FeedbackTextArea /> }
			{ startedFeedback !== null && answerValue === 2 && site && (
				<HelpCenterContactSupportOption
					wapuuChatId={ wapuuChatId }
					sectionName={ sectionName }
					productId={ productId }
					site={ site }
					triggerSource="article-feedback-form"
					articleUrl={ articleUrl }
					trackEventName="calypso_helpcenter_feedback_contact_support"
				/>
			) }
		</div>
	);
};

export default HelpCenterFeedbackForm;
