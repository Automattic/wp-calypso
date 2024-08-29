import { Button } from '@wordpress/components';
import { useState } from 'react';
import FeedbackModal from './modal';

import './style.scss';

function StatsFeedbackCard() {
	// A simple card component with feedback buttons.
	const [ isOpen, setIsOpen ] = useState( false );

	const handleClickWriteReview = () => {
		// console.log( 'happy user, leave a review' );
	};

	const handleClickSendFeedback = () => {
		// console.log( 'angry user, send feedback' );
		setIsOpen( true );
	};

	return (
		<div className="stats-feedback-card">
			<div className="stats-feedback-card__cta">
				<p>Hello from StatsFeedbackCard</p>
			</div>
			<div className="stats-feedback-card__actions">
				<Button variant="secondary" onClick={ handleClickWriteReview }>
					<span className="stats-button-emoji">😍</span>
					Click me!
				</Button>
				<Button variant="secondary" onClick={ handleClickSendFeedback }>
					<span className="stats-button-emoji">😠</span>
					Click me too!
				</Button>
			</div>
			<FeedbackModal isOpen={ isOpen } onClose={ () => setIsOpen( false ) } />
		</div>
	);
}

export default StatsFeedbackCard;
