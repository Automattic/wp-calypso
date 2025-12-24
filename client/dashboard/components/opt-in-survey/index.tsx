import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { Notice } from '../notice';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const RESHOW_AFTER_DAYS = 7;
const DISMISSED_KEY = 'dashboard-opt-in-survey-dismissed';

const canUseLocalStorage = () =>
	typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const getDismissedAt = () => {
	if ( ! canUseLocalStorage() ) {
		return null;
	}

	try {
		const value = window.localStorage.getItem( DISMISSED_KEY );
		if ( ! value ) {
			return null;
		}

		const dismissedAt = Number( value );
		return Number.isFinite( dismissedAt ) && dismissedAt > 0 ? dismissedAt : null;
	} catch {
		return null;
	}
};

const clearDismissedAt = () => {
	if ( ! canUseLocalStorage() ) {
		return;
	}

	try {
		window.localStorage.removeItem( DISMISSED_KEY );
	} catch {
		// ignore
	}
};

const setDismissedAt = ( dismissedAt: number ) => {
	if ( ! canUseLocalStorage() ) {
		return;
	}

	try {
		window.localStorage.setItem( DISMISSED_KEY, String( dismissedAt ) );
	} catch {
		// If localStorage isn't available (privacy mode, blocked, etc.),
		// we still allow the dismiss for this session via component state.
	}
};

const getIsDismissed = () => {
	const dismissedAt = getDismissedAt();
	if ( dismissedAt === null ) {
		return false;
	}

	const expiresAt = dismissedAt + RESHOW_AFTER_DAYS * DAY_IN_MS;
	if ( Date.now() >= expiresAt ) {
		clearDismissedAt();
		return false;
	}

	return true;
};

export default function OptInSurvey() {
	const { recordTracksEvent } = useAnalytics();
	const [ isDismissed, setIsDismissedState ] = useState( () => getIsDismissed() );
	const [ hasBeenVisible, setHasBeenVisible ] = useState( false );
	const shouldBeVisible = true;

	useEffect( () => {
		if ( shouldBeVisible ) {
			setHasBeenVisible( true );
		}
	}, [ shouldBeVisible ] );

	useEffect( () => {
		setIsDismissedState( getIsDismissed() );
	}, [] );

	if ( isDismissed || ! hasBeenVisible ) {
		return null;
	}

	const calloutTitle = __( 'We’d love to hear your thoughts.' );

	const setDismissedNow = () => {
		setIsDismissedState( true );
		setDismissedAt( Date.now() );
	};

	const dismiss = () => {
		recordTracksEvent( 'calypso_dashboard_opt_in_survey_dismiss_click' );
		setDismissedNow();
	};

	const takeSurvey = () => {
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
						onClick={ takeSurvey }
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
