/**
 * Returns the initial survey state for use in components displaying a cancel purchase form.
 * @returns {Object} The initial state of the survey.
 */
export default function initialSurveyState(): {
	questionOneRadio: string;
	questionTwoRadio: string;
	importQuestionRadio: string;
} {
	return {
		questionOneRadio: '',
		questionTwoRadio: '',
		importQuestionRadio: '',
	};
}
