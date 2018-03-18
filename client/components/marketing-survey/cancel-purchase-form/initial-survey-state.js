/** @format */

/**
 * Returns the initial survey state for use in components displaying a cancel purchase form.
 *
 * @return {Object} The initial state of the survey.
 */
export default function initialSurveyState() {
	return {
		questionOneRadio: null,
		questionTwoRadio: null,
	};
}
