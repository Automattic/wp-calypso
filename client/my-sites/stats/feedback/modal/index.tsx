import { Button, Modal, TextareaControl } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useCallback, useEffect } from 'react';
import StatsButton from 'calypso/my-sites/stats/components/stats-button';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import useSubmitProductFeedback from './use-submit-product-feedback';

import './style.scss';

interface ModalProps {
	siteId: number;
	onClose: () => void;
}

const FeedbackModal: React.FC< ModalProps > = ( { siteId, onClose } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ content, setContent ] = useState( '' );

	const { isSubmittingFeedback, submitFeedback, isSubmissionSuccessful } =
		useSubmitProductFeedback( siteId );

	const handleClose = useCallback( () => {
		setTimeout( () => {
			onClose();
		}, 200 );
	}, [ onClose ] );

	const onFormSubmit = useCallback( () => {
		if ( ! content ) {
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_jetpack_stats_user_feedback_form_submit', {
				feedback: content,
			} )
		);

		const sourceUrl = `${ window.location.origin }${ window.location.pathname }`;
		submitFeedback( { source_url: sourceUrl, product_name: 'Jetpack Stats', feedback: content } );
	}, [ dispatch, content, submitFeedback ] );

	useEffect( () => {
		if ( isSubmissionSuccessful ) {
			dispatch(
				successNotice( translate( 'Thank you for your feedback!' ), {
					id: 'submit-product-feedback-success',
					duration: 5000,
				} )
			);

			handleClose();
		}
	}, [ dispatch, isSubmissionSuccessful, handleClose, translate ] );

	return (
		<Modal className="stats-feedback-modal" onRequestClose={ handleClose } __experimentalHideHeader>
			<Button
				className="stats-feedback-modal__close-button"
				onClick={ handleClose }
				icon={ close }
				label={ translate( 'Close' ) }
			/>
			<div className="stats-feedback-modal__wrapper">
				<h1 className="stats-feedback-modal__title">
					{ translate( 'Help us make Jetpack Stats better' ) }
				</h1>

				<div className="stats-feedback-modal__text">
					{ translate(
						'We value your opinion and would love to hear more about your experience. Please share any specific thoughts or suggestions you have to improve Jetpack Stats.'
					) }
				</div>
				<TextareaControl
					rows={ 5 }
					cols={ 40 }
					className="stats-feedback-modal__form"
					placeholder={ translate( 'Add your feedback here' ) }
					name="content"
					value={ content }
					onChange={ setContent }
				/>
				<div className="stats-feedback-modal__button">
					<StatsButton
						primary
						onClick={ onFormSubmit }
						busy={ isSubmittingFeedback || isSubmissionSuccessful }
						disabled={ isSubmittingFeedback || isSubmissionSuccessful || ! content }
					>
						{ translate( 'Submit' ) }
					</StatsButton>
				</div>
			</div>
		</Modal>
	);
};

export default FeedbackModal;
