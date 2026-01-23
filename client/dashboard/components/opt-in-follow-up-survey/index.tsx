import { userPreferenceQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../button-stack';
import { Notice } from '../notice';

const DISMISSED_AT_KEY = 'dashboard-opt-in-follow-up-survey-dismissed-at';
const DISMISSED_COUNT_KEY = 'dashboard-opt-in-follow-up-survey-dismissed-count';

const RESHOW_AFTER_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_DISMISSES = 2;
const OPT_IN_DELAY_MS = 14 * 24 * 60 * 60 * 1000; // 14 days after opt-in

const canUseLocalStorage = () =>
	typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function getSurveyDismissal(): { dismissedAt: number | null; dismissedCount: number } {
	if ( ! canUseLocalStorage() ) {
		return { dismissedAt: null, dismissedCount: 0 };
	}

	try {
		const dismissedAt = parseInt( window.localStorage.getItem( DISMISSED_AT_KEY ) || '0' );
		const dismissedCount = parseInt( window.localStorage.getItem( DISMISSED_COUNT_KEY ) || '0' );

		return { dismissedAt, dismissedCount };
	} catch {
		return { dismissedAt: null, dismissedCount: 0 };
	}
}

function dismissSurvey() {
	if ( ! canUseLocalStorage() ) {
		return;
	}

	try {
		const { dismissedCount } = getSurveyDismissal();
		window.localStorage.setItem( DISMISSED_AT_KEY, String( Date.now() ) );
		window.localStorage.setItem( DISMISSED_COUNT_KEY, String( dismissedCount + 1 ) );
	} catch {
		// ignore
	}
}

function checkEligible( optInPreference: { value?: string; updated_at?: string } | null ) {
	// Must have opted in
	if ( ! optInPreference || optInPreference.value !== 'opt-in' ) {
		return false;
	}

	// Must have an opt-in date and it must be at least 14 days ago
	const optInDate = optInPreference.updated_at ? new Date( optInPreference.updated_at ) : null;
	if ( ! optInDate || Date.now() < optInDate.getTime() + OPT_IN_DELAY_MS ) {
		return false;
	}

	const { dismissedAt, dismissedCount } = getSurveyDismissal();

	if ( dismissedCount >= MAX_DISMISSES ) {
		return false;
	}

	// If previously dismissed, wait 7 days before showing again
	if ( dismissedAt && Date.now() < dismissedAt + RESHOW_AFTER_MS ) {
		return false;
	}

	return true;
}

export default function OptInFollowUpSurvey() {
	const { recordTracksEvent } = useAnalytics();
	const [ isDismissed, setIsDismissed ] = useState( false );

	const { data: optInPreference } = useSuspenseQuery(
		userPreferenceQuery( 'hosting-dashboard-opt-in' )
	);

	const [ isEligible ] = useState( () => checkEligible( optInPreference ) );

	if ( ! isEligible || isDismissed ) {
		return null;
	}

	const setDismissedNow = () => {
		setIsDismissed( true );
		dismissSurvey();
	};

	const dismiss = () => {
		recordTracksEvent( 'calypso_dashboard_opt_in_follow_up_survey_dismiss_click' );
		setDismissedNow();
	};

	const confirm = () => {
		recordTracksEvent( 'calypso_dashboard_opt_in_follow_up_survey_take_click' );
		setDismissedNow();
	};

	return (
		<Notice
			title={ __( "How's your experience with the Hosting Dashboard after a few weeks?" ) }
			onClose={ dismiss }
			actions={
				<ButtonStack justify="flex-start">
					<Button
						variant="primary"
						size="compact"
						href="https://automattic.survey.fm/msd-survey-for-opt-in-after-2-weeks"
						target="_blank"
						rel="noopener noreferrer"
						onClick={ confirm }
					>
						{ __( 'Take the survey' ) }
					</Button>
					<Button variant="secondary" size="compact" onClick={ dismiss }>
						{ __( 'Dismiss' ) }
					</Button>
				</ButtonStack>
			}
		>
			{ __( 'Share your feedback to help us improve the long-term experience.' ) }
		</Notice>
	);
}
