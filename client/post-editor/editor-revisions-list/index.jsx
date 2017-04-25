/**
 * External dependencies
 */
import { map, orderBy, random } from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import QueryPostRevisions from 'components/data/query-post-revisions';
import EditorRevisionsListHeader from './header';
import { getNormalizedPostRevisions } from 'state/posts/revisions/selectors';
import PostTime from 'reader/post-time';

class EditorRevisionsList extends Component {
	constructor() {
		super();
		this.toggleRevision = this.toggleRevision.bind( this );
	}

	toggleRevision( event ) {
		const revisionId = parseInt( event.currentTarget.dataset.revisionId, 10 );
		this.props.toggleRevision( revisionId );
	}

	render() {
		return (
			<div>
				<QueryPostRevisions siteId={ this.props.siteId } postId={ this.props.postId } />
				<EditorRevisionsListHeader />
				<ul className="editor-revisions-list__list">
					{ map( this.props.revisions, revision => {
						// NOTE: Used to randomly fill the second line of the revisions list
						const FIXED_CHANGES = [ 0, 12, 24, 100, 200, 1023, 4020, 10450 ];
						const changes = {
							additions: FIXED_CHANGES[ random( 0, FIXED_CHANGES.length - 1 ) ],
							deletions: FIXED_CHANGES[ random( 0, FIXED_CHANGES.length - 1 ) ],
						};
						return (
							<li
								className={ classNames(
									'editor-revisions-list__revision',
									{ selected: revision.id === this.props.revisionId }
								) }
								key={ revision.id }
							>
								<Button
									borderless
									data-revision-id={ revision.id }
									onClick={ this.toggleRevision }
								>
									<span className="editor-revisions-list__date">
										<PostTime date={ revision.date } />
									</span>
									&nbsp;by&nbsp;
									<span className="editor-revisions-list__author">
										{ revision.author }
									</span>
									<br />

									{ changes.additions > 0 && (
										<span className="editor-revisions-list__additions">
											{ changes.additions } words added
										</span>
									) }

									{ changes.additions > 0 && changes.deletions > 0 && ', ' }

									{ changes.deletions > 0 && (
										<span className="editor-revisions-list__deletions">
											{ changes.deletions } words deleted
										</span>
									) }
								</Button>
							</li>
						);
					} ) }
				</ul>
			</div>
		);
	}
}

EditorRevisionsList.propTypes = {
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
