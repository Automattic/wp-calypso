import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { Notice } from '../notice';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type SurveyProps = {
	surveyUrl: string;
	eventName: string;
	startDate?: Date | string;
	reshowAfterDays?: number;
	condition?: () => boolean;
	title?: string | null;
};

const getSurveyDismissedKey = ( eventName: string ) => `dashboard-survey-dismissed:${ eventName }`;

const canUseLocalStorage = () =>
	typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const getDismissedAt = ( eventName: string ) => {
	if ( ! canUseLocalStorage() ) {
		return null;
	}

	try {
		const value = window.localStorage.getItem( getSurveyDismissedKey( eventName ) );
		if ( ! value ) {
			return null;
		}

		const dismissedAt = Number( value );
		return Number.isFinite( dismissedAt ) && dismissedAt > 0 ? dismissedAt : null;
	} catch {
		return null;
	}
};

const clearDismissedAt = ( eventName: string ) => {
	if ( ! canUseLocalStorage() ) {
		return;
	}

	try {
		window.localStorage.removeItem( getSurveyDismissedKey( eventName ) );
	} catch {
		// ignore
	}
};

const setDismissedAt = ( eventName: string, dismissedAt: number ) => {
	if ( ! canUseLocalStorage() ) {
		return;
	}

	try {
		window.localStorage.setItem( getSurveyDismissedKey( eventName ), String( dismissedAt ) );
	} catch {
		// If localStorage isn't available (privacy mode, blocked, etc.),
		// we still allow the dismiss for this session via component state.
	}
};

const isPastStartDate = ( startDate?: Date | string ) => {
	if ( ! startDate ) {
		return true;
	}

	const parsed = startDate instanceof Date ? startDate : new Date( startDate );
	const startTime = parsed.getTime();
	if ( ! Number.isFinite( startTime ) ) {
		return false;
	}
	return Date.now() >= startTime;
};

const getIsDismissed = ( eventName: string, reshowAfterDays: number ) => {
	const dismissedAt = getDismissedAt( eventName );
	if ( dismissedAt === null ) {
		return false;
	}

	const expiresAt = dismissedAt + reshowAfterDays * DAY_IN_MS;
	if ( Date.now() >= expiresAt ) {
		clearDismissedAt( eventName );
		return false;
	}

	return true;
};

const Survey = ( {
	surveyUrl,
	eventName,
	startDate,
	reshowAfterDays = 7,
	condition = () => true,
	title = null,
}: SurveyProps ) => {
	const { recordTracksEvent } = useAnalytics();
	const [ isDismissed, setIsDismissedState ] = useState( () =>
		getIsDismissed( eventName, reshowAfterDays )
	);
	const [ hasBeenVisible, setHasBeenVisible ] = useState( false );
	const shouldBeVisible = useMemo( () => {
		return condition() && isPastStartDate( startDate );
	}, [ condition, startDate ] );

	useEffect( () => {
		if ( shouldBeVisible ) {
			setHasBeenVisible( true );
		}
	}, [ shouldBeVisible ] );

	useEffect( () => {
		setIsDismissedState( getIsDismissed( eventName, reshowAfterDays ) );
	}, [ eventName, reshowAfterDays ] );

	if ( isDismissed || ! hasBeenVisible ) {
		return null;
	}

	const calloutTitle = title ?? __( 'We’d love to hear your thoughts.' );

	const trackSurvey = ( tookSurvey: boolean ) => {
		recordTracksEvent( 'calypso_dashboard_survey', {
			eventName,
			tookSurvey,
		} );
	};

	const setDismissedNow = () => {
		setIsDismissedState( true );
		setDismissedAt( eventName, Date.now() );
	};

	const dismiss = () => {
		trackSurvey( false );
		setDismissedNow();
	};

	const takeSurvey = () => {
		trackSurvey( true );
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
						href={ surveyUrl }
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
};

export default Survey;
