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
import { togglePostRevisionsDialog } from 'state/posts/revisions/actions';
import EditorRevisionsDialog from 'post-editor/editor-revisions/dialog';

const HistoryButton = ( {
	loadRevision,
	postId,
	siteId,
	togglePostRevisionsDialog: toggleDialog,
	translate,
} ) => (
	<div className="editor-ground-control__history">
		<button
			className="editor-ground-control__history-button button is-link"
			onClick={ toggleDialog }
		>
			{ translate( 'History' ) }
		</button>
		<EditorRevisionsDialog
			onClose={ toggleDialog }
			loadRevision={ loadRevision }
			postId={ postId }
			siteId={ siteId }
		/>
	</div>
);

HistoryButton.PropTypes = {
	loadRevision: PropTypes.func.isRequired,

	// connected to dispatch
	togglePostRevisionsDialog: PropTypes.func.isRequired,

	// localize
	translate: PropTypes.func,
};

export default flow( localize, connect( null, { togglePostRevisionsDialog } ) )( HistoryButton );
