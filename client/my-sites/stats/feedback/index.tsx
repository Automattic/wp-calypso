import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FeedbackModal from './modal';

import './style.scss';

function StatsFeedbackCard() {
	const [ isOpen, setIsOpen ] = useState( false );

	const handleButtonClick = () => {
		setIsOpen( true );
	};

	return (
		<div className="stats-feedback-container">
			<div className="stats-feedback-card">
				<FeedbackContent clickhandler={ handleButtonClick } />
				<FeedbackModal isOpen={ isOpen } onClose={ () => setIsOpen( false ) } />
			</div>
			<FeedbackPanel />
		</div>
	);
}

function FeedbackPanel() {
	return (
		<div className="stats-feedback-panel">
			<p>floating panel content here</p>
			<p>buttons here</p>
		</div>
	);
}

function FeedbackContent( { clickhandler } ) {
	const translate = useTranslate();

	const ctaText = translate( 'How do you rate your overall experience with Jetpack Stats?' );
	const primaryButtonText = translate( 'Love it? Leave a review' );
	const secondaryButtonText = translate( 'Not a fan? Help us improve' );

	const handleButtonClick = () => {
		console.log( 'button clicked' );
		if ( clickhandler ) {
			clickhandler();
		}
	};

	return (
		<div className="stats-feedback-card__content">
			<div className="stats-feedback-card__cta">{ ctaText }</div>
			<div className="stats-feedback-card__actions">
				<Button variant="secondary" onClick={ handleButtonClick }>
					<span className="stats-feedback-card__emoji">😍</span>
					{ primaryButtonText }
				</Button>
				<Button variant="secondary" onClick={ handleButtonClick }>
					<span className="stats-feedback-card__emoji">😠</span>
					{ secondaryButtonText }
				</Button>
			</div>
		</div>
	);
}

export default StatsFeedbackCard;
