/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

const tabPanelRegex = /tab-panel-\d*-(\w*)/;
const gutenbergTabPanelName = ( tabPanel ) =>
	( tabPanel.id.match( tabPanelRegex ) || [ null, null ] )[ 1 ];

/**
 * Return the event definition object to track `wpcom_block_picker_tab_panel_selected`.
 *
 * @returns {{handler: Function, selector: string, type: string}} event object definition.
 */
export default () => ( {
	// It would be nice to filter out events where the tab `is-active` before
	// the click, but we can't do that because the update has already happened
	selector: ( e ) => gutenbergTabPanelName( e.target ),
	type: 'click',
	handler: ( _event, tabName ) =>
		tracksRecordEvent( 'wpcom_block_picker_tab_panel_selected', {
			tab: tabName,
		} ),
} );
