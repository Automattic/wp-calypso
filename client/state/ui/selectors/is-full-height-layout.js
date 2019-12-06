/**
 * Returns whether the layout should be full height.
 *
 * @param  {object}  state Global state tree
 * @returns {boolean}       Whether the layout is full height
 */
export default function isFullHeightLayout( state ) {
	return state.ui.isFullHeightLayout;
}
