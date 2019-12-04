/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { openPostRevisionsDialog } from 'state/posts/revisions/actions';
import { withAnalytics, recordTracksEvent } from 'state/analytics/actions';

const HistoryButton = ( { translate, selectHistory } ) => (
	<div className="editor-ground-control__history">
		<button
			className="editor-ground-control__history-button button is-link"
			onClick={ selectHistory }
		>
			{ translate( 'History' ) }
		</button>
	</div>
);

HistoryButton.propTypes = {
	// localize
	translate: PropTypes.func,
};

// Action creator to call openPostRevisionsDialog wrapped with analytics call
const selectHistory = () =>
	withAnalytics(
		recordTracksEvent( 'calypso_editor_history_button_click' ),
		openPostRevisionsDialog()
	);

export default connect( null, { selectHistory } )( localize( HistoryButton ) );
