import Banner from 'calypso/components/banner';
import './survey.scss';

interface Props {
	setSurveyDismissed: ( dismissed: boolean ) => void;
}

const Survey = ( { setSurveyDismissed }: Props ) => {
	return (
		<Banner
			className="pattern-assembler__survey"
			// Translation to other locales is not required
			title={
				<>
					<a href="https://lucasmdo.survey.fm/assembler-survey-modal" target="blank">
						Fill out this quick survey
					</a>{ ' ' }
					and help us to improve our product.
				</>
			}
			event="assembler-june-2023"
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
