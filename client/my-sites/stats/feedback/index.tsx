import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import clsx from 'clsx';
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

// eslint-disable-next-line import/no-extraneous-dependencies
import 'animate.css';

import './style.scss';

const ACTION_LEAVE_REVIEW = 'action_redirect_to_plugin_review_page';
const ACTION_SEND_FEEDBACK = 'action_open_form_modal';
const ACTION_DISMISS_FLOATING_PANEL = 'action_dismiss_floating_panel';

const FEEDBACK_PANEL_PRESENTATION_DELAY = 3000;
const FEEDBACK_LEAVE_REVIEW_URL = 'https://wordpress.org/support/plugin/jetpack/reviews/';

const FEEDBACK_SHOULD_SHOW_PANEL_API_KEY = NOTICES_KEY_SHOW_FLOATING_USER_FEEDBACK_PANEL;
const FEEDBACK_SHOULD_SHOW_PANEL_API_HIBERNATION_DELAY = 3600 * 24 * 30 * 6; // 6 months

// These values control the animation of the floating panel.
// For available animations see: https://animate.style/
// The delay value allows the animation to run before the component is removed from the DOM.
const FEEDBACK_PANEL_ANIMATION_NAME_ENTRY = 'animate__bounceInUp';
const FEEDBACK_PANEL_ANIMATION_NAME_EXIT = 'animate__fadeOutDownBig';
const FEEDBACK_PANEL_ANIMATION_DELAY_EXIT = 500;

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
	animationClassName?: string;
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
				<Button
					variant="secondary"
					onClick={ () => {
						clickHandler( 'present-panel' );
					} }
				>
					<span className="stats-feedback-content__emoji">🐞</span>
					Show panel
				</Button>
			</div>
		</div>
	);
}

function FeedbackPanel( { isOpen, animationClassName, clickHandler }: FeedbackPropsInternal ) {
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
		<div className={ clsx( 'stats-feedback-panel', 'animate__animated', animationClassName ) }>
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

// TODO: Remove debug mode.
// And toggle panel button/action support.
const FEEDBACK_DEBUG_MODE = true;

function StatsFeedbackController( { siteId }: FeedbackProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isFloatingPanelOpen, setIsFloatingPanelOpen ] = useState( false );
	const [ animationName, setAnimationName ] = useState( FEEDBACK_PANEL_ANIMATION_NAME_ENTRY );

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

	const toggleFloatingPanel = () => {
		if ( isFloatingPanelOpen ) {
			setAnimationName( FEEDBACK_PANEL_ANIMATION_NAME_EXIT );
			setTimeout( () => {
				setIsFloatingPanelOpen( false );
			}, FEEDBACK_PANEL_ANIMATION_DELAY_EXIT );
		} else {
			setIsFloatingPanelOpen( true );
			setAnimationName( FEEDBACK_PANEL_ANIMATION_NAME_ENTRY );
		}
	};

	function dismissFloatingPanel() {
		const delay = isFloatingPanelOpen ? FEEDBACK_PANEL_ANIMATION_DELAY_EXIT : 0;
		setAnimationName( FEEDBACK_PANEL_ANIMATION_NAME_EXIT );
		setTimeout( () => {
			setIsFloatingPanelOpen( false );
		}, delay );
	}

	const handleButtonClick = ( action: string ) => {
		switch ( action ) {
			case ACTION_SEND_FEEDBACK:
				dismissFloatingPanel();
				setTimeout( () => setIsOpen( true ), FEEDBACK_PANEL_ANIMATION_DELAY_EXIT );
				break;
			case ACTION_DISMISS_FLOATING_PANEL:
				dismissFloatingPanel();
				if ( ! FEEDBACK_DEBUG_MODE ) {
					updateFeedbackPanelHibernationDelay();
					trackStatsAnalyticsEvent( `stats_feedback_${ ACTION_DISMISS_FLOATING_PANEL }` );
				}
				break;
			case ACTION_LEAVE_REVIEW:
				dismissFloatingPanel();
				setTimeout(
					() => window.open( FEEDBACK_LEAVE_REVIEW_URL ),
					FEEDBACK_PANEL_ANIMATION_DELAY_EXIT
				);
				break;
			case 'present-panel':
				toggleFloatingPanel();
				break;

			// Ignore other cases.
		}
	};

	const onModalClose = () => {
		setIsOpen( false );
	};

	if ( ! supportCommercialUse ) {
		return null;
	}

	return (
		<div className="stats-feedback-container">
			<FeedbackCard clickHandler={ handleButtonClick } />
			<FeedbackPanel
				isOpen={ isFloatingPanelOpen }
				animationClassName={ animationName }
				clickHandler={ handleButtonClick }
			/>
			{ isOpen && <FeedbackModal siteId={ siteId } onClose={ onModalClose } /> }
		</div>
	);
}

export default StatsFeedbackController;
