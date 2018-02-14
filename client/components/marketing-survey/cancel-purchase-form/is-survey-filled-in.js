/** @format */

export default function isSurveyFilledIn( survey ) {
	const answeredBothQuestions = survey.questionOneRadio && survey.questionTwoRadio;

	if ( survey.questionOneRadio === 'anotherReasonOne' && survey.questionOneText === '' ) {
		return false;
	}

	if ( survey.questionTwoRadio === 'anotherReasonTwo' && survey.questionTwoText === '' ) {
		return false;
	}

	if (
		survey.questionOneRadio &&
		survey.questionTwoOrder &&
		survey.questionTwoOrder.length === 0
	) {
		return true;
	}

	if ( ! answeredBothQuestions ) {
		return false;
	}

	return true;
}
