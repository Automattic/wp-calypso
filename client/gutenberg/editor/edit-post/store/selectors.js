/**
 * External dependencies
 */
import createSelector from 'rememo';
import { get, includes, some } from 'lodash';

/**
 * Returns the current editing mode.
 *
 * @param {Object} state Global application state.
 *
 * @return {string} Editing mode.
 */
export function getEditorMode( state ) {
	return getPreference( state, 'editorMode', 'visual' );
}

/**
 * Returns true if the editor sidebar is opened.
 *
 * @param {Object} state Global application state
 * @return {boolean}     Whether the editor sidebar is opened.
 */
export function isEditorSidebarOpened( state ) {
	const activeGeneralSidebar = getPreference( state, 'activeGeneralSidebar', null );

	return includes( [ 'edit-post/document', 'edit-post/block' ], activeGeneralSidebar );
}

/**
 * Returns true if the plugin sidebar is opened.
 *
 * @param {Object} state Global application state
 * @return {boolean}     Whether the plugin sidebar is opened.
 */
export function isPluginSidebarOpened( state ) {
	const activeGeneralSidebar = getActiveGeneralSidebarName( state );
	return !! activeGeneralSidebar && ! isEditorSidebarOpened( state );
}

/**
 * Returns the current active general sidebar name.
 *
 * @param {Object} state Global application state.
 *
 * @return {?string} Active general sidebar name.
 */
export function getActiveGeneralSidebarName( state ) {
	return getPreference( state, 'activeGeneralSidebar', null );
}

/**
 * Returns the preferences (these preferences are persisted locally).
 *
 * @param {Object} state Global application state.
 *
 * @return {Object} Preferences Object.
 */
export function getPreferences( state ) {
	return state.preferences;
}

/**
 *
 * @param {Object} state         Global application state.
 * @param {string} preferenceKey Preference Key.
 * @param {Mixed}  defaultValue  Default Value.
 *
 * @return {Mixed} Preference Value.
 */
export function getPreference( state, preferenceKey, defaultValue ) {
	const preferences = getPreferences( state );
	const value = preferences[ preferenceKey ];
	return value === undefined ? defaultValue : value;
}

/**
 * Returns true if the publish sidebar is opened.
 *
 * @param {Object} state Global application state
 * @return {boolean}       Whether the publish sidebar is open.
 */
export function isPublishSidebarOpened( state ) {
	return state.publishSidebarActive;
}

/**
 * Returns true if the editor sidebar panel is open, or false otherwise.
 *
 * @param  {Object}  state Global application state.
 * @param  {string}  panel Sidebar panel name.
 * @return {boolean}       Whether the sidebar panel is open.
 */
export function isEditorSidebarPanelOpened( state, panel ) {
	const panels = getPreference( state, 'panels' );
	return panels ? !! panels[ panel ] : false;
}

/**
 * Returns whether the given feature is enabled or not.
 *
 * @param {Object} state   Global application state.
 * @param {string} feature Feature slug.
 *
 * @return {boolean} Is active.
 */
export function isFeatureActive( state, feature ) {
	return !! state.preferences.features[ feature ];
}

/**
 * Returns true if the the plugin item is pinned to the header.
 * When the value is not set it defaults to true.
 *
 * @param  {Object}  state      Global application state.
 * @param  {string}  pluginName Plugin item name.
 *
 * @return {boolean} Whether the plugin item is pinned.
 */
export function isPluginItemPinned( state, pluginName ) {
	const pinnedPluginItems = getPreference( state, 'pinnedPluginItems', {} );

	return get( pinnedPluginItems, [ pluginName ], true );
}

/**
 * Returns the state of legacy meta boxes.
 *
 * @param   {Object} state Global application state.
 * @return {Object}       State of meta boxes.
 */
export function getMetaBoxes( state ) {
	return state.metaBoxes;
}

/**
 * Returns the state of legacy meta boxes.
 *
 * @param {Object} state    Global application state.
 * @param {string} location Location of the meta box.
 *
 * @return {Object} State of meta box at specified location.
 */
export function getMetaBox( state, location ) {
	return getMetaBoxes( state )[ location ];
}

/**
 * Returns true if the post is using Meta Boxes
 *
 * @param  {Object} state Global application state
 * @return {boolean}      Whether there are metaboxes or not.
 */
export const hasMetaBoxes = createSelector(
	( state ) => {
		return some( getMetaBoxes( state ), ( metaBox ) => {
			return metaBox.isActive;
		} );
	},
	( state ) => [
		state.metaBoxes,
	],
);

/**
 * Returns true if the the Meta Boxes are being saved.
 *
 * @param   {Object}  state Global application state.
 * @return {boolean}       Whether the metaboxes are being saved.
 */
export function isSavingMetaBoxes( state ) {
	return state.isSavingMetaBoxes;
}
