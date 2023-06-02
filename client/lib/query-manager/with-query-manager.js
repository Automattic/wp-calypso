/**
 * Apply a `callback` transformation to a `QueryManager` instance in `state[ siteId ]` and
 * return a state object updated with its result.
 * If the `state[ siteId ]` object doesn't exist, it's created with the `create` function.
 * If `create` is `false`, the `callback` will not be applied (there is no `QueryManager` to
 * apply it to after all) and unchanged state will be returned.
 *
 * @param {Object} state State object
 * @param {string} siteId State key
 * @param {Function} callback Transformation callback
 * @param {Function} [create] Optional create callback
 * @returns {Object} Updated state object
 */
export default function withQueryManager( state, siteId, callback, create ) {
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
