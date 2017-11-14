/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { flow } from 'lodash';

/**
 * Internal dependencies
 */
import { closePostRevisionsDialog, openPostRevisionsDialog } from 'state/posts/revisions/actions';

import EditorRevisionsDialog from 'post-editor/editor-revisions/dialog';

const HistoryButton = ( { loadRevision, postId, siteId, closeDialog, openDialog, translate } ) => (
	<div className="editor-ground-control__history">
		<button className="editor-ground-control__history-button button is-link" onClick={ openDialog }>
			{ translate( 'History' ) }
		</button>
		<EditorRevisionsDialog
			onClose={ closeDialog }
			loadRevision={ loadRevision }
			postId={ postId }
			siteId={ siteId }
		/>
	</div>
);

HistoryButton.PropTypes = {
	loadRevision: PropTypes.func.isRequired,

	// connected to dispatch
	closePostRevisionsDialog: PropTypes.func.isRequired,
	openPostRevisionsDialog: PropTypes.func.isRequired,

	// localize
	translate: PropTypes.func,
};

export default flow(
	localize,
	connect( null, {
		closeDialog: closePostRevisionsDialog,
		openDialog: openPostRevisionsDialog,
	} )
)( HistoryButton );
