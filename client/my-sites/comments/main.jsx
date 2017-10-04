/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
import { canCurrentUser } from 'state/selectors';
import { preventWidows } from 'lib/formatting';
import EmptyContent from 'components/empty-content';

export class CommentsManagement extends Component {
	static propTypes = {
		comments: PropTypes.array,
		page: PropTypes.number,
		showPermissionError: PropTypes.bool,
		siteId: PropTypes.number,
		siteFragment: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		status: PropTypes.string,
		translate: PropTypes.func,
	};

	static defaultProps = {
		page: 1,
		status: 'all',
	};

	render() {
		const {
			showPermissionError,
			page,
			changePage,
			siteId,
			siteFragment,
			status,
			translate,
		} = this.props;

		return (
			<Main className="comments" wideLayout>
				<PageViewTracker path="/comments/:status/:site" title="Comments" />
				<DocumentHead title={ translate( 'Comments' ) } />
				<SidebarNavigation />
				{ showPermissionError && (
					<EmptyContent
						title={ preventWidows(
							translate( "Oops! You don't have permission to manage comments." )
						) }
						line={ preventWidows(
							translate( "If you think you should, contact this site's administrator." )
						) }
						illustration="/calypso/images/illustrations/illustration-500.svg"
					/>
				) }
				{ ! showPermissionError && (
					<CommentList
						page={ page }
						changePage={ changePage }
						siteId={ siteId }
						siteFragment={ siteFragment }
						status={ status }
						order={ 'desc' }
					/>
				) }
			</Main>
		);
	}
}

const mapStateToProps = ( state, { siteFragment } ) => {
	const siteId = getSiteId( state, siteFragment );
	const canModerateComments = canCurrentUser( state, siteId, 'moderate_comments' );
	return {
		siteId,
		showPermissionError: canModerateComments === false,
	};
};

export default connect( mapStateToProps )( localize( CommentsManagement ) );
