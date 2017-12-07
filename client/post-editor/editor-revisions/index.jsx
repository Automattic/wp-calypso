/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { flow, findIndex, get } from 'lodash';

/**
 * Internal dependencies
 */
import { getEditorPostId } from 'state/ui/editor/selectors';
import {
	getPostRevisions,
	getPostRevisionsDiff,
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
			authorsIds,
			diff,
			nextRevisionId,
			postId,
			prevRevisionId,
			revisions,
			selectedRevisionId,
			siteId,
		} = this.props;

		return (
			<div className="editor-revisions__wrapper">
				<QueryPostRevisions
					postId={ postId }
					siteId={ siteId }
					selectedRevisionId={ selectedRevisionId }
				/>
				<QueryUsers siteId={ siteId } userIds={ authorsIds } />
				<EditorDiffViewer
					diff={ diff }
					postId={ postId }
					prevRevisionId={ prevRevisionId }
					selectedRevisionId={ selectedRevisionId }
					siteId={ siteId }
				/>
				<EditorRevisionsList
					postId={ postId }
					revisions={ revisions }
					selectedRevisionId={ selectedRevisionId }
					siteId={ siteId }
					nextRevisionId={ nextRevisionId }
					prevRevisionId={ prevRevisionId }
				/>
			</div>
		);
	};
}

EditorRevisions.propTypes = {
	// connected
	authorsIds: PropTypes.array.isRequired,
	diff: PropTypes.object,
	nextRevisionId: PropTypes.number,
	postId: PropTypes.number.isRequired,
	prevRevisionId: PropTypes.number,
	revisions: PropTypes.array.isRequired,
	selectedRevisionId: PropTypes.number,
	siteId: PropTypes.number.isRequired,

	// localize
	translate: PropTypes.func.isRequired,
};

export default flow(
	localize,
	connect( state => {
		const postId = getEditorPostId( state );
		const siteId = getSelectedSiteId( state );

		const revisions = getPostRevisions( state, siteId, postId, 'display' );
		const selectedRevisionId = getPostRevisionsSelectedRevisionId( state );
		const selectedIdIndex = findIndex( revisions, { id: selectedRevisionId } );
		const nextRevisionId = selectedRevisionId && get( revisions, [ selectedIdIndex - 1, 'id' ] );
		const prevRevisionId = selectedRevisionId && get( revisions, [ selectedIdIndex + 1, 'id' ] );

		return {
			authorsIds: getPostRevisionsAuthorsId( state, siteId, postId ),
			diff: getPostRevisionsDiff( state, siteId, postId, prevRevisionId, selectedRevisionId ),
			nextRevisionId,
			postId,
			prevRevisionId,
			revisions,
			selectedRevisionId,
			siteId,
		};
	} )
)( EditorRevisions );
