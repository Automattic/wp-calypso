// TODO (ability-migration): Remove this switch and its call sites once Big Sky
// deletes its ability copies — with no provider fallback left, disabling AM
// would only break the tools.
/**
 * `?am_abilities=0` flips the migrated abilities back to the provider copies
 * — execution, registration, and rendering — so testers can compare the
 * implementations end-to-end. Abilities with no provider copy stay on.
 *
 * Read once per page load: the site editor's router drops the parameter on
 * its first navigation, and registration is one-shot, so a live read would
 * split registration from execution and rendering mid-session.
 */
const isDisabled =
	typeof window !== 'undefined' &&
	new URLSearchParams( window.location.search ).get( 'am_abilities' ) === '0';

export default function isAmAbilitiesDisabled(): boolean {
	return isDisabled;
}
