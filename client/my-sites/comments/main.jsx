/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
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
		basePath: PropTypes.string,
		comments: PropTypes.array,
		showPermissionError: PropTypes.bool,
		siteId: PropTypes.number,
		siteFragment: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.number,
		] ),
		status: PropTypes.string,
		translate: PropTypes.func,
	};

	render() {
		const {
			showPermissionError,
			basePath,
			siteId,
			siteFragment,
			status,
			translate,
		} = this.props;

		return (
			<Main className="comments" wideLayout>
				<PageViewTracker path={ basePath } title="Comments" />
				<DocumentHead title={ translate( 'Comments' ) } />
				<SidebarNavigation />
				{ showPermissionError && <EmptyContent
					title={ preventWidows( translate( 'Oops! You don\'t have permission to manage comments.' ) ) }
					line={ preventWidows( translate( 'If you think you should, contact this site\'s administrator.' ) ) }
					illustration="/calypso/images/illustrations/illustration-500.svg" />
				}
				{ ! showPermissionError && <CommentList
					siteId={ siteId }
					siteFragment={ siteFragment }
					status={ status }
					order={ 'desc' }
				/> }
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
