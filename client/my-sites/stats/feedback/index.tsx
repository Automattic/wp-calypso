import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FeedbackModal from './modal';

import './style.scss';

function StatsFeedbackCard() {
	const translate = useTranslate();
	const [ isOpen, setIsOpen ] = useState( false );

	const ctaText = translate( 'How do you rate your overall experience with Jetpack Stats?' );
	const primaryButtonText = translate( 'Love it? Leave a review' );
	const secondaryButtonText = translate( 'Not a fan? Help us improve' );

	const handleClickWriteReview = () => {};

	const handleClickSendFeedback = () => {
		setIsOpen( true );
	};

	return (
		<div className="stats-feedback-container">
			<div className="stats-feedback-card">
				<div className="stats-feedback-card__cta">{ ctaText }</div>
				<div className="stats-feedback-card__actions">
					<Button variant="secondary" onClick={ handleClickWriteReview }>
						<span className="stats-feedback-card__emoji">😍</span>
						{ primaryButtonText }
					</Button>
					<Button variant="secondary" onClick={ handleClickSendFeedback }>
						<span className="stats-feedback-card__emoji">😠</span>
						{ secondaryButtonText }
					</Button>
				</div>
				<FeedbackModal isOpen={ isOpen } onClose={ () => setIsOpen( false ) } />
			</div>
		</div>
	);
}

export default StatsFeedbackCard;
