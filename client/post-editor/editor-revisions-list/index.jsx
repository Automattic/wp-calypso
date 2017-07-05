/**
 * External dependencies
 */
import { map, orderBy } from 'lodash';
import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import EditorRevisionsListHeader from './header';
import EditorRevisionsListItem from './item';
import QueryPostRevisions from 'components/data/query-post-revisions';
import getPostRevision from 'state/selectors/get-post-revision';
import getPostRevisions from 'state/selectors/get-post-revisions';
import {
	normalizeForDisplay,
	normalizeForEditing
} from 'state/selectors/utils/revisions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import viewport from 'lib/viewport';

class EditorRevisionsList extends PureComponent {
	loadRevision = () => {
		this.props.loadRevision( this.props.selectedRevision );
	}

	trySelectingRevision() {
		if (
			this.props.selectedRevisionId === null &&
			this.props.revisions.length > 0 &&
			viewport.isWithinBreakpoint( '>660px' )
		) {
			this.props.selectRevision( this.props.revisions[ 0 ].id );
		}
	}

	componentWillMount() {
		this.trySelectingRevision();
	}

	componentDidMount() {
		// Make sure that scroll position in the editor is not preserved.
		window.scrollTo( 0, 0 );
	}

	componentDidUpdate() {
		this.trySelectingRevision();
	}

	render() {
		return (
			<div>
				<QueryPostRevisions postId={ this.props.postId } siteId={ this.props.siteId } />
				<EditorRevisionsListHeader
					loadRevision={ this.loadRevision }
					selectedRevisionId={ this.props.selectedRevisionId }
				/>
				<ul className="editor-revisions-list__list">
					{ map( this.props.revisions, revision => {
						const itemClasses = classNames(
							'editor-revisions-list__revision',
							{ 'is-selected': revision.id === this.props.selectedRevisionId }
						);
						return (
							<li className={ itemClasses } key={ revision.id }>
								<EditorRevisionsListItem
									revision={ revision }
									selectRevision={ this.props.selectRevision }
								/>
							</li>
						);
					} ) }
				</ul>
			</div>
		);
	}
}

EditorRevisionsList.propTypes = {
	loadRevision: PropTypes.func.isRequired,
	postId: PropTypes.number,
	revisions: PropTypes.array.isRequired,
	selectedRevision: PropTypes.object,
	selectedRevisionId: PropTypes.number,
	selectRevision: PropTypes.func.isRequired,
	siteId: PropTypes.number,
};

export default connect(
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		return {
			postId,
			revisions: orderBy(
				map(
					getPostRevisions( state, siteId, postId ),
					normalizeForDisplay
				),
				'date',
				'desc'
			),
			selectedRevision: normalizeForEditing(
				getPostRevision(
					state, siteId, postId, ownProps.selectedRevisionId
				)
			),
			siteId,
		};
	},
)( EditorRevisionsList );
