import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import blogPostComments from 'calypso/assets/images/jetpack/block-post-comments.svg';
import Banner from 'calypso/components/banner';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { FunctionComponent } from 'react';

import '../style.scss';

const AgenciesSurveyBanner: FunctionComponent = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isAgency = useSelector( isAgencyUser );

	if ( ! isAgency ) {
		return null;
	}

	const surveyUrl =
		'https://jetpaolo.survey.fm/jetpack-vaultpress-backup-survey-for-agencies-builders';

	return (
		<Banner
			className="backup__agencies-survey-banner"
			callToAction={ translate( 'Take our quick survey' ) }
			title={ translate( 'Agencies & Builders: Help us make VaultPress Backup better' ) }
			description={ translate(
				'What can we do to make your job easier by improving our products & tools?'
			) }
			href={ surveyUrl }
			iconPath={ blogPostComments }
			dismissPreferenceName={ `agencies-survey-banner-${ siteId }` }
			event="calypso_backup_agencies_survey_banner"
			tracksImpressionName="calypso_backup_agencies_survey_banner_view"
			tracksDismissName="calypso_backup_agencies_survey_banner_dismiss"
			tracksClickName="calypso_backup_agencies_survey_banner_click"
			horizontal
		/>
	);
};

export default AgenciesSurveyBanner;
