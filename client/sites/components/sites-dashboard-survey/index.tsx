import { isEnabled } from '@automattic/calypso-config';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import ReactDOM from 'react-dom';
import SurveyModal from 'calypso/components/survey-modal';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { isEligibleForProductSampling } from 'calypso/utils';
import surveySitesDashboardImage from './assets/images/survey-sites-dashboard.svg';

const SitesDashboardSurvey = () => {
	const isEnglishLocale = useIsEnglishLocale();
	const userId = useSelector( getCurrentUserId );

	const urlParams = new URLSearchParams( window.location.search );
	const isEligibleSurvey =
		isEnabled( 'sites/dashboard-survey' ) &&
		isEnglishLocale &&
		userId &&
		( isEligibleForProductSampling( userId, 15 ) || urlParams.has( 'show_survey' ) );

	if ( ! isEligibleSurvey ) {
		return null;
	}

	return ReactDOM.createPortal(
		<SurveyModal
			name="survey-sites-dashboard"
			eventName="calypso_survey_sites_dashboard"
			title="Shape the Future of WordPress.com"
			description="Got a minute? We’d love to get your feedback on some upcoming changes to the WordPress.com dashboard."
			surveyImage={ surveySitesDashboardImage }
			surveyImageAlt="WordPress.com dashboard"
			url="https://wordpressdotcom.crowdsignal.net/wordpress-com-dashboard-feedback"
			dismissText="No thanks"
			confirmText="Take survey"
			showOverlay={ false }
		/>,
		document.body
	);
};

export default SitesDashboardSurvey;
