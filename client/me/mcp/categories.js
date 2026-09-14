/**
 * Helpers for grouping MCP account tools (read vs write) on the /me/mcp hub and sub-routes.
 * Mirrors the annotations model from the MCP settings API (`McpAbilityAnnotations`).
 */

/**
 * Normalize a tool's readonly state. Prefers the guaranteed top-level `readonly`
 * boolean (always present as of AIINT-469), falling back to the legacy
 * `annotations.readonly` (boolean or string) for older payload shapes.
 * @param {Record<string, unknown>} tool
 * @returns {boolean|undefined} true = read-only, false = can write, undefined = not specified
 */
function getReadonlyAnnotation( tool ) {
	if ( typeof tool?.readonly === 'boolean' ) {
		return tool.readonly;
	}

	const raw = tool?.annotations?.readonly;
	if ( raw === true || raw === 'true' ) {
		return true;
	}
	if ( raw === false || raw === 'false' ) {
		return false;
	}
	return undefined;
}

/**
 * Write-capable tools: explicitly marked not read-only.
 * @param {Record<string, unknown>} tool
 * @returns {boolean}
 */
export function isWriteTool( tool ) {
	return getReadonlyAnnotation( tool ) === false;
}

/**
 * Read-oriented tools: explicitly read-only, or unspecified (treat as read for listing).
 * @param {Record<string, unknown>} tool
 * @returns {boolean}
 */
export function isReadTool( tool ) {
	const ro = getReadonlyAnnotation( tool );
	if ( ro === true ) {
		return true;
	}
	if ( ro === false ) {
		return false;
	}
	// Unspecified: show under Read access (matches hub counts and avoids empty read lists).
	return true;
}

/**
 * Some API responses may include `visible: false` to hide a tool from settings UIs.
 * @param {Record<string, unknown>} tool
 * @returns {boolean}
 */
export function isToolVisible( tool ) {
	return tool?.visible !== false;
}

/**
 * @param {Array<[string, Record<string, unknown>]>} entries
 * @returns {Array<[string, Record<string, unknown>]>}
 */
export function filterVisibleTools( entries ) {
	return entries.filter( ( [ , tool ] ) => isToolVisible( tool ) );
}
