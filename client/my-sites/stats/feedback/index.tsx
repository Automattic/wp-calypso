import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FeedbackModal from './modal';

import './style.scss';

const FEEDBACK_ACTION_LEAVE_REVIEW = 'feedback-action-leave-review';
const FEEDBACK_ACTION_SEND_FEEDBACK = 'feedback-action-send-feedback';

interface FeedbackProps {
	clickHandler: ( action: string ) => void;
}

function StatsFeedbackController() {
	const [ isOpen, setIsOpen ] = useState( false );

	const handleButtonClick = ( action: string ) => {
		if ( action === FEEDBACK_ACTION_SEND_FEEDBACK ) {
			setIsOpen( true );
		}
	};

	return (
		<div className="stats-feedback-container">
			<FeedbackCard clickHandler={ handleButtonClick } />
			<FeedbackPanel clickHandler={ handleButtonClick } />
			<FeedbackModal isOpen={ isOpen } onClose={ () => setIsOpen( false ) } />
		</div>
	);
}

function FeedbackCard( { clickHandler }: FeedbackProps ) {
	return (
		<div className="stats-feedback-card">
			<FeedbackContent clickHandler={ clickHandler } />
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

	const handleLeaveReview = () => {
		clickHandler( FEEDBACK_ACTION_LEAVE_REVIEW );
	};

	const handleSendFeedback = () => {
		clickHandler( FEEDBACK_ACTION_SEND_FEEDBACK );
	};

	return (
		<div className="stats-feedback-card__content">
			<div className="stats-feedback-card__cta">{ ctaText }</div>
			<div className="stats-feedback-card__actions">
				<Button variant="secondary" onClick={ handleLeaveReview }>
					<span className="stats-feedback-card__emoji">😍</span>
					{ primaryButtonText }
				</Button>
				<Button variant="secondary" onClick={ handleSendFeedback }>
					<span className="stats-feedback-card__emoji">😠</span>
					{ secondaryButtonText }
				</Button>
			</div>
		</div>
	);
}

export default StatsFeedbackController;
