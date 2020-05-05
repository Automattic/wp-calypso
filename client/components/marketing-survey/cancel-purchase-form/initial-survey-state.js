/**
 * Returns the initial survey state for use in components displaying a cancel purchase form.
 *
 * @returns {object} The initial state of the survey.
 */
export default function initialSurveyState() {
	return {
		questionOneRadio: null,
		questionTwoRadio: null,
	};
}
