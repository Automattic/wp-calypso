/**
 * External dependencies
 */
import { map } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getPostRevisions } from 'state/posts/selectors';
import QueryPostRevisions from 'components/data/query-post-revisions';

class PostRevision extends React.Component {
	render() {
		// FIXME: this is merely a placehodler component to test "displaying"
		// stuff out of the redux store.

		return (
			<div>
				<QueryPostRevisions
					siteId={ this.props.siteId }
					postId={ this.props.postId } />
				<h1>{ this.props.translate( 'Post History' ) }</h1>
				<ul>
					{ map( this.props.revisions, ( revision ) => {
						// TODO: revision's title is empty, need to di
						// deeper, probably some discrepancies between
						// REST 1.1 / 2.0 output

						return (
							<li key={ revision.id }>
								<h2>{ revision.title }</h2>
								<p>{ revision.content.rendered }</p>
							</li>
						);
					} ) }
				</ul>
			</div>
		);
	}
}

PostRevision.propTypes = {
	postId: React.PropTypes.number,
	siteId: React.PropTypes.number,
	translate: React.PropTypes.func,
};

export default connect(
	( state, { siteId, postId } ) => {
		return {
			revisions: getPostRevisions( state, siteId, postId )
		};
	}
)( localize( PostRevision ) );
