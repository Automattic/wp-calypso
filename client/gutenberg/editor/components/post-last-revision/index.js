/** @format */
/**
 * WordPress dependencies
 */
import { sprintf, _n } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

/**
 * External dependencies
 */
import React from 'react';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import PostLastRevisionCheck from './check';
import { openPostRevisionsDialog } from 'state/posts/revisions/actions';
import { connect } from 'react-redux';

function LastRevision( { revisionsCount, openHistoryDialog: showRevisionHistory } ) {
	return (
		<PostLastRevisionCheck>
			<IconButton
				onClick={ showRevisionHistory }
				className="editor-post-last-revision__title"
				icon="backup"
			>
				{ sprintf( _n( '%d Revision', '%d Revisions', revisionsCount ), revisionsCount ) }
			</IconButton>
		</PostLastRevisionCheck>
	);
}

export default flowRight(
	withSelect( select => {
		const { getCurrentPostLastRevisionId, getCurrentPostRevisionsCount } = select( 'core/editor' );
		return {
			lastRevisionId: getCurrentPostLastRevisionId(),
			revisionsCount: getCurrentPostRevisionsCount(),
		};
	} ),
	connect(
		null,
		{ openHistoryDialog: openPostRevisionsDialog }
	)
)( LastRevision );
