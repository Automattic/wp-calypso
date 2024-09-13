import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import {
	NOTICES_KEY_SHOW_FLOATING_USER_FEEDBACK_PANEL,
	useNoticeVisibilityQuery,
} from '../hooks/use-notice-visibility-query';
import FeedbackModal from './modal';

import './style.scss';

const FEEDBACK_ACTION_LEAVE_REVIEW = 'feedback-action-leave-review';
const FEEDBACK_ACTION_SEND_FEEDBACK = 'feedback-action-send-feedback';
const FEEDBACK_ACTION_DISMISS_FLOATING_PANEL = 'feedback-action-dismiss-floating-panel';

const FEEDBACK_PANEL_PRESENTATION_DELAY = 3000;
const FEEDBACK_LEAVE_REVIEW_URL = 'https://wordpress.org/support/plugin/jetpack/reviews/';

const FEEDBACK_SHOULD_SHOW_PANEL_API_KEY = NOTICES_KEY_SHOW_FLOATING_USER_FEEDBACK_PANEL;
const FEEDBACK_SHOULD_SHOW_PANEL_API_HIBERNATION_DELAY = 3600 * 24 * 30 * 6; // 6 months

function useNoticeVisibilityHooks( siteId: number ) {
	const {
		isPending,
		isError,
		data: shouldShowFeedbackPanel,
		refetch,
	} = useNoticeVisibilityQuery( siteId, FEEDBACK_SHOULD_SHOW_PANEL_API_KEY );

	const { mutateAsync } = useNoticeVisibilityMutation(
		siteId,
		FEEDBACK_SHOULD_SHOW_PANEL_API_KEY,
		'postponed',
		FEEDBACK_SHOULD_SHOW_PANEL_API_HIBERNATION_DELAY
	);

	const updateFeedbackPanelHibernationDelay = () => {
		mutateAsync().then( () => {
			refetch();
		} );
	};

	return { isPending, isError, shouldShowFeedbackPanel, updateFeedbackPanelHibernationDelay };
}

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

function StatsFeedbackController( { siteId }: FeedbackProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isFloatingPanelOpen, setIsFloatingPanelOpen ] = useState( false );

	const { isPending, isError, shouldShowFeedbackPanel, updateFeedbackPanelHibernationDelay } =
		useNoticeVisibilityHooks( siteId );

	useEffect( () => {
		if ( ! isPending && ! isError && shouldShowFeedbackPanel ) {
			setTimeout( () => {
				setIsFloatingPanelOpen( true );
			}, FEEDBACK_PANEL_PRESENTATION_DELAY );
		}
	}, [ isPending, isError, shouldShowFeedbackPanel ] );

	const handleButtonClick = ( action: string ) => {
		switch ( action ) {
			case FEEDBACK_ACTION_SEND_FEEDBACK:
				setIsFloatingPanelOpen( false );
				setIsOpen( true );
				break;
			case FEEDBACK_ACTION_DISMISS_FLOATING_PANEL:
				setIsFloatingPanelOpen( false );
				updateFeedbackPanelHibernationDelay();
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
