/**
 * Returns selected media for a specified site ID.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?Array}         Media
 */
export default function getSelectedMedia( state, siteId ) {
	const queries = state.media.queries[ siteId ];
	const selected = state.media.selected[ siteId ];

	if ( ! queries || ! selected ) {
		return null;
	}

	return selected.map( id => queries.getItem( id ) );
}
