/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { flow } from 'lodash';

/**
 * Internal dependencies
 */
import { openPostRevisionsDialog } from 'state/posts/revisions/actions';
import { withAnalytics, recordTracksEvent } from 'state/analytics/actions';
import EditorRevisionsDialog from 'post-editor/editor-revisions/dialog';

class HistoryButton extends Component {
	render() {
		const { loadRevision, postId, siteId, translate } = this.props;
		return (
			<div className="editor-ground-control__history">
				<button
					className="editor-ground-control__history-button button is-link"
					onClick={ this.props.selectHistory }
				>
					{ translate( 'History' ) }
				</button>
				<EditorRevisionsDialog loadRevision={ loadRevision } postId={ postId } siteId={ siteId } />
			</div>
		);
	}
}

HistoryButton.propTypes = {
	// connected to dispatch
	openPostRevisionsDialog: PropTypes.func.isRequired,
	recordTracksEvent: PropTypes.func.isRequired,

	// localize
	translate: PropTypes.func,
};

const selectHistory = () => dispatch => {
	dispatch(
		withAnalytics(
			recordTracksEvent( 'calypso_editor_history_button_click' ),
			openPostRevisionsDialog()
		)
	);
};

export default flow(
	localize,
	connect( null, {
		selectHistory,
	} )
)( HistoryButton );
