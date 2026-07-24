export type Survey = {
	questionOneRadio?: string;
	questionOneText?: string;
	questionTwoRadio?: string;
	questionTwoText?: string;
	questionTwoOrder?: string[];
	importQuestionRadio?: string;
};

export default function isSurveyFilledIn(
	survey: Survey,
	isImport = false,
	isPlan = true
): boolean {
	if ( ! isPlan ) {
		// We only show an optional question when cancelling a non-plan.
		return true;
	}
	const answeredBothQuestions = survey.questionOneRadio && survey.questionTwoRadio;

	if ( survey.questionOneRadio === 'anotherReasonOne' && survey.questionOneText === '' ) {
		return false;
	}

	if ( survey.questionTwoRadio === 'anotherReasonTwo' && survey.questionTwoText === '' ) {
		return false;
	}

	if ( isImport && ! survey.importQuestionRadio ) {
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
