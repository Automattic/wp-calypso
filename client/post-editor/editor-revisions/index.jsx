/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { flow } from 'lodash';

/**
 * Internal dependencies
 */
import { getEditorPostId } from 'state/ui/editor/selectors';
import {
	getPostRevisions,
	getPostRevisionsAuthorsId,
	getPostRevisionsSelectedRevisionId,
} from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import EditorDiffViewer from 'post-editor/editor-diff-viewer';
import EditorRevisionsList from 'post-editor/editor-revisions-list';
import QueryPostRevisions from 'components/data/query-post-revisions';
import QueryUsers from 'components/data/query-users';

class EditorRevisions extends Component {
	render = () => {
		const {
			adminUrl,
			authorsIds,
			postId,
			revisions,
			selectedRevisionId,
			siteId,
			translate,
		} = this.props;

		if ( adminUrl ) {
			// This is what gets rendered in the sidebar
			// @TODO take it out (& adminUrl too) when the feature flag is enabled
			const lastRevision = revisions[ 0 ];
			const revisionsLink = adminUrl + 'revision.php?revision=' + lastRevision;

			return (
				<a
					className="editor-revisions"
					href={ revisionsLink }
					target="_blank"
					rel="noopener noreferrer"
					aria-label={ translate( 'Open list of revisions' ) }
				>
					<QueryPostRevisions postId={ postId } siteId={ siteId } />
					<QueryUsers siteId={ siteId } userIds={ authorsIds } />
					<Gridicon icon="history" size={ 18 } />
					{ translate( '%(revisions)d revision', '%(revisions)d revisions', {
						count: revisions.length,
						args: { revisions: revisions.length },
					} ) }
				</a>
			);
		}
		/*		console.log( 'top level render', {
			postId,
			siteId,
			authorsIds,
			selectedRevisionId,
		} );*/
		return (
			<div>
				<QueryPostRevisions postId={ postId } siteId={ siteId } />
				<QueryUsers siteId={ siteId } userIds={ authorsIds } />
				<EditorRevisionsList postId={ postId } revisions={ revisions } siteId={ siteId } />
				<EditorDiffViewer
					postId={ postId }
					selectedRevisionId={ selectedRevisionId }
					siteId={ siteId }
				/>
				<button>LOAD</button>
			</div>
		);
	};
}

EditorRevisions.propTypes = {
	// @TODO adminUrl exists for sidebar fallback UI -- remove when that's taken out
	adminUrl: PropTypes.string,

	// connected
	authorsIds: PropTypes.array.isRequired,
	postId: PropTypes.number.isRequired,
	revisions: PropTypes.array.isRequired,
	selectedRevisionId: PropTypes.number.isRequired,
	siteId: PropTypes.number.isRequired,

	// localize
	translate: PropTypes.func.isRequired,
};

export default flow(
	localize,
	connect( state => {
		const postId = getEditorPostId( state );
		const siteId = getSelectedSiteId( state );
		return {
			authorsIds: getPostRevisionsAuthorsId( state, siteId, postId ),
			postId,
			revisions: getPostRevisions( state, siteId, postId, 'display' ),
			selectedRevisionId: getPostRevisionsSelectedRevisionId( state ),
			siteId,
		};
	} )
)( EditorRevisions );
