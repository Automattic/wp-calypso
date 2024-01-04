import { Button, FormLabel } from '@automattic/components';
import { Modal } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useCallback, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextarea from 'calypso/components/forms/form-textarea';
import ReviewsRatingsStars from 'calypso/components/reviews-rating-stars/reviews-ratings-stars';

import './style.scss';

type Props = {
	show: boolean;
	onClose?: () => void;
};

const DEFAULT_FEEDBACK_VALUE = '';
const DEFAULT_RATING_VALUE = 0;

export default function UserFeedbackModalForm( { show, onClose }: Props ) {
	const translate = useTranslate();

	const [ feedback, setFeedback ] = useState( DEFAULT_FEEDBACK_VALUE );
	const [ rating, setRating ] = useState( DEFAULT_RATING_VALUE );

	const onFeedbackChange = useCallback( ( event: ChangeEvent< HTMLInputElement > ) => {
		setFeedback( event.currentTarget.value );
	}, [] );

	const onRatingChange = useCallback( ( rating: number ) => {
		setRating( rating );
	}, [] );

	const hasCompletedForm = !! feedback && !! rating;

	const onSubmit = useCallback( () => {
		if ( ! hasCompletedForm ) {
			return;
		}

		// TODO: send feedback to backend
	}, [ hasCompletedForm ] );

	const onModalClose = useCallback( () => {
		setFeedback( DEFAULT_FEEDBACK_VALUE );
		setRating( DEFAULT_RATING_VALUE );
		onClose?.();
	}, [ onClose ] );

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
					{ translate( 'Help us make Jetpack Manage even better' ) }
				</h1>

				<p className="user-feedback-modal-form__instruction">
					{ translate(
						'Your product feedback is extremely valuable to us. Our goal is to help you do your work better and more efficiently - all feedback is sent to our product team and helps inform our development roadmap.'
					) }
				</p>

				<FormFieldset>
					<FormLabel htmlFor="textarea">
						{ translate( 'What can we do to make Jetpack Manage better for you?' ) }
					</FormLabel>
					<FormTextarea
						name="textarea"
						id="textarea"
						placeholder="Add your feedback here"
						value={ feedback }
						onChange={ onFeedbackChange }
					/>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="textarea">
						{ translate( 'How satisfied with Jetpack Manage are you?' ) }
					</FormLabel>
					<ReviewsRatingsStars rating={ rating } onSelectRating={ onRatingChange } />
				</FormFieldset>
			</div>

			<div className="user-feedback-modal-form__footer">
				<Button
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
