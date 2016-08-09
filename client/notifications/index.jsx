import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Layout from './layout';

export class NotificationsPanel extends Component {
	render() {
		const {
			notes,
			selectedNote
		} = this.props;

		return (
			<div id="wpnt-notes-panel2">
				<Layout { ...{
					notes,
					selectedNote
				} } />
			</div>
		);
	}
}

NotificationsPanel.displayName = 'NotificationsPanel';

const mapStateToProps = state => ( {
	notes: [],
	selectedNote: null
} );

const mapDispatchToProps = dispatch => ( {

} );

export default connect( mapStateToProps, mapDispatchToProps )( NotificationsPanel );
