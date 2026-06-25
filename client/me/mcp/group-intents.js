/**
 * A group/read/write intent only sets the *default* for abilities with no
 * explicit per-op override — an explicit override from an earlier individual
 * toggle always wins (see SettingsHelper::is_ability_enabled() on the
 * backend). So an "Enable all" action must also force-write an explicit
 * override for any tool in scope whose current state disagrees with the new
 * value, or a previously-toggled tool would silently stay stuck.
 * @param {Array<[string, import('@automattic/api-core').McpAbility]>} scopedTools
 * @param {boolean} enabled
 * @returns {Record<string, boolean>|undefined}
 */
export function getOverridesToMatch( scopedTools, enabled ) {
	const overrides = {};
	scopedTools.forEach( ( [ toolId, tool ] ) => {
		if ( tool.enabled !== enabled ) {
			overrides[ toolId ] = enabled;
		}
	} );
	return Object.keys( overrides ).length > 0 ? overrides : undefined;
}
