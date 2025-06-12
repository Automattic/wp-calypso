import { useIsEnglishLocale } from '@automattic/i18n-utils';
import SurveyModal from 'calypso/components/survey-modal';
import { useSelector } from 'calypso/state';
import { isA8cTeamMember } from 'calypso/state/teams/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import homeSurveyImage from './assets/images/home-survey.png';

const HomeSurvey = () => {
	const site = useSelector( getSelectedSite );
	const isEnglishLocale = useIsEnglishLocale();
	const isSiteLaunched = site?.launch_status === 'launched' || false;
	const isSiteCreatedInLast3Days =
		site?.options?.created_at &&
		new Date( site.options.created_at ) > new Date( Date.now() - 3 * 24 * 60 * 60 * 1000 );
	const isLastActivityWithin2Days =
		site?.options?.updated_at &&
		new Date( site.options.updated_at ) > new Date( Date.now() - 2 * 24 * 60 * 60 * 1000 );
	const isTwentyTwentyFiveTheme = site?.options?.theme_slug === 'pub/twentytwentyfive' || false; // The old default theme.
	const isRetrospectTheme = site?.options?.theme_slug === 'pub/retrospect' || false; // The new default theme. See 185017-ghe-Automattic/wpcom.
	const isAutomattician = useSelector( isA8cTeamMember );

	const isEligibleForSurvey =
		isEnglishLocale &&
		isSiteLaunched &&
		isSiteCreatedInLast3Days &&
		isLastActivityWithin2Days &&
		! isTwentyTwentyFiveTheme &&
		! isRetrospectTheme &&
		! isAutomattician;

	const forceShowSurvey = window.location.search.includes( 'show_survey' );

	if ( ! isEligibleForSurvey && ! forceShowSurvey ) {
		return null;
	}

	return (
		<SurveyModal
			name="survey-home"
			eventName="calypso_survey_home"
			title="Shape the Future of WordPress.com"
			description="Are you interested in participating in a research interview and earning a $50 credit on your WordPress.com account? We are looking for feedback!"
			surveyImage={ homeSurveyImage }
			surveyImageAlt="WordPress.com Survey"
			url="https://app.lyssna.com/apply/d82b7c11c07a0fb5"
			dismissText="No thanks"
			confirmText="Yes, I want to participate"
			showOverlay={ false }
		/>
	);
};

export default HomeSurvey;
