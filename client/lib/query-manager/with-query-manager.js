/**
 * Apply a `callback` transformation to a `QueryManager` instance in `state[ siteId ]` and
 * return a state object updated with its result.
 * If the `state[ siteId ]` object doesn't exist, it's created with the `create` function.
 * If `create` is `false`, the `callback` will not be applied (there is no `QueryManager` to
 * apply it to after all) and unchanged state will be returned.
 *
 * @param {object} state State object
 * @param {string} siteId State key
 * @param {Function | boolean} create Optional create callback
 * @param {Function} callback Transformation callback
 * @returns {object} Updated state object
 */
export default function withQueryManager( state, siteId, create, callback ) {
	if ( ! siteId ) {
		return state;
	}

	const prevManager = state[ siteId ] || ( create && create() );

	if ( ! prevManager ) {
		return state;
	}

	const nextManager = callback( prevManager );

	if ( nextManager === prevManager ) {
		return state;
	}

	return {
		...state,
		[ siteId ]: nextManager,
	};
}
