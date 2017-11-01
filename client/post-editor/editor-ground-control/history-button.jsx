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
import { recordTracksEvent } from 'state/analytics/actions';
import { getPostRevisionsSelectedRevisionId } from 'state/selectors';
import EditorRevisions from 'post-editor/editor-revisions';
import Dialog from 'components/dialog';
import LoadButton from 'post-editor/editor-revisions-list/load-button';

class HistoryButton extends PureComponent {
	state = {};

	toggleShowingDialog = () => {
		if ( ! this.state.isDialogVisible ) {
			this.props.recordTracksEvent( 'calypso_editor_post_revisions_open' );
		}
		this.setState( {
			isDialogVisible: ! this.state.isDialogVisible,
		} );
	};

	render() {
		const { postId, selectedRevisionId, siteId, translate } = this.props;
		const dialogButtons = [
			{ action: 'cancel', compact: true, label: translate( 'Cancel' ) },
			<LoadButton postId={ postId } selectedRevisionId={ selectedRevisionId } siteId={ siteId } />,
		];

		return (
			<div className="editor-ground-control__history">
				<button
					className="editor-ground-control__save button is-link"
					onClick={ this.toggleShowingDialog }
				>
					{ translate( 'History' ) }
				</button>
				<Dialog
					buttons={ dialogButtons }
					className="editor-ground-control__dialog"
					isVisible={ this.state.isDialogVisible }
					onClose={ this.toggleShowingDialog }
					position="bottom"
				>
					<EditorRevisions />
				</Dialog>
			</div>
		);
	}
}

HistoryButton.PropTypes = {
	// connected to state
	selectedRevisionId: PropTypes.number,

	// connected to dispatch
	recordTracksEvent: PropTypes.func,

	// localize
	translate: PropTypes.func,
};

export default flow(
	localize,
	connect( state => ( { selectedRevisionId: getPostRevisionsSelectedRevisionId( state ) } ), {
		recordTracksEvent,
	} )
)( HistoryButton );
