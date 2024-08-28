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
				<button>one</button>
				<button onClick={ () => setIsOpen( true ) }>two</button>
			</div>
			<FeedbackModal isOpen={ isOpen } onClose={ () => setIsOpen( false ) } />
		</div>
	);
}

export default StatsFeedbackCard;
