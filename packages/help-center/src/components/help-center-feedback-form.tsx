import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getPlan } from '@automattic/calypso-products';
import { HelpCenterSite } from '@automattic/data-stores';
import { GetSupport } from '@automattic/odie-client/src/components/message/get-support';
import { useManageSupportInteraction } from '@automattic/odie-client/src/data';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useSupportStatus } from '../data/use-support-status';
import { useResetSupportInteraction } from '../hooks/use-reset-support-interaction';
import { ThumbsDownIcon, ThumbsUpIcon } from '../icons/thumbs';
import HelpCenterContactSupportOption from './help-center-contact-support-option';
import { generateContactOnClickEvent } from './utils';

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

	const { data } = useSupportStatus();
	const isUserEligibleForPaidSupport = Boolean( data?.eligibility?.is_user_eligible );
	const { sectionName, site, shouldUseHelpCenterExperience } = useHelpCenterContext();
	const navigate = useNavigate();
	const productSlug = ( site as HelpCenterSite )?.plan?.product_slug;
	const plan = getPlan( productSlug );
	const productId = plan?.getProductId();
	const resetSupportInteraction = useResetSupportInteraction();
	const { startNewInteraction } = useManageSupportInteraction();

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
			return <p>{ __( 'Great! Thanks.', __i18n_text_domain__ ) }</p>;
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

	const handleContactSupportClick = async () => {
		generateContactOnClickEvent( 'chat', 'calypso_helpcenter_feedback_contact_support' );
		if ( isUserEligibleForPaidSupport ) {
			await resetSupportInteraction();
			startNewInteraction( {
				event_source: 'help-center',
				event_external_id: uuidv4(),
			} );
			navigate( '/odie' );
		}
	};

	return (
		<div className="help-center-feedback__form">
			{ startedFeedback === null && <FeedbackButtons /> }
			{ startedFeedback !== null && answerValue === 1 && <FeedbackTextArea /> }
			{ startedFeedback !== null &&
				answerValue === 2 &&
				site &&
				( shouldUseHelpCenterExperience ? (
					<>
						<div className="odie-chatbox-dislike-feedback-message">
							<p>
								{ __(
									'Would you like to contact our support team? Select an option below:',
									__i18n_text_domain__
								) }
							</p>
						</div>
						<GetSupport
							onClickAdditionalEvent={ handleContactSupportClick }
							isUserEligibleForPaidSupport={ isUserEligibleForPaidSupport }
						/>
					</>
				) : (
					<HelpCenterContactSupportOption
						sectionName={ sectionName }
						productId={ productId }
						site={ site }
						triggerSource="article-feedback-form"
						articleUrl={ articleUrl }
						trackEventName="calypso_helpcenter_feedback_contact_support"
					/>
				) ) }
		</div>
	);
};

export default HelpCenterFeedbackForm;
