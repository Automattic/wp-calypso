import tracksRecordEvent from './track-record-event';

// Curiously, the numeric ids of the tabs increment every time you close and
// reopen the inserter, so we use this regex to ignore that and grab the tab
// slug
const tabPanelRegex = /tab-panel-\d*-(\w*)/;
const gutenbergTabPanelName = ( tabPanel ) =>
	( tabPanel.id.match( tabPanelRegex ) || [ null, null ] )[ 1 ];

/**
 * Return the event definition object to track `wpcom_block_picker_tab_panel_selected`.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-inserter-tab-panel-selected',
	selector: `.block-editor-inserter__tabs .components-tab-panel__tabs button:not(.is-active)`,
	type: 'click',
	// Using capture event listener to make sure the tab is not set to active
	// before this event listener runs. This way we can prevent the listener
	// from triggering when the tab is already active.
	capture: true,
	handler: ( event ) => {
		const tabName = gutenbergTabPanelName( event.target );
		tracksRecordEvent( 'wpcom_block_picker_tab_panel_selected', {
			tab: tabName,
		} );
	},
} );
