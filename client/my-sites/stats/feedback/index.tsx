import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import { trackStatsAnalyticsEvent } from 'calypso/my-sites/stats/utils';
import {
	NOTICES_KEY_SHOW_FLOATING_USER_FEEDBACK_PANEL,
	useNoticeVisibilityQuery,
} from '../hooks/use-notice-visibility-query';
import useStatsPurchases from '../hooks/use-stats-purchases';
import FeedbackModal from './modal';
import useHighlightsQuery from './use-highlights-query';
import useSiteTypes from './use-site-types';

// eslint-disable-next-line import/no-extraneous-dependencies
import 'animate.css';

import './style.scss';

const TRACKS_EVENT_DID_PRESENT_FEEDBACK_CARD = 'stats_feedback_action_present_persistent_section';
const TRACKS_EVENT_LEAVE_REVIEW_FROM_CARD =
	'stats_feedback_action_redirect_to_plugin_review_page_from_persistent_section';
const TRACKS_EVENT_SEND_FEEDBACK_FROM_CARD =
	'stats_feedback_action_open_form_modal_from_persistent_section';
const TRACKS_EVENT_LEAVE_REVIEW_FROM_PANEL =
	'stats_feedback_action_redirect_to_plugin_review_page_from_floating_panel';
const TRACKS_EVENT_SEND_FEEDBACK_FROM_PANEL =
	'stats_feedback_action_open_form_modal_from_floating_panel';
const TRACKS_EVENT_DISMISS_FLOATING_PANEL = 'stats_feedback_action_dismiss_floating_panel';
const TRACKS_EVENT_VIEW_FLOATING_PANEL = 'stats_feedback_action_view_floating_panel';

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

interface FeedbackContentProps {
	onLeaveReview: () => void;
	onSendFeedback: () => void;
}

function FeedbackContent( { onLeaveReview, onSendFeedback }: FeedbackContentProps ) {
	const translate = useTranslate();

	const ctaText = translate( 'How would you rate your overall experience with Jetpack?' );
	const primaryButtonText = translate( 'Love it? Leave a review ↗' );
	const secondaryButtonText = translate( 'Not a fan? Help us improve' );

	return (
		<div className="stats-feedback-content">
			<div className="stats-feedback-content__cta">{ ctaText }</div>
			<div className="stats-feedback-content__actions">
				<Button variant="secondary" onClick={ onLeaveReview }>
					<span className="stats-feedback-content__emoji">😍</span>
					{ primaryButtonText }
				</Button>
				<Button variant="secondary" onClick={ onSendFeedback }>
					<span className="stats-feedback-content__emoji">😠</span>
					{ secondaryButtonText }
				</Button>
			</div>
		</div>
	);
}

interface FeedbackPanelProps {
	isOpen: boolean;
	onDismissPanel: () => void;
	onLeaveReview: () => void;
	onSendFeedback: () => void;
}

function FeedbackPanel( {
	isOpen,
	onDismissPanel,
	onLeaveReview,
	onSendFeedback,
}: FeedbackPanelProps ) {
	const translate = useTranslate();
	const [ animationClassName, setAnimationClassName ] = useState(
		FEEDBACK_PANEL_ANIMATION_NAME_ENTRY
	);

	const handleDismissPanel = () => {
		trackStatsAnalyticsEvent( TRACKS_EVENT_DISMISS_FLOATING_PANEL );
		setAnimationClassName( FEEDBACK_PANEL_ANIMATION_NAME_EXIT );
		onDismissPanel();
	};

	const handleLeaveReviewFromPanel = () => {
		trackStatsAnalyticsEvent( TRACKS_EVENT_LEAVE_REVIEW_FROM_PANEL );
		onLeaveReview();
	};

	const handleSendFeedbackFromPanel = () => {
		trackStatsAnalyticsEvent( TRACKS_EVENT_SEND_FEEDBACK_FROM_PANEL );
		onSendFeedback();
	};

	if ( ! isOpen ) {
		return null;
	}

	return (
		<div className={ clsx( 'stats-feedback-panel', 'animate__animated', animationClassName ) }>
			<Button
				className="stats-feedback-panel__close-button"
				onClick={ handleDismissPanel }
				icon={ close }
				label={ translate( 'Close' ) }
			/>
			<FeedbackContent
				onLeaveReview={ handleLeaveReviewFromPanel }
				onSendFeedback={ handleSendFeedbackFromPanel }
			/>
			<Button
				className="stats-feedback-panel__dismiss-button"
				onClick={ handleDismissPanel }
				variant="link"
			>
				{ translate( 'Dismiss' ) }
			</Button>
		</div>
	);
}

interface FeedbackCardProps {
	onLeaveReview: () => void;
	onSendFeedback: () => void;
}

function FeedbackCard( { onLeaveReview, onSendFeedback }: FeedbackCardProps ) {
	useEffect( () => {
		trackStatsAnalyticsEvent( TRACKS_EVENT_DID_PRESENT_FEEDBACK_CARD );
	}, [] );

	const handleLeaveReviewFromCard = () => {
		trackStatsAnalyticsEvent( TRACKS_EVENT_LEAVE_REVIEW_FROM_CARD );
		onLeaveReview();
	};
	const handleSendFeedbackFromCard = () => {
		trackStatsAnalyticsEvent( TRACKS_EVENT_SEND_FEEDBACK_FROM_CARD );
		onSendFeedback();
	};

	return (
		<div className="stats-feedback-card">
			<FeedbackContent
				onLeaveReview={ handleLeaveReviewFromCard }
				onSendFeedback={ handleSendFeedbackFromCard }
			/>
		</div>
	);
}

function StatsFeedbackController( { siteId }: FeedbackProps ) {
	const [ isFeedbackModalOpen, setIsFeedbackModalOpen ] = useState( false );
	const [ isFloatingPanelOpen, setIsFloatingPanelOpen ] = useState( false );

	const { isPending, isError, shouldShowFeedbackPanel, updateFeedbackPanelHibernationDelay } =
		useNoticeVisibilityHooks( siteId );

	useEffect( () => {
		if ( ! isPending && ! isError && shouldShowFeedbackPanel ) {
			setTimeout( () => {
				setIsFloatingPanelOpen( true );
				trackStatsAnalyticsEvent( TRACKS_EVENT_VIEW_FLOATING_PANEL );
			}, FEEDBACK_PANEL_PRESENTATION_DELAY );
		}
	}, [ isPending, isError, shouldShowFeedbackPanel ] );

	const dismissPanelWithDelay = () => {
		// Allows the animation to run first.
		setTimeout( () => {
			setIsFloatingPanelOpen( false );
		}, FEEDBACK_PANEL_ANIMATION_DELAY_EXIT );
	};

	const handleDismissPanel = () => {
		dismissPanelWithDelay();
		updateFeedbackPanelHibernationDelay();
	};

	const handleLeaveReview = () => {
		setIsFloatingPanelOpen( false );
		window.open( FEEDBACK_LEAVE_REVIEW_URL );
	};

	const handleSendFeedback = () => {
		setIsFloatingPanelOpen( false );
		setIsFeedbackModalOpen( true );
	};

	const handleCloseModalDialog = () => {
		setIsFeedbackModalOpen( false );
	};

	return (
		<div className="stats-feedback-container">
			<FeedbackCard onLeaveReview={ handleLeaveReview } onSendFeedback={ handleSendFeedback } />
			<FeedbackPanel
				isOpen={ isFloatingPanelOpen }
				onDismissPanel={ handleDismissPanel }
				onLeaveReview={ handleLeaveReview }
				onSendFeedback={ handleSendFeedback }
			/>
			{ isFeedbackModalOpen && (
				<FeedbackModal siteId={ siteId } onClose={ handleCloseModalDialog } />
			) }
		</div>
	);
}

const FEEDBACK_HIGH_TRAFFIC_SITE_THRESHOLD = 10000;

function getHighTrafficThreshold() {
	const value = Number( localStorage.getItem( 'StatsHighTrafficThreshold' ) );
	return value !== 0 ? value : FEEDBACK_HIGH_TRAFFIC_SITE_THRESHOLD;
}

interface FeedbackPresentorProps {
	siteId: number;
}

function StatsFeedbackPresentor( { siteId }: FeedbackPresentorProps ) {
	const { supportCommercialUse } = useStatsPurchases( siteId );
	const { isJetpackNotAtomic, isVip } = useSiteTypes( siteId );
	const { data, isSuccess } = useHighlightsQuery( siteId );

	const views = data?.past_thirty_days.views ?? 0;
	const highTrafficThreshold = useMemo( () => getHighTrafficThreshold(), [] );
	const isHighTrafficSite = isSuccess && views > highTrafficThreshold;
	const presentForHighTrafficSite = isHighTrafficSite && isJetpackNotAtomic && ! isVip;

	if ( ! supportCommercialUse && ! presentForHighTrafficSite ) {
		return null;
	}

	return <StatsFeedbackController siteId={ siteId } />;
}

export default StatsFeedbackPresentor;
