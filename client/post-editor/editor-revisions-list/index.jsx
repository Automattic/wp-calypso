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
import {
	getPostRevision,
	getPostRevisions,
	normalizeForDisplay,
	normalizeForEditing,
} from 'state/posts/revisions/selectors';
import EditorRevisionsListItem from './item';

class EditorRevisionsList extends PureComponent {
	constructor() {
		super();
		this.loadRevision = this.loadRevision.bind( this );
	}

	loadRevision() {
		this.props.loadRevision( this.props.selectedRevision );
	}

	componentWillMount() {
		if (
			this.props.selectedRevisionId === null &&
			this.props.revisions.length > 0
		) {
			this.props.toggleRevision( this.props.revisions[ 0 ].id );
		}
	}

	render() {
		return (
			<div>
				<QueryPostRevisions siteId={ this.props.siteId } postId={ this.props.postId } />
				<EditorRevisionsListHeader loadRevision={ this.loadRevision } />
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
	revisions: PropTypes.array,
	selectedRevision: PropTypes.object,
	selectedRevisionId: PropTypes.number,
	siteId: PropTypes.number,
	toggleRevision: PropTypes.func,
};

export default connect(
	( state, ownProps ) => ( {
		revisions: orderBy(
			map(
				getPostRevisions( state, ownProps.siteId, ownProps.postId ),
				normalizeForDisplay
			),
			'date',
			'desc'
		),
		selectedRevision: normalizeForEditing(
			getPostRevision(
				state, ownProps.siteId, ownProps.postId, ownProps.selectedRevisionId
			)
		),
	} ),
)( EditorRevisionsList );
