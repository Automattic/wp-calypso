/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

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
	// localize
	translate: PropTypes.func,
};

const mapDispatchToProps = dispatch => ( {
	selectHistory: () =>
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_editor_history_button_click' ),
				openPostRevisionsDialog()
			)
		),
} );

export default connect( mapDispatchToProps )( localize( HistoryButton ) );
