import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FeedbackModal from './modal';

import './style.scss';

const FEEDBACK_ACTION_LEAVE_REVIEW = 'feedback-action-leave-review';
const FEEDBACK_ACTION_SEND_FEEDBACK = 'feedback-action-send-feedback';
const FEEDBACK_ACTION_DISMISS_FLOATING_PANEL = 'feedback-action-dismiss-floating-panel';

interface FeedbackProps {
	siteId: number;
}

interface FeedbackPropsInternal {
	clickHandler: ( action: string ) => void;
	isOpen?: boolean;
}

function FeedbackContent( { clickHandler }: FeedbackPropsInternal ) {
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
		<div className="stats-feedback-content">
			<div className="stats-feedback-content__cta">{ ctaText }</div>
			<div className="stats-feedback-content__actions">
				<Button variant="secondary" onClick={ handleLeaveReview }>
					<span className="stats-feedback-content__emoji">😍</span>
					{ primaryButtonText }
				</Button>
				<Button variant="secondary" onClick={ handleSendFeedback }>
					<span className="stats-feedback-content__emoji">😠</span>
					{ secondaryButtonText }
				</Button>
			</div>
		</div>
	);
}

function FeedbackPanel( { isOpen, clickHandler }: FeedbackPropsInternal ) {
	const translate = useTranslate();

	const handleCloseButtonClicked = () => {
		clickHandler( FEEDBACK_ACTION_DISMISS_FLOATING_PANEL );
	};

	if ( ! isOpen ) {
		return null;
	}

	return (
		<div className="stats-feedback-panel">
			<Button
				className="stats-feedback-panel__close-button"
				onClick={ handleCloseButtonClicked }
				icon={ close }
				label={ translate( 'Close' ) }
			/>
			<FeedbackContent clickHandler={ clickHandler } />
		</div>
	);
}

function FeedbackCard( { clickHandler }: FeedbackPropsInternal ) {
	return (
		<div className="stats-feedback-card">
			<FeedbackContent clickHandler={ clickHandler } />
		</div>
	);
}

function StatsFeedbackController( { siteId }: FeedbackProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isFloatingPanelOpen, setIsFloatingPanelOpen ] = useState( true );

	const handleButtonClick = ( action: string ) => {
		if ( action === FEEDBACK_ACTION_SEND_FEEDBACK ) {
			setIsOpen( true );
		}
		if ( action === FEEDBACK_ACTION_DISMISS_FLOATING_PANEL ) {
			setIsFloatingPanelOpen( false );
		}
	};

	return (
		<div className="stats-feedback-container">
			<FeedbackCard clickHandler={ handleButtonClick } />
			<FeedbackPanel isOpen={ isFloatingPanelOpen } clickHandler={ handleButtonClick } />
			{ isOpen && <FeedbackModal siteId={ siteId } onClose={ () => setIsOpen( false ) } /> }
		</div>
	);
}

export default StatsFeedbackController;
