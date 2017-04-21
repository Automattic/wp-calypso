export default function isSurveyFilledIn( survey ) {
	const answeredBothQuestions = survey.questionOneRadio && survey.questionTwoRadio;
	let needsText = false;

	if ( ! answeredBothQuestions ) {
		return false;
	}

	if ( survey.questionOneRadio === 'anotherReasonOne' && survey.questionOneText === '' ) {
		needsText = true;
	}

	if ( survey.questionTwoRadio === 'anotherReasonTwo' && survey.questionTwoText === '' ) {
		needsText = true;
	}

	return ! needsText;
}
