// TODO (ability-migration): Remove this switch and its call sites once Big Sky
// deletes its ability copies — with no provider fallback left, disabling AM
// would only break the tools.
/**
 * `?am_abilities=0` flips both execution and rendering of migrated abilities
 * to the provider copies, so testers can compare the implementations
 * end-to-end.
 */
export default function isAmAbilitiesDisabled(): boolean {
	return new URLSearchParams( window.location.search ).get( 'am_abilities' ) === '0';
}
