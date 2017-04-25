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
import QueryPostRevisions from 'components/data/query-post-revisions';
import EditorRevisionsListHeader from './header';
import { getNormalizedPostRevisions } from 'state/posts/revisions/selectors';
import EditorRevisionsListItem from './item';

class EditorRevisionsList extends PureComponent {
	render() {
		return (
			<div>
				<QueryPostRevisions siteId={ this.props.siteId } postId={ this.props.postId } />
				<EditorRevisionsListHeader loadRevision={ this.props.loadRevision } />
				<ul className="editor-revisions-list__list">
					{ map( this.props.revisions, revision => {
						return (
							<li
								className={ classNames(
									'editor-revisions-list__revision',
									{ selected: revision.id === this.props.revisionId }
								) }
								key={ revision.id }
							>
								<EditorRevisionsListItem
									revision={ revision }
									toggleRevision={ this.props.toggleRevision }
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
	loadRevision: PropTypes.func,
	postId: PropTypes.number,
	revisionId: PropTypes.number,
	revisions: PropTypes.array,
	siteId: PropTypes.number,
	toggleRevision: PropTypes.func,
};

export default connect(
	( state, ownProps ) => ( {
		revisions: orderBy(
			getNormalizedPostRevisions( state, ownProps.siteId, ownProps.postId ),
			'date',
			'desc'
		),
	} ),
)( EditorRevisionsList );
