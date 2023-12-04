import React, { useState } from 'react';
import Banner from 'calypso/components/banner';
import './survey.scss';

export enum SurveyType {
	DECEMBER_2023 = 'DECEMBER_2023',
}

const surveys = new Map< SurveyType, { eventName: string; eventUrl: string } >( [
	[
		SurveyType.DECEMBER_2023,
		{
			eventName: 'theme-showcase-december-2023',
			eventUrl: 'https://automattic.survey.fm/lits-survey-v1',
		},
	],
] );

type SurveyProps = {
	survey: SurveyType;
	condition: () => boolean;
};

const Survey = ( { survey, condition }: SurveyProps ) => {
	const surveyData = surveys.get( survey );
	const [ surveyDismissed, setSurveyDismissed ] = useState( false );

	if ( ! surveyData || ! condition() || surveyDismissed ) {
		return null;
	}

	const title = // Translation to other locales is not required
		(
			<>
				We’d love to hear your thoughts. Fill out this{ ' ' }
				<a href={ surveyData.eventUrl } target="blank">
					quick survey
				</a>{ ' ' }
				on your theme selection experience.
			</>
		);

	return (
		<Banner
			className="theme-showcase__survey"
			title={ title }
			event={ surveyData.eventName }
			onDismiss={ ( e: Event ) => {
				e.stopPropagation();
				setSurveyDismissed( true );
			} }
			dismissWithoutSavingPreference={ true }
			dismissTemporary={ true }
			disableHref
			showIcon={ false }
			showLinkIcon={ false }
			tracksImpressionName="calypso_theme_showcase_survey_impression"
			tracksClickName="calypso_theme_showcase_survey_click"
			tracksDismissName="calypso_theme_showcase_survey_dismiss"
		/>
	);
};

export default Survey;
