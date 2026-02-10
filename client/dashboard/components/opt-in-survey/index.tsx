import { userPreferenceQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useAppContext } from '../../app/context';
import { ButtonStack } from '../button-stack';
import { Notice } from '../notice';

const DISMISSED_AT_KEY = 'dashboard-opt-in-survey-dismissed-at';
const DISMISSED_COUNT_KEY = 'dashboard-opt-in-survey-dismissed-count';

const RESHOW_AFTER_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const FOLLOW_UP_AFTER_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const MAX_DISMISSES = 2;

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

function checkEligible( welcomeNoticeDismissedAt: string | null ) {
	if ( ! welcomeNoticeDismissedAt ) {
		return false;
	}

	const { dismissedAt, dismissedCount } = getSurveyDismissal();

	if ( dismissedCount >= MAX_DISMISSES ) {
		return false;
	}

	const lastDismissedDate = new Date( dismissedAt || welcomeNoticeDismissedAt );
	return Date.now() >= lastDismissedDate.getTime() + RESHOW_AFTER_MS;
}

export default function OptInSurvey() {
	const { optIn } = useAppContext();
	const { recordTracksEvent } = useAnalytics();
	const [ isDismissed, setIsDismissed ] = useState( false );

	const { data: dashboardOptIn } = useSuspenseQuery(
		userPreferenceQuery( 'hosting-dashboard-opt-in' )
	);
	const { data: welcomeNoticeDismissedAt } = useSuspenseQuery(
		userPreferenceQuery( 'hosting-dashboard-welcome-notice-dismissed' )
	);

	const [ isEligible ] = useState( () =>
		checkEligible(
			dashboardOptIn?.value === 'forced-opt-in'
				? dashboardOptIn?.updated_at
				: welcomeNoticeDismissedAt
		)
	);

	if ( ! optIn || ! isEligible || isDismissed ) {
		return null;
	}

	const welcomeNoticeDismissedTime = welcomeNoticeDismissedAt
		? new Date( welcomeNoticeDismissedAt ).getTime()
		: 0;
	const isFollowUp = Date.now() >= welcomeNoticeDismissedTime + FOLLOW_UP_AFTER_MS;

	const setDismissedNow = () => {
		setIsDismissed( true );
		dismissSurvey();
	};

	const dismiss = () => {
		recordTracksEvent( 'calypso_dashboard_opt_in_survey_dismiss_click' );
		setDismissedNow();
	};

	const confirm = () => {
		recordTracksEvent( 'calypso_dashboard_opt_in_survey_take_click' );
		setDismissedNow();
	};

	const surveyUrl = isFollowUp
		? 'https://automattic.survey.fm/msd-survey-for-opt-in-after-2-weeks'
		: 'https://automattic.survey.fm/msd-survey-for-opt-in';

	return (
		<Notice
			title={
				dashboardOptIn?.value === 'forced-opt-in'
					? __( 'How’s your experience with the Hosting Dashboard?' )
					: __( 'How’s your experience with the new Hosting Dashboard?' )
			}
			onClose={ dismiss }
			actions={
				<ButtonStack justify="flex-start">
					<Button
						variant="primary"
						size="compact"
						href={ surveyUrl }
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
			{ __( 'Fill out this quick survey to help us improve.' ) }
		</Notice>
	);
}
