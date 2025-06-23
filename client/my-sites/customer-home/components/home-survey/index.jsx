import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import moment from 'moment';
import SurveyModal from 'calypso/components/survey-modal';
import { useSelector } from 'calypso/state';
import { isA8cTeamMember } from 'calypso/state/teams/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import homeSurveyImage from './assets/images/home-survey.png';

const HomeSurvey = () => {
	const { __ } = useI18n();
	const site = useSelector( getSelectedSite );
	const isEnglishLocale = useIsEnglishLocale();
	const isSiteLaunched = site?.launch_status === 'launched';
	const isSiteCreatedInLast3Days =
		site?.options?.created_at && moment().diff( moment( site?.options?.created_at ), 'days' ) <= 3;
	const isLastActivityWithin2Days =
		site?.options?.updated_at && moment().diff( moment( site?.options?.updated_at ), 'days' ) <= 2;
	const isTwentyTwentyFiveTheme = site?.options?.theme_slug === 'pub/twentytwentyfive'; // The old default theme.
	const isRetrospectTheme = site?.options?.theme_slug === 'pub/retrospect'; // The new default theme. See 185017-ghe-Automattic/wpcom.
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
			title={ __( 'Shape the Future of WordPress.com' ) }
			description={ __(
				'Are you interested in participating in a research interview and earning a $50 credit on your WordPress.com account? We are looking for feedback!'
			) }
			surveyImage={ homeSurveyImage }
			surveyImageAlt={ __( 'WordPress.com Survey' ) }
			url="https://app.lyssna.com/apply/d82b7c11c07a0fb5"
			dismissText={ __( 'No thanks' ) }
			confirmText={ __( 'Yes, I want to participate' ) }
			showOverlay={ false }
		/>
	);
};

export default HomeSurvey;
