/** @format */
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
import SidebarNavigation from 'my-sites/sidebar-navigation';

export class CommentsManagement extends Component {
	static propTypes = {
		basePath: PropTypes.string,
		comments: PropTypes.array,
		siteId: PropTypes.number,
		siteFragment: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		status: PropTypes.string,
		translate: PropTypes.func,
	};

	render() {
		const { basePath, siteId, siteFragment, status, translate } = this.props;

		return (
			<Main className="comments" wideLayout>
				<PageViewTracker path={ basePath } title="Comments" />
				<DocumentHead title={ translate( 'Comments' ) } />
				<SidebarNavigation />
				<CommentList
					siteId={ siteId }
					siteFragment={ siteFragment }
					status={ status }
					order={ 'desc' }
				/>
			</Main>
		);
	}
}

const mapStateToProps = ( state, { siteFragment } ) => ( {
	siteId: getSiteId( state, siteFragment ),
} );

export default connect( mapStateToProps )( localize( CommentsManagement ) );
