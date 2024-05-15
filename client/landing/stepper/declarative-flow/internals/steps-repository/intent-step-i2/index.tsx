import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { useSurveyStructureQuery } from 'calypso/data/segmentaton-survey';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE } from '../../../../stores';
import FlowCard from '../components/flow-card';
import type { Step } from '../../types';

import './styles.scss';

const SEGMENTATION_SURVEY_KEY = 'guided-onboarding-flow';

/**
 * The intent capture step - i2
 */
const IntentStep: Step = function IntentStep( { navigation } ) {
	const { submit } = navigation;
	const translate = useTranslate();
	const { setIntent } = useDispatch( ONBOARD_STORE );
	const { data: surveyQuestions } = useSurveyStructureQuery( {
		surveyKey: SEGMENTATION_SURVEY_KEY,
	} );

	const submitIntent = ( intent: string ) => {
		const providedDependencies = { intent };
		recordTracksEvent( 'calypso_signup_intent_select', providedDependencies );
		setIntent( intent );
		submit?.( providedDependencies, intent );
	};

	const intentHeader = () => {
		return (
			<FormattedHeader
				id="intent-header"
				headerText={ translate( 'What brings you to WordPress.com?' ) }
				subHeaderText={ translate(
					'This will help us tailor your onboarding experience to your needs.'
				) }
				align="center"
				subHeaderAlign="center"
			/>
		);
	};

	const intentScreenContent = () => {
		const intents = [ ...( surveyQuestions?.[ 0 ].options ?? [] ) ];

		return (
			<div className="site-intent">
				{ intents.map( ( intent ) => {
					return (
						<FlowCard
							title={ intent.label }
							text={ intent.helpText ?? '' }
							onClick={ () => {
								submitIntent( intent.value );
							} }
						/>
					);
				} ) }
			</div>
		);
	};

	return (
		<StepContainer
			stepName="intent-step"
			shouldHideNavButtons={ true }
			isHorizontalLayout={ false }
			formattedHeader={ intentHeader() }
			stepContent={ intentScreenContent() }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default IntentStep;
