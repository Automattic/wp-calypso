import { Button, Modal, TextareaControl } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useCallback, useEffect } from 'react';
import StatsButton from 'calypso/my-sites/stats/components/stats-button';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import {
	NOTICES_KEY_ABLE_TO_SUBMIT_FEEDBACK,
	NOTICES_KEY_SHOW_FLOATING_USER_FEEDBACK_PANEL,
	useNoticeVisibilityQuery,
} from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { trackStatsAnalyticsEvent } from 'calypso/my-sites/stats/utils';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import useSubmitProductFeedback from './use-submit-product-feedback';

import './style.scss';

interface ModalProps {
	siteId: number;
	onClose: () => void;
}

const FEEDBACK_SHOULD_SHOW_PANEL_API_KEY = NOTICES_KEY_SHOW_FLOATING_USER_FEEDBACK_PANEL;
const FEEDBACK_SHOULD_SHOW_PANEL_API_HIBERNATION_DELAY = 3600 * 24 * 30 * 12; // 12 months
const FEEDBACK_THROTTLE_SUBMISSION_DELAY = 60 * 5; // 5 minutes

const FeedbackModal: React.FC< ModalProps > = ( { siteId, onClose } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ content, setContent ] = useState( '' );

	const {
		data: isAbleToSubmitFeedback,
		isFetching: isCheckingAbilityToSubmitFeedback,
		refetch: refetchNotices,
	} = useNoticeVisibilityQuery( siteId, NOTICES_KEY_ABLE_TO_SUBMIT_FEEDBACK );

	const { mutateAsync: disableFeedbackSubmission } = useNoticeVisibilityMutation(
		siteId,
		NOTICES_KEY_ABLE_TO_SUBMIT_FEEDBACK,
		'postponed',
		FEEDBACK_THROTTLE_SUBMISSION_DELAY
	);

	const { mutateAsync: updateFeedbackHibernationPeriod } = useNoticeVisibilityMutation(
		siteId,
		FEEDBACK_SHOULD_SHOW_PANEL_API_KEY,
		'postponed',
		FEEDBACK_SHOULD_SHOW_PANEL_API_HIBERNATION_DELAY
	);

	const { isSubmittingFeedback, submitFeedback, isSubmissionSuccessful } =
		useSubmitProductFeedback( siteId );

	const handleClose = useCallback(
		( isDirectClose: boolean = false ) => {
			onClose();

			if ( isDirectClose ) {
				trackStatsAnalyticsEvent( 'stats_feedback_action_directly_close_form_modal' );
			}
		},
		[ onClose ]
	);

	const onFormSubmit = useCallback( () => {
		if ( ! content ) {
			return;
		}

		const sourceUrl = `${ window.location.origin }${ window.location.pathname }`;
		submitFeedback( {
			source_url: sourceUrl,
			product_name: 'Jetpack Stats',
			feedback: content,
			is_testing: false,
		} );

		trackStatsAnalyticsEvent( 'stats_feedback_action_submit_form', {
			feedback: content,
		} );
	}, [ content, submitFeedback ] );

	useEffect( () => {
		if ( isSubmissionSuccessful ) {
			dispatch(
				successNotice( translate( 'Thank you for your feedback!' ), {
					id: 'submit-product-feedback-success',
					duration: 5000,
				} )
			);

			updateFeedbackHibernationPeriod();
			disableFeedbackSubmission().then( () => {
				refetchNotices();
			} );

			handleClose();
		}
	}, [
		dispatch,
		isSubmissionSuccessful,
		handleClose,
		translate,
		disableFeedbackSubmission,
		updateFeedbackHibernationPeriod,
		refetchNotices,
	] );

	return (
		<Modal
			className="stats-feedback-modal"
			onRequestClose={ () => {
				handleClose( true );
			} }
			__experimentalHideHeader
		>
			<Button
				className="stats-feedback-modal__close-button"
				onClick={ () => {
					handleClose( true );
				} }
				icon={ close }
				label={ translate( 'Close' ) }
			/>
			<div className="stats-feedback-modal__wrapper">
				<h1 className="stats-feedback-modal__title">
					{ translate( 'Help us make Jetpack better' ) }
				</h1>

				<div className="stats-feedback-modal__text">
					<p>
						{ translate(
							'We value your opinion and would love to hear more about your experience. Please share any specific thoughts or suggestions you have to improve Jetpack.'
						) }
					</p>
					<p>
						{ translate(
							'Note: This form is for general feedback only. If you need a reply from our Happiness Engineers, please use our {{link}}contact form{{/link}} to get in touch.',
							{
								components: {
									link: (
										<a
											target="_blank"
											rel="noreferrer"
											href="https://jetpack.com/contact-support/"
										/>
									),
								},
							}
						) }
					</p>
				</div>
				<TextareaControl
					rows={ 5 }
					cols={ 40 }
					className="stats-feedback-modal__form"
					placeholder={ translate( 'Add your feedback here' ) }
					name="content"
					value={ content }
					onChange={ setContent }
					disabled={ ! isCheckingAbilityToSubmitFeedback && ! isAbleToSubmitFeedback }
				/>
				<div className="stats-feedback-modal__button">
					{ ! isCheckingAbilityToSubmitFeedback && ! isAbleToSubmitFeedback && (
						<strong>
							<em>
								{ translate( 'Feedback submission is currently limited to one per 5 minutes.' ) }
							</em>
						</strong>
					) }
					<StatsButton
						primary
						onClick={ onFormSubmit }
						busy={ isSubmittingFeedback }
						disabled={
							isCheckingAbilityToSubmitFeedback ||
							! isAbleToSubmitFeedback ||
							isSubmittingFeedback ||
							isSubmissionSuccessful ||
							! content
						}
					>
						{ translate( 'Submit' ) }
					</StatsButton>
				</div>
			</div>
		</Modal>
	);
};

export default FeedbackModal;
