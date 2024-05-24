import { IMPORT_HOSTED_SITE_FLOW, NEWSLETTER_FLOW } from '@automattic/onboarding';
import { useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import SegmentationSurvey from 'calypso/components/segmentation-survey';
import useSegmentationSurveyTracksEvents from 'calypso/components/segmentation-survey/hooks/use-segmentation-survey-tracks-events';
import StepWrapper from 'calypso/signup/step-wrapper';
import './styles.scss';

interface Props {
	stepName: string;
	goToNextStep: () => void;
}

const SURVEY_KEY = 'guided-onboarding-flow';

export default function InitialIntentStep( props: Props ) {
	const translate = useTranslate();
	const headerText = translate( 'What brings you to WordPress.com?' );
	const subHeaderText = translate(
		'This will help us tailor your onboarding experience to your needs.'
	);

	const { recordStartEvent, recordCompleteEvent } = useSegmentationSurveyTracksEvents( SURVEY_KEY );

	// Record Tracks start event on component mount
	useEffect( () => {
		recordStartEvent();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const getRedirectForAnswers = ( _answerKeys: string[] ): string => {
		if ( _answerKeys.includes( 'migrate-or-import-site' ) ) {
			return `/setup/${ IMPORT_HOSTED_SITE_FLOW }`;
		}

		if ( _answerKeys.includes( 'client' ) ) {
			// return `/setup/${ IMPORT_HOSTED_SITE_FLOW }`;
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

	const skipNextNavigation = ( _questionKey: string, _answerKeys: string[] ) => {
		return Boolean( getRedirectForAnswers( _answerKeys ) );
	};

	const handleNext = ( _questionKey: string, _answerKeys: string[], isLastQuestion?: boolean ) => {
		const redirect = getRedirectForAnswers( _answerKeys );

		if ( redirect ) {
			window.location.assign( redirect );
		}

		if ( isLastQuestion ) {
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
				/>
			}
			align="center"
			hideSkip
			{ ...props }
		/>
	);
}
