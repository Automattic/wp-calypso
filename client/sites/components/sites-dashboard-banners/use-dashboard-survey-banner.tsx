import { Gridicon } from '@automattic/components';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { isCardDismissed } from 'calypso/blocks/dismissible-card/selectors';
import Banner from 'calypso/components/banner';

export function useDashboardSurveyBanner() {
	const id = 'dashboard-survey';
	const isEnglishLocale = useIsEnglishLocale();
	const isDashboardSurveyBannerDismissed = useSelector( isCardDismissed( id ) );

	return {
		id,
		shouldShow() {
			return isEnglishLocale && ! isDashboardSurveyBannerDismissed;
		},
		render() {
			return (
				<Banner
					callToAction={
						<HStack>
							<span>{ translate( 'Share feedback' ) }</span>
							<Gridicon style={ { top: '3px' } } icon="external" />
						</HStack>
					}
					className="sites-banner"
					description={ translate( 'Got a minute? Share your feedback in our short survey.' ) }
					dismissPreferenceName={ id }
					event="old-hosting-dashboard-survey"
					horizontal
					href="https://automattic.survey.fm/old-hosting-dashboard-survey"
					icon="info-outline"
					target="_blank"
					title=""
					tracksClickName="calypso_sites_dashboard_survey_banner_click"
				/>
			);
		},
	};
}
