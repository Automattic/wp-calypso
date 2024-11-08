import { useLocale } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import { translate } from 'i18n-calypso';
import ReactDOM from 'react-dom';
import SurveyModal from 'calypso/components/survey-modal';

export const GitHubDeploymentSurvey = () => {
	const localeSlug = useLocale();
	const { hasTranslation } = useI18n();

	if ( localeSlug !== 'en' ) {
		return null;
	}

	const title = hasTranslation( 'Share your thoughts on GitHub Deployments' )
		? translate( 'Share your thoughts on GitHub Deployments' )
		: translate( 'Hey Developer!' );

	const description = hasTranslation(
		'Got a moment? We’d love to hear about your experience using GitHub Deployments in our quick survey.'
	)
		? translate(
				'Got a moment? We’d love to hear about your experience using GitHub Deployments in our quick survey.'
		  )
		: translate(
				'Got a moment? How do you like using GitHub Deployments so far? Share your thoughts with us in our quick survey.'
		  );

	return ReactDOM.createPortal(
		<SurveyModal
			name="github-deployments"
			url="https://automattic.survey.fm/github-deployments-survey?initiated-from=calypso"
			title={ title }
			description={ description }
			dismissText={ translate( 'Remind later' ) }
			confirmText={ translate( 'Take survey' ) }
			showOverlay={ false }
		/>,
		document.body
	);
};
