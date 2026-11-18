/**
 * `/start/student` and `/checkout/student` both lead to the Student flow in Stepper. Neither
 * puts the plan in the cart: the flow asks the server whether the account can buy it first.
 */
export const STUDENT_START_FLOW = 'student';

export const STUDENT_CHECKOUT_PATH = '/checkout/student';

/**
 * The Student flow URL these entry points redirect to.
 * @param locale Locale slug to keep, when it isn't the default.
 * @param search Query string to carry over, without the leading `?`.
 */
export function getStudentFlowRedirect( locale = '', search = '' ): string {
	return `/setup/student${ locale ? `/${ locale }` : '' }${ search ? `?${ search }` : '' }`;
}
