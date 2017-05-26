/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { filter, map } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteComments from 'state/selectors/get-site-comments';
import getSiteId from 'state/selectors/get-site-id';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import CommentDetail from 'blocks/comment-detail';
import CommentNavigation from './comment-navigation';
import QuerySiteComments from 'components/data/query-site-comments';

export class CommentsManagement extends Component {
	static propTypes = {
		basePath: PropTypes.string,
		comments: PropTypes.array,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string.isRequired,
		status: PropTypes.string,
		translate: PropTypes.func,
	};

	state = {
		isBulkEdit: false,
	};

	toggleBulkEdit = () => this.setState( { isBulkEdit: ! this.state.isBulkEdit } );

	render() {
		const {
			basePath,
			comments,
			siteId,
			siteSlug,
			status,
			translate,
		} = this.props;
		const { isBulkEdit } = this.state;

		return (
			<Main className="comments" wideLayout>
				<PageViewTracker path={ basePath } title="Manage Comments" />
				<QuerySiteComments siteId={ siteId } status="all" />
				<DocumentHead title={ translate( 'Manage Comments' ) } />
				<div className="comments__primary">
					<CommentNavigation { ...{
						isBulkEdit,
						siteSlug,
						status,
						toggleBulkEdit: this.toggleBulkEdit,
					} } />
					{ map( comments, comment =>
						<CommentDetail
							commentId={ comment.ID }
							isBulkEdit={ isBulkEdit }
							key={ `comment-${ siteId }-${ comment.ID }` }
							siteId={ siteId }
							{ ...comment }
						/>
					) }
				</div>
			</Main>
		);
	}
}

const mapStateToProps = ( state, { siteSlug, status } ) => {
	const siteId = getSiteId( state, siteSlug );
	const siteComments = getSiteComments( state, siteId );
	const comments = 'all' === status
		? siteComments
		: filter( siteComments, comment => status === comment.status );

	return {
		comments,
		siteId,
	};
};

export default connect( mapStateToProps )( localize( CommentsManagement ) );
