import Main from 'calypso/components/main';
import SegmentationSurvey from 'calypso/components/segmentation-survey';
import type { Step } from '../../types';
import './style.scss';

const SURVEY_KEY = 'entrepreneur-trial';

const SegmentationSurveyStep: Step = ( { navigation } ) => {
	return (
		<Main className="segmentation-survey-step">
			<SegmentationSurvey
				surveyKey={ SURVEY_KEY }
				onBack={ navigation.goBack }
				onComplete={ navigation.submit }
			/>
		</Main>
	);
};

export default SegmentationSurveyStep;
