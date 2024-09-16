import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import { trackStatsAnalyticsEvent } from 'calypso/my-sites/stats/utils';
import {
	NOTICES_KEY_SHOW_FLOATING_USER_FEEDBACK_PANEL,
	useNoticeVisibilityQuery,
} from '../hooks/use-notice-visibility-query';
import useStatsPurchases from '../hooks/use-stats-purchases';
import FeedbackModal from './modal';

import './style.scss';

const ACTION_LEAVE_REVIEW = 'action_redirect_to_plugin_review_page';
const ACTION_SEND_FEEDBACK = 'action_open_form_modal';
const ACTION_DISMISS_FLOATING_PANEL = 'action_dismiss_floating_panel';

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
		clickHandler( ACTION_LEAVE_REVIEW );
	};

	const handleSendFeedback = () => {
		clickHandler( ACTION_SEND_FEEDBACK );
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
		clickHandler( ACTION_DISMISS_FLOATING_PANEL );
	};

	const clickHandlerWithAnalytics = ( action: string ) => {
		// stats_feedback_action_redirect_to_plugin_review_page_from_floating_panel
		// stats_feedback_action_open_form_modal_from_floating_panel
		trackStatsAnalyticsEvent( `stats_feedback_${ action }_from_floating_panel` );

		clickHandler( action );
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
			<FeedbackContent clickHandler={ clickHandlerWithAnalytics } />
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
	const clickHandlerWithAnalytics = ( action: string ) => {
		// stats_feedback_action_redirect_to_plugin_review_page_from_persistent_section
		// stats_feedback_action_open_form_modal_from_persistent_section
		trackStatsAnalyticsEvent( `stats_feedback_${ action }_from_persistent_section` );

		clickHandler( action );
	};

	return (
		<div className="stats-feedback-card">
			<FeedbackContent clickHandler={ clickHandlerWithAnalytics } />
		</div>
	);
}

function StatsFeedbackController( { siteId }: FeedbackProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isFloatingPanelOpen, setIsFloatingPanelOpen ] = useState( false );

	const { supportCommercialUse } = useStatsPurchases( siteId );

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
			case ACTION_SEND_FEEDBACK:
				setIsFloatingPanelOpen( false );
				setIsOpen( true );
				break;
			case ACTION_DISMISS_FLOATING_PANEL:
				setIsFloatingPanelOpen( false );
				updateFeedbackPanelHibernationDelay();

				// stats_feedback_action_dismiss_floating_panel
				trackStatsAnalyticsEvent( `stats_feedback_${ ACTION_DISMISS_FLOATING_PANEL }` );
				break;
			case ACTION_LEAVE_REVIEW:
				setIsFloatingPanelOpen( false );
				window.open( FEEDBACK_LEAVE_REVIEW_URL );
				break;
			// Ignore other cases.
		}
	};

	const onModalClose = ( isAfterSubmission: boolean ) => {
		setIsOpen( false );

		if ( isAfterSubmission ) {
			trackStatsAnalyticsEvent( 'stats_feedback_action_close_form_modal_after_submission' );
		} else {
			trackStatsAnalyticsEvent( 'stats_feedback_action_close_form_modal' );
		}
	};

	if ( ! supportCommercialUse ) {
		return null;
	}

	return (
		<div className="stats-feedback-container">
			<FeedbackCard clickHandler={ handleButtonClick } />
			<FeedbackPanel isOpen={ isFloatingPanelOpen } clickHandler={ handleButtonClick } />
			{ isOpen && <FeedbackModal siteId={ siteId } onClose={ onModalClose } /> }
		</div>
	);
}

export default StatsFeedbackController;
