import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FeedbackModal from './modal';

import './style.scss';

interface FeedbackProps {
	clickHandler: () => void;
}

function StatsFeedbackCard() {
	const [ isOpen, setIsOpen ] = useState( false );

	const handleButtonClick = () => {
		setIsOpen( true );
	};

	return (
		<div className="stats-feedback-container">
			<div className="stats-feedback-card">
				<FeedbackContent clickHandler={ handleButtonClick } />
				<FeedbackModal isOpen={ isOpen } onClose={ () => setIsOpen( false ) } />
			</div>
			<FeedbackPanel clickHandler={ handleButtonClick } />
		</div>
	);
}

function FeedbackPanel( { clickHandler }: FeedbackProps ) {
	return (
		<div className="stats-feedback-panel">
			<FeedbackContent clickHandler={ clickHandler } />
		</div>
	);
}

function FeedbackContent( { clickHandler }: FeedbackProps ) {
	const translate = useTranslate();

	const ctaText = translate( 'How do you rate your overall experience with Jetpack Stats?' );
	const primaryButtonText = translate( 'Love it? Leave a review' );
	const secondaryButtonText = translate( 'Not a fan? Help us improve' );

	const handleButtonClick = () => {
		if ( clickHandler ) {
			clickHandler();
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
