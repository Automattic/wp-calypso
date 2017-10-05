/** @format */
export default function isSurveyFilledIn( survey ) {
	const answeredBothQuestions = survey.questionOneRadio && survey.questionTwoRadio;

	if ( ! answeredBothQuestions ) {
		return false;
	}

	if ( survey.questionOneRadio === 'anotherReasonOne' && survey.questionOneText === '' ) {
		return false;
	}

	if ( survey.questionTwoRadio === 'anotherReasonTwo' && survey.questionTwoText === '' ) {
		return false;
	}

	return true;
}
