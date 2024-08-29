import { Button } from '@wordpress/components';
import { useState } from 'react';
import FeedbackModal from './modal';

import './style.scss';

function StatsFeedbackCard() {
	// A simple card component with feedback buttons.
	const [ isOpen, setIsOpen ] = useState( false );

	return (
		<div className="stats-feedback-card">
			<div className="stats-feedback-card__cta">
				<p>Hello from StatsFeedbackCard</p>
			</div>
			<div className="stats-feedback-card__actions">
				<button onClick={ () => setIsOpen( true ) }>two</button>
				<Button variant="secondary">
					<span className="stats-button-emoji">😍</span>
					Click me!
				</Button>
				<Button variant="secondary">
					<span className="stats-button-emoji">😠</span>
					Click me too!
				</Button>
			</div>
			<FeedbackModal isOpen={ isOpen } onClose={ () => setIsOpen( false ) } />
		</div>
	);
}

export default StatsFeedbackCard;
