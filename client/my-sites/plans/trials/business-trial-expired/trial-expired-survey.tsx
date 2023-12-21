import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Dialog } from '@automattic/components';
import { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

const CALYPSO_TRIAL_SURVEY_PREFERENCE = 'calypso_business_expired_trial_survey_dismissed';

export const TrialExpiredSurveyDialog = () => {
	const translate = useTranslate();
	const buttons = [
		{ action: 'dismiss', label: translate( 'Dismiss' ) },
		{ action: 'take-survey', label: translate( 'Take survey' ), isPrimary: true },
	];

	const dispatch = useDispatch();

	const preferenceName = CALYPSO_TRIAL_SURVEY_PREFERENCE;

	const isDismissed = useSelector( ( state ) => getPreference( state, preferenceName ) ) ?? false;

	const dismissAndRecordEvent = ( dialogAction: string | undefined ) => {
		dispatch( savePreference( preferenceName, true ) );

		let eventName = 'calypso_business_expired_trial_survey_dismissed';

		if ( dialogAction === 'take-survey' ) {
			eventName = 'calypso_business_expired_trial_survey_taken';
			// Open a new window to the survey URL
			window.open( 'https://automattic.survey.fm/business-trial-survey', '_blank' );
		}

		//dispatch( recordTracksEvent( eventName ) );
	};

	// This survey is only available in English only.
	const isEnglishLocale = getLocaleSlug() === 'en' || getLocaleSlug() === 'en-gb';

	if ( isDismissed || ! isEnglishLocale ) {
		return null;
	}

	return (
		<Dialog
			isVisible={ ! isDismissed }
			buttons={ buttons }
			onClose={ dismissAndRecordEvent }
			className="delete-site-warning-dialog"
		>
			<h1>{ translate( 'Trial Expired' ) }</h1>
			<p>
				{ translate(
					'Take this 2 minute survey to help us better understand your experience during the plaform.'
				) }
			</p>
		</Dialog>
	);
};
