import { useLocale } from '@automattic/i18n-utils';
import { getSiteLaunchStatus } from '@automattic/sites';
import { translate } from 'i18n-calypso';
import ReactDOM from 'react-dom';
import SurveyModal from 'calypso/components/survey-modal';
import { useSelector } from 'calypso/state';
import { getSiteOptions, getSitePlanSlug } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export function BusinessMerchantLaunchSurveyModal() {
	const localeSlug = useLocale();
	const site = useSelector( getSelectedSite );
	const planSlug = useSelector( ( state ) => getSitePlanSlug( state, site?.ID ) );
	const createdAt = useSelector( ( state ) => getSiteOptions( state, site?.ID )?.created_at );
	const launchStatus = getSiteLaunchStatus( site );

	if ( localeSlug !== 'en' ) {
		return null;
	}

	// TODO: use the following variables to determine whether to show the modal and what survey link to show.
	console.log( { planSlug, launchStatus, createdAt } );

	const title = translate( 'Help us serve you better' );
	const description = translate(
		'Got a minute? Take our short 6-question survey and let us know how we can make your experience even better.'
	);
	const surveyUrl = 'https://automattic.survey.fm/xxx';

	return ReactDOM.createPortal(
		<SurveyModal
			name="business-merchant-launch-survey"
			url={ surveyUrl }
			title={ title }
			description={ description }
			dismissText={ translate( 'Dismiss' ) }
			confirmText={ translate( 'Start the survey' ) }
			showOverlay={ false }
		/>,
		document.body
	);
}
