/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import getSiteId from 'state/selectors/get-site-id';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import CommentList from './comment-list';

export class CommentsManagement extends Component {
	static propTypes = {
		basePath: PropTypes.string,
		comments: PropTypes.array,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string.isRequired,
		status: PropTypes.string,
		translate: PropTypes.func,
	};

	render() {
		const {
			basePath,
			siteId,
			siteSlug,
			status,
			translate,
		} = this.props;

		return (
			<Main className="comments" wideLayout>
				<PageViewTracker path={ basePath } title="Manage Comments" />
				<DocumentHead title={ translate( 'Manage Comments' ) } />
				<CommentList
					siteId={ siteId }
					siteSlug={ siteSlug }
					status={ status }
				/>
			</Main>
		);
	}
}

const mapStateToProps = ( state, { siteSlug } ) => ( {
	siteId: getSiteId( state, siteSlug ),
} );

export default connect( mapStateToProps )( localize( CommentsManagement ) );
