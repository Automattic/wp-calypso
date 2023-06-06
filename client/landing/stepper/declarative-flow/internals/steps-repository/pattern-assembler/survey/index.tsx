import { useLocale } from '@automattic/i18n-utils';
import Banner from 'calypso/components/banner';
import './survey.scss';

interface Props {
	setSurveyDismissed: ( dismissed: boolean ) => void;
}

const Survey = ( { setSurveyDismissed }: Props ) => {
	const locale = useLocale();

	if ( 'en' !== locale ) {
		return null;
	}

	return (
		<Banner
			className="pattern-assembler__survey"
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
			showIcon={ false }
			dismissWithoutSavingPreference
			tracksImpressionName="calypso_onboarding_survey_impression"
			tracksClickName="calypso_onboarding_survey_click"
			tracksDismissName="calypso_onboarding_survey_dismiss"
		/>
	);
};

export default Survey;
