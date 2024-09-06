import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import FeedbackModal from './modal';

import './style.scss';

const FEEDBACK_KEY_DISMISS_DATE = 'stats-feedback-dismiss-date';
const FEEDBACK_KEY_SUBMISSION_DATE = 'stats-feedback-submission-date';

const FEEDBACK_ACTION_LEAVE_REVIEW = 'feedback-action-leave-review';
const FEEDBACK_ACTION_SEND_FEEDBACK = 'feedback-action-send-feedback';
const FEEDBACK_ACTION_DISMISS_FLOATING_PANEL = 'feedback-action-dismiss-floating-panel';

const FEEDBACK_PANEL_PRESENTATION_DELAY = 3000;
const FEEDBACK_LEAVE_REVIEW_URL = 'https://wordpress.org/support/plugin/jetpack/reviews/';

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
	const primaryButtonText = translate( 'Love it? Leave a review ↗' );
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
			<Button
				className="stats-feedback-panel__dismiss-button"
				onClick={ handleCloseButtonClicked }
				variant="link"
			>
				{ translate( 'Dismiss' ) }
			</Button>
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

function storePanelDismissDate() {
	localStorage.setItem( FEEDBACK_KEY_DISMISS_DATE, new Date().toISOString() );
}

function storeFeedbackSubmissionDate() {
	localStorage.setItem( FEEDBACK_KEY_SUBMISSION_DATE, new Date().toISOString() );
}

function getDiffInMilliseconds( isoDate: string ) {
	return new Date().getTime() - new Date( isoDate ).getTime();
}

function getMonthsFromMilliseconds( milliseconds: number ) {
	return Math.floor( milliseconds / ( 1000 * 60 * 60 * 24 * 30 ) );
}

function getMonthsFromISODate( isoDate: string ) {
	return getMonthsFromMilliseconds( getDiffInMilliseconds( isoDate ) );
}

function didSubmitFeedbackWithinTwelveMonths() {
	const submissionDate = localStorage.getItem( FEEDBACK_KEY_SUBMISSION_DATE );
	if ( ! submissionDate ) {
		return false;
	}

	if ( getMonthsFromISODate( submissionDate ) <= 12 ) {
		return true;
	}

	return false;
}

function didDismissPanelWithinSixMonths() {
	const dismissDate = localStorage.getItem( FEEDBACK_KEY_DISMISS_DATE );
	if ( ! dismissDate ) {
		return false;
	}

	if ( getMonthsFromISODate( dismissDate ) <= 6 ) {
		return true;
	}

	return false;
}

function shouldShowFloatingPanel() {
	if ( didSubmitFeedbackWithinTwelveMonths() ) {
		return false;
	}

	if ( didDismissPanelWithinSixMonths() ) {
		return false;
	}

	return true;
}

function StatsFeedbackController( { siteId }: FeedbackProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isFloatingPanelOpen, setIsFloatingPanelOpen ] = useState( false );

	useEffect( () => {
		if ( shouldShowFloatingPanel() ) {
			setTimeout( () => {
				setIsFloatingPanelOpen( true );
			}, FEEDBACK_PANEL_PRESENTATION_DELAY );
		}
	}, [] );

	const handleButtonClick = ( action: string ) => {
		switch ( action ) {
			case FEEDBACK_ACTION_SEND_FEEDBACK:
				// TODO: Should store submission date when the user actually submits the review.
				// That means getting a status value back from the FeedbackModal component.
				// We'll do it here for now.
				storeFeedbackSubmissionDate();
				setIsOpen( true );
				break;
			case FEEDBACK_ACTION_DISMISS_FLOATING_PANEL:
				storePanelDismissDate();
				setIsFloatingPanelOpen( false );
				break;
			case FEEDBACK_ACTION_LEAVE_REVIEW:
				setIsFloatingPanelOpen( false );
				window.open( FEEDBACK_LEAVE_REVIEW_URL );
				break;
			// Ignore other cases.
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
