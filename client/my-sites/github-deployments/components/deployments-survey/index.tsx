import { useLocale } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import ReactDOM from 'react-dom';
import SurveyModal from 'calypso/components/survey-modal';

export const GitHubDeploymentSurvey = () => {
	const localeSlug = useLocale();

	if ( localeSlug !== 'en' ) {
		return null;
	}

	return ReactDOM.createPortal(
		<SurveyModal
			name="github-deployments"
			url="https://automattic.survey.fm/github-deployments-survey?initiated-from=calypso"
			title={ translate( 'Hey Developer!' ) }
			description={ translate(
				`Got a moment? How do you like using GitHub Deployments so far? Share your thoughts with us in our quick survey.`
			) }
			dismissText={ translate( 'Remind later' ) }
			confirmText={ translate( 'Take survey' ) }
			showOverlay={ false }
		/>,
		document.body
	);
};
