/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import {
	find,
	propEq
} from 'ramda';

/**
 * Internal dependencies
 */
import Layout from './layout';

export class NotificationsPanel extends Component {
	render() {
		const {
			notes,
			selectNote,
			selectedNote,
			selectedFilter,
			selectFilter,
			unselectNote,
		} = this.props;

		const note = find( propEq( 'id', selectedNote ), notes );

		return (
			<div id="wpnt-notes-panel2">
				<Layout { ...{
					notes,
					note,
					selectNote,
					selectedNote,
					unselectNote,
					selectedFilter,
					selectFilter
				} } />
			</div>
		);
	}
}

NotificationsPanel.displayName = 'NotificationsPanel';

NotificationsPanel.propTypes = {
	clickInterceptor: PropTypes.func,
	notes: PropTypes.array,
	selectedNote: PropTypes.number,
	selectNote: PropTypes.func
};

export default NotificationsPanel;
