import Banner from 'calypso/components/banner';
import './survey.scss';

interface Props {
	eventName?: string;
	eventUrl?: string;
	title?: string | React.ReactNode;
	setSurveyDismissed: ( dismissed: boolean ) => void;
}

const Survey = ( { eventName, eventUrl, title, setSurveyDismissed }: Props ) => {
	if ( ! eventUrl ) {
		return null;
	}

	return (
		<Banner
			className="pattern-assembler__survey"
			title={
				title ? (
					title
				) : (
					// Translation to other locales is not required
					<>
						<a href={ eventUrl } target="blank">
							Fill out this quick survey
						</a>{ ' ' }
						and help us to improve our product.
					</>
				)
			}
			event={ eventName }
			onDismiss={ ( e: Event ) => {
				e.stopPropagation();
				setSurveyDismissed( true );
			} }
			dismissTemporary
			disableHref
			showIcon={ false }
			showLinkIcon={ false }
			dismissWithoutSavingPreference
			tracksImpressionName="calypso_onboarding_survey_impression"
			tracksClickName="calypso_onboarding_survey_click"
			tracksDismissName="calypso_onboarding_survey_dismiss"
		/>
	);
};

export default Survey;
