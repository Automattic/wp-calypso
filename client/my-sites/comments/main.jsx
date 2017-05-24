/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteId from 'state/selectors/get-site-id';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import CommentDetail from 'blocks/comment-detail';
import CommentNavigation from './comment-navigation';
import { mockComments } from 'blocks/comment-detail/docs/mock-data';

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
			siteSlug,
			status,
			translate,
		} = this.props;
		const { isBulkEdit } = this.state;

		return (
			<Main className="comments" wideLayout>
				<PageViewTracker path={ basePath } title="Manage Comments" />
				<DocumentHead title={ translate( 'Manage Comments' ) } />
				<div className="comments__primary">
					<CommentNavigation { ...{
						isBulkEdit,
						siteSlug,
						status,
						toggleBulkEdit: this.toggleBulkEdit,
					} } />
					{ map( comments, ( { commentId, siteId } ) =>
						<CommentDetail { ...{
							commentId,
							isBulkEdit,
							key: `comment-${ siteId }-${ commentId }`,
							siteId,
						} } />
					) }
				</div>
			</Main>
		);
	}
}

const mapStateToProps = ( state, { siteSlug } ) => {
	const siteId = getSiteId( state, siteSlug );

	// const comments = getSiteComments( state, siteId, status );
	const comments = mockComments;

	return {
		comments,
		siteId,
	};
};

export default connect( mapStateToProps )( localize( CommentsManagement ) );
