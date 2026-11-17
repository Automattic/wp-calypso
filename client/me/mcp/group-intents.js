/**
 * Build a read/write-aware per-group `group_intents` key (AIINT-472): the
 * backend's SettingsHelper::ability_covered_by_group_intents() only covers an
 * ability via a compound key shaped "{read|write}:{group}" (e.g. "write:site")
 * — a bare group slug is rejected by sanitize_group_intents(). This keeps a
 * group's "Enable all" scoped to the category (Read or Write) it was toggled
 * from, instead of defaulting every op in the group regardless of category.
 * @param {'read'|'write'} category
 * @param {string} groupName
 * @returns {string}
 */
export function groupIntentKey( category, groupName ) {
	return `${ category }:${ groupName }`;
}

/**
 * A group/read/write intent only sets the *default* for abilities with no
 * explicit per-op override — an explicit override from an earlier individual
 * toggle always wins (see SettingsHelper::is_ability_enabled() on the
 * backend). So an "Enable all" action must also force-write an explicit
 * override for any tool in scope whose current state disagrees with the new
 * value, except that opt-in tools can only be enabled individually.
 * @param {Array<[string, import('@automattic/api-core').McpAbility]>} scopedTools
 * @param {boolean} enabled
 * @returns {Record<string, boolean>|undefined}
 */
export function getOverridesToMatch( scopedTools, enabled ) {
	const overrides = {};
	scopedTools.forEach( ( [ toolId, tool ] ) => {
		if ( tool.enabled !== enabled && ! ( enabled && tool.requires_opt_in === true ) ) {
			overrides[ toolId ] = enabled;
		}
	} );
	return Object.keys( overrides ).length > 0 ? overrides : undefined;
}

/**
 * @param {Array<[string, import('@automattic/api-core').McpAbility]>} scopedTools
 * @returns {boolean}
 */
export function isBulkEnabled( scopedTools ) {
	return (
		scopedTools.some( ( [ , tool ] ) => tool.enabled ) &&
		scopedTools.every( ( [ , tool ] ) => tool.enabled || tool.requires_opt_in === true )
	);
}
