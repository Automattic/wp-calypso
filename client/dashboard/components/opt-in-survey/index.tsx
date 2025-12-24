import { userPreferenceQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { Notice } from '../notice';

const DISMISSED_AT_KEY = 'dashboard-opt-in-survey-dismissed-at';
const DISMISSED_COUNT_KEY = 'dashboard-opt-in-survey-dismissed-count';

const RESHOW_AFTER_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
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

function checkEligible( welcomeNoticeDismissedAt: string ) {
	const { dismissedAt, dismissedCount } = getSurveyDismissal();

	if ( dismissedCount >= MAX_DISMISSES ) {
		return false;
	}

	const lastDismissedDate = new Date( dismissedAt || welcomeNoticeDismissedAt );
	return Date.now() >= lastDismissedDate.getTime() + RESHOW_AFTER_MS;
}

export default function OptInSurvey() {
	const { recordTracksEvent } = useAnalytics();
	const [ isDismissed, setIsDismissed ] = useState( false );
	const [ isEligible, setIsEligible ] = useState( false );

	const { data: welcomeNoticeDismissedAt } = useSuspenseQuery(
		userPreferenceQuery( 'hosting-dashboard-welcome-notice-dismissed' )
	);

	useEffect( () => {
		if ( ! welcomeNoticeDismissedAt ) {
			return;
		}

		if ( checkEligible( welcomeNoticeDismissedAt ) ) {
			setIsEligible( true );
		}
	}, [ welcomeNoticeDismissedAt ] );

	if ( ! isEligible || isDismissed ) {
		return null;
	}

	const calloutTitle = __( 'We’d love to hear your thoughts.' );

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

	return (
		<Notice
			title={ calloutTitle }
			onClose={ dismiss }
			actions={
				<HStack spacing="3" justify="flex-start" expanded={ false }>
					<Button
						variant="primary"
						href="https://automattic.survey.fm/msd-survey-for-opt-in-opt-out"
						target="_blank"
						rel="noopener noreferrer"
						onClick={ confirm }
					>
						{ __( 'Take the survey' ) }
					</Button>
					<Button variant="secondary" onClick={ dismiss }>
						{ __( 'Dismiss' ) }
					</Button>
				</HStack>
			}
		>
			{ __( 'Fill out this quick survey to help us improve.' ) }
		</Notice>
	);
}
