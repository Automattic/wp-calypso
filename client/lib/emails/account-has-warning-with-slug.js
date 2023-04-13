/**
 * Determines if the email account provided i.e. `emailAccount` has one or more warnings with the slug `warningSlug` in its `warnings` array
 *
 * @param {string} warningSlug - The warning slug to check against
 * @param {Object} emailAccount - The email account being investigated for warnings of a certain slug
 * @returns {boolean} Returns true if warnings with the slug are found, false otherwise
 */
export function accountHasWarningWithSlug( warningSlug, emailAccount ) {
	const warnings = emailAccount?.warnings;
	return ( warnings?.[ 0 ] ? warnings : [] ).some(
		( warning ) => warningSlug === warning?.warning_slug
	);
}
