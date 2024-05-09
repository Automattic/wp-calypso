import { translate } from 'i18n-calypso';
import { useState } from 'react';
import Banner from 'calypso/components/banner';
import './survey.scss';

export enum SurveyType {
	DECEMBER_2023 = 'DECEMBER_2023',
	FEBRUARY_2024 = 'FEBRUARY_2024',
	MARCH_2024 = 'MARCH_2024',
}

const surveys = new Map< SurveyType, { eventName: string; eventUrl: string } >( [
	[
		SurveyType.DECEMBER_2023,
		{
			eventName: 'theme-showcase-december-2023',
			eventUrl: 'https://automattic.survey.fm/lits-survey-v1',
		},
	],
	[
		SurveyType.FEBRUARY_2024,
		{
			eventName: 'theme-showcase-february-2024',
			eventUrl: 'https://automattic.survey.fm/lits-survey-v2',
		},
	],
	[
		SurveyType.MARCH_2024,
		{
			eventName: 'theme-showcase-march-2024',
			eventUrl: 'https://automattic.survey.fm/lits-survey-v2-march',
		},
	],
] );

type SurveyProps = {
	survey: SurveyType;
	condition: () => boolean;
	title?: string | null;
};

/**
 * We lose the state of whether the survey has been dismissed when navigating between pages.
 * We also lose the state when navigating between the theme showcase and the theme details page because of all the re-renders and unmounts.
 * This is a temporary solution to prevent the survey from showing up again after it's been dismissed.
 */
let isVisible = false;
let isGloballyDismissed = false;

const Survey = ( { survey, condition, title = null }: SurveyProps ) => {
	const surveyData = surveys.get( survey );
	const [ isDismissed, setIsDismissed ] = useState( isGloballyDismissed );

	if ( ! isVisible && condition() ) {
		isVisible = true;
	}

	if ( isDismissed || ! isVisible || ! surveyData ) {
		return null;
	}

	const defaultTitle = translate(
		'We’d love to hear your thoughts. Fill out this {{a}}quick survey{{/a}} on your theme selection experience.',
		{
			components: {
				a: <a href={ surveyData.eventUrl } target="blank" />,
			},
		}
	);

	return (
		<Banner
			className="theme-showcase__survey"
			title={ title || defaultTitle }
			onDismiss={ ( e: Event ) => {
				e.stopPropagation();
				setIsDismissed( true );
				isGloballyDismissed = true;
			} }
			dismissWithoutSavingPreference
			dismissTemporary
			disableHref
			showIcon={ false }
			showLinkIcon={ false }
		/>
	);
};

export default Survey;
