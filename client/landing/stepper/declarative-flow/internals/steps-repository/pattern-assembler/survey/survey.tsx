import { useLocale } from '@automattic/i18n-utils';
import { useState } from 'react';
import Banner from 'calypso/components/banner';
import './survey.scss';

const Survey = () => {
	const locale = useLocale();
	const [ dismissed, setDismissed ] = useState( false );

	if ( 'en' !== locale || dismissed ) {
		return null;
	}

	return (
		<Banner
			className="pattern-assembler__survey"
			// href="https://lucasmdo.survey.fm/assembler-survey-modal"
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
				setDismissed( true );
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
