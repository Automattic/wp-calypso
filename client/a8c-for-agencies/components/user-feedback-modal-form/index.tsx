import { Button, FormLabel } from '@automattic/components';
import { Modal } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextarea from 'calypso/components/forms/form-textarea';
import ReviewsRatingsStars from 'calypso/components/reviews-rating-stars/reviews-ratings-stars';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import useSubmitProductFeedback from './use-submit-product-feedback';

import './style.scss';

type Props = {
	show: boolean;
	onClose?: () => void;
};

const DEFAULT_FEEDBACK_VALUE = '';
const DEFAULT_RATING_VALUE = 0;

export default function UserFeedbackModalForm( { show, onClose }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ feedback, setFeedback ] = useState( DEFAULT_FEEDBACK_VALUE );
	const [ rating, setRating ] = useState( DEFAULT_RATING_VALUE );

	const { isSubmittingFeedback, submitFeedback, isSubmissionSuccessful } =
		useSubmitProductFeedback();

	const onModalClose = useCallback( () => {
		setFeedback( DEFAULT_FEEDBACK_VALUE );
		setRating( DEFAULT_RATING_VALUE );
		onClose?.();

		dispatch( recordTracksEvent( 'calypso_a4a_user_feedback_form_close' ) );
	}, [ dispatch, onClose ] );

	useEffect( () => {
		if ( isSubmissionSuccessful ) {
			dispatch(
				successNotice( translate( 'Thank you for your feedback!' ), {
					id: 'submit-product-feedback-success',
					duration: 5000,
				} )
			);
			onModalClose();
		}
	}, [ dispatch, isSubmissionSuccessful, onModalClose, translate ] );

	const onFeedbackChange = useCallback( ( event: ChangeEvent< HTMLInputElement > ) => {
		setFeedback( event.currentTarget.value );
	}, [] );

	const onRatingChange = useCallback(
		( rating: number ) => {
			dispatch( recordTracksEvent( 'calypso_a4a_user_feedback_form_rating_click' ) );
			setRating( rating );
		},
		[ dispatch ]
	);

	const hasCompletedForm = !! feedback && !! rating;

	const onSubmit = useCallback( () => {
		if ( ! hasCompletedForm ) {
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_a4a_user_feedback_form_submit', {
				rating,
				feedback,
			} )
		);

		const sourceUrl = `${ window.location.origin }${ window.location.pathname }`;
		submitFeedback( { feedback, rating, source_url: sourceUrl } );
	}, [ dispatch, feedback, hasCompletedForm, rating, submitFeedback ] );

	useEffect( () => {
		if ( show ) {
			dispatch( recordTracksEvent( 'calypso_a4a_user_feedback_form_open' ) );
		}
	}, [ dispatch, show ] );

	if ( ! show ) {
		return null;
	}

	return (
		<Modal
			className="user-feedback-modal-form"
			onRequestClose={ onModalClose }
			__experimentalHideHeader
		>
			<div className="user-feedback-modal-form__main">
				<Button
					className="user-feedback-modal-form__close-button"
					plain
					onClick={ onModalClose }
					aria-label={ translate( 'Close' ) }
				>
					<Icon size={ 24 } icon={ close } />
				</Button>

				<h1 className="user-feedback-modal-form__title">
					{ translate( 'Help us make Automattic for Agencies even better' ) }
				</h1>

				<p className="user-feedback-modal-form__instruction">
					{ translate(
						'Your feedback is extremely valuable to us. All feedback is sent to our product and program teams, and helps to inform how we evolve our offering.'
					) }
				</p>

				<FormFieldset>
					<FormLabel htmlFor="textarea">
						{ translate( 'What can we do to make Automattic for Agencies better for you?' ) }
					</FormLabel>
					<FormTextarea
						name="textarea"
						id="textarea"
						placeholder="Add your feedback here"
						value={ feedback }
						onChange={ onFeedbackChange }
						onClick={ () =>
							dispatch( recordTracksEvent( 'calypso_a4a_user_feedback_form_textarea_click' ) )
						}
					/>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="textarea">
						{ translate( 'How satisfied are you with Automattic for Agencies?' ) }
					</FormLabel>
					<ReviewsRatingsStars rating={ rating } onSelectRating={ onRatingChange } />
				</FormFieldset>
			</div>

			<div className="user-feedback-modal-form__footer">
				<Button
					busy={ isSubmittingFeedback }
					className="user-feedback-modal-form__footer-submit"
					primary
					disabled={ ! hasCompletedForm }
					onClick={ onSubmit }
				>
					{ translate( 'Submit your feedback' ) }
				</Button>
			</div>
		</Modal>
	);
}
