import { IMPORT_HOSTED_SITE_FLOW, NEWSLETTER_FLOW } from '@automattic/onboarding';
import { useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import SegmentationSurvey from 'calypso/components/segmentation-survey';
import { SKIP_ANSWER_KEY } from 'calypso/components/segmentation-survey/constants';
import useSegmentationSurveyTracksEvents from 'calypso/components/segmentation-survey/hooks/use-segmentation-survey-tracks-events';
import { flowQuestionComponentMap } from 'calypso/components/survey-container/components/question-step-mapping';
import { QuestionConfiguration } from 'calypso/components/survey-container/types';
import useGuidedFlowGetSegment from 'calypso/signup/hooks/use-guided-flow-get-segment';
import StepWrapper from 'calypso/signup/step-wrapper';
import './styles.scss';
import { GUIDED_FLOW_SEGMENTATION_SURVEY_KEY } from './constants';

interface Props {
	flowName: string;
	stepName: string;
	goToNextStep: () => void;
	submitSignupStep: ( step: any, deps: any ) => void;
	signupDependencies: Record<
		string,
		{
			segmentationSurveyAnswers: Record< string, string[] >;
		}
	>;
}

const SURVEY_KEY = 'guided-onboarding-flow';

const QUESTION_CONFIGURATION: QuestionConfiguration = {
	'what-brings-you-to-wordpress': {
		hideContinue: true,
		hideSkip: false,
		exitOnSkip: true,
	},
	'what-are-your-goals': {
		hideContinue: false,
		hideSkip: false,
	},
};

export default function InitialIntentStep( props: Props ) {
	const { submitSignupStep, stepName, signupDependencies, flowName } = props;
	const currentAnswers = signupDependencies.segmentationSurveyAnswers || {};
	const translate = useTranslate();
	const headerText = translate( 'What brings you to WordPress.com?' );
	const subHeaderText = translate(
		'This will help us tailor your onboarding experience to your needs.'
	);

	const { recordStartEvent, recordCompleteEvent } = useSegmentationSurveyTracksEvents(
		GUIDED_FLOW_SEGMENTATION_SURVEY_KEY
	);

	// Record Tracks start event on component mount
	useEffect( () => {
		recordStartEvent();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const getRedirectForAnswers = ( _answerKeys: string[] ): string => {
		if ( _answerKeys.includes( 'migrate-or-import-site' ) ) {
			return `/setup/${ IMPORT_HOSTED_SITE_FLOW }`;
		}

		if ( _answerKeys.includes( 'newsletter' ) ) {
			return `/setup/${ NEWSLETTER_FLOW }`;
		}

		if ( _answerKeys.includes( 'sell' ) && _answerKeys.includes( 'difm' ) ) {
			return '/start/do-it-for-me-store';
		}

		if ( _answerKeys.includes( 'difm' ) ) {
			return '/start/do-it-for-me';
		}

		return '';
	};

	const shouldExitOnSkip = ( _questionKey: string, _answerKeys: string[] ) => {
		return Boolean(
			QUESTION_CONFIGURATION[ _questionKey ].exitOnSkip && _answerKeys.includes( SKIP_ANSWER_KEY )
		);
	};

	const skipNextNavigation = ( _questionKey: string, _answerKeys: string[] ) => {
		return (
			_answerKeys.includes( 'client' ) ||
			Boolean( getRedirectForAnswers( _answerKeys ) ) ||
			shouldExitOnSkip( _questionKey, _answerKeys )
		);
	};

	const handleNext = ( _questionKey: string, _answerKeys: string[], isLastQuestion?: boolean ) => {
		const redirect = getRedirectForAnswers( _answerKeys );

		const newAnswers = { [ _questionKey ]: _answerKeys };

		submitSignupStep(
			{ flowName, stepName },
			{ segmentationSurveyAnswers: { ...currentAnswers, ...newAnswers } }
		);

		if ( redirect ) {
			recordCompleteEvent();
			return window.location.assign( redirect );
		}

		if (
			_answerKeys.includes( 'client' ) ||
			isLastQuestion ||
			shouldExitOnSkip( _questionKey, _answerKeys )
		) {
			recordCompleteEvent();
			props.goToNextStep();
		}
	};

	return (
		<StepWrapper
			hideFormattedHeader
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={
				<SegmentationSurvey
					surveyKey={ SURVEY_KEY }
					onNext={ handleNext }
					skipNextNavigation={ skipNextNavigation }
					questionConfiguration={ QUESTION_CONFIGURATION }
					questionComponentMap={ flowQuestionComponentMap }
				/>
			}
			align="center"
			hideSkip
			{ ...props }
		/>
	);
}
