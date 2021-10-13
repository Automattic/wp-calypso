import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPostRevisionAuthors from 'calypso/components/data/query-post-revision-authors';
import QueryPostRevisions from 'calypso/components/data/query-post-revisions';
import EditorDiffViewer from 'calypso/post-editor/editor-diff-viewer';
import EditorRevisionsList from 'calypso/post-editor/editor-revisions-list';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { getPostRevisions } from 'calypso/state/posts/selectors/get-post-revisions';
import { getPostRevisionsAuthorsId } from 'calypso/state/posts/selectors/get-post-revisions-authors-id';
import { getPostRevisionsComparisons } from 'calypso/state/posts/selectors/get-post-revisions-comparisons';
import { getPostRevisionsSelectedRevisionId } from 'calypso/state/posts/selectors/get-post-revisions-selected-revision-id';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

class EditorRevisions extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_editor_post_revisions_open' );
	}

	render() {
		const {
			authorsIds,
			comparisons,
			postId,
			revisions,
			selectedDiff,
			selectedRevisionId,
			siteId,
		} = this.props;

		return (
			<div className="editor-revisions">
				<QueryPostRevisions
					postId={ postId }
					siteId={ siteId }
					selectedRevisionId={ selectedRevisionId }
				/>
				<QueryPostRevisionAuthors siteId={ siteId } userIds={ authorsIds } />
				<EditorDiffViewer
					diff={ selectedDiff }
					postId={ postId }
					selectedRevisionId={ selectedRevisionId }
					siteId={ siteId }
				/>
				<EditorRevisionsList
					comparisons={ comparisons }
					postId={ postId }
					revisions={ revisions }
					selectedRevisionId={ selectedRevisionId }
					siteId={ siteId }
				/>
			</div>
		);
	}
}

EditorRevisions.propTypes = {
	// connected to state
	authorsIds: PropTypes.array.isRequired,
	comparisons: PropTypes.object,
	postId: PropTypes.number.isRequired,
	revisions: PropTypes.array.isRequired,
	selectedDiff: PropTypes.object,
	selectedRevisionId: PropTypes.number,
	siteId: PropTypes.number.isRequired,

	// connected to dispatch
	recordTracksEvent: PropTypes.func.isRequired,

	// localize
	translate: PropTypes.func.isRequired,
};

export default connect(
	( state ) => {
		const postId = getEditorPostId( state );
		const siteId = getSelectedSiteId( state );

		const revisions = getPostRevisions( state, siteId, postId );
		const selectedRevisionId = getPostRevisionsSelectedRevisionId( state );
		const comparisons = getPostRevisionsComparisons( state, siteId, postId );
		const selectedDiff = get( comparisons, [ selectedRevisionId, 'diff' ], {} );

		return {
			authorsIds: getPostRevisionsAuthorsId( state, siteId, postId ),
			comparisons,
			postId,
			revisions,
			selectedDiff,
			selectedRevisionId,
			siteId,
		};
	},
	{ recordTracksEvent }
)( localize( EditorRevisions ) );
