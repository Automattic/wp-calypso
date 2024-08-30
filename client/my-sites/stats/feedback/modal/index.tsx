import { Button, Modal, TextareaControl } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import StatsButton from 'calypso/my-sites/stats/components/stats-button';

import './style.scss';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const FeedbackModal: React.FC< ModalProps > = ( { isOpen, onClose } ) => {
	const translate = useTranslate();
	const [ isAnimating, setIsAnimating ] = useState( false );
	const [ content, setContent ] = useState( '' );

	const handleClose = () => {
		setIsAnimating( true );
		setTimeout( () => {
			setIsAnimating( false );
			onClose();
		}, 200 );
	};

	if ( ! isOpen && ! isAnimating ) {
		return null;
	}

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
					<StatsButton primary>{ translate( 'Submit' ) }</StatsButton>
				</div>
			</div>
		</Modal>
	);
};

export default FeedbackModal;
