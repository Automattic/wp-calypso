/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { flow } from 'lodash';

/**
 * Internal dependencies
 */
import { openPostRevisionsDialog } from 'state/posts/revisions/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import EditorRevisionsDialog from 'post-editor/editor-revisions/dialog';

class HistoryButton extends PureComponent {
	onClick = () => {
		this.props.recordTracksEvent( 'calypso_editor_history_button_click' );
		this.props.openDialog();
	};

	render() {
		const { loadRevision, postId, siteId, translate } = this.props;
		return (
			<div className="editor-ground-control__history">
				<button
					className="editor-ground-control__history-button button is-link"
					onClick={ this.onClick }
				>
					{ translate( 'History' ) }
				</button>
				<EditorRevisionsDialog loadRevision={ loadRevision } postId={ postId } siteId={ siteId } />
			</div>
		);
	}
}

HistoryButton.propTypes = {
	loadRevision: PropTypes.func.isRequired,

	// connected to dispatch
	openPostRevisionsDialog: PropTypes.func.isRequired,
	recordTracksEvent: PropTypes.func.isRequired,

	// localize
	translate: PropTypes.func,
};

export default flow(
	localize,
	connect( null, {
		openDialog: openPostRevisionsDialog,
		recordTracksEvent,
	} )
)( HistoryButton );
