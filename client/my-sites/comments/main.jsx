/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import config from 'config';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import getSiteId from 'state/selectors/get-site-id';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite, isJetpackMinimumVersion } from 'state/sites/selectors';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import CommentList from './comment-list';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { canCurrentUser } from 'state/selectors';
import { preventWidows } from 'lib/formatting';

export class CommentsManagement extends Component {
	static propTypes = {
		comments: PropTypes.array,
		page: PropTypes.number,
		postId: PropTypes.number,
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
			isJetpack,
			jetpackCommentsManagementSupported,
			showPermissionError,
			page,
			changePage,
			page,
			postId,
			showPermissionError,
			siteId,
			siteFragment,
			status,
			translate,
		} = this.props;

		const jetpackUpdateLink = `/plugins/jetpack/${ this.props.siteSlug }`;

		const showJetpackUpdateScreen =
			isJetpack &&
			! jetpackCommentsManagementSupported &&
			config.isEnabled( 'comments/management/jetpack-5.5' );

		return (
			<Main className="comments" wideLayout>
				<PageViewTracker path="/comments/:status/:site" title="Comments" />
				<DocumentHead title={ translate( 'Comments' ) } />
				{ showJetpackUpdateScreen && (
					<EmptyContent
						title={ preventWidows( translate( "Looking to manage this site's comments?" ) ) }
						line={ preventWidows(
							translate( 'We need you to update to the latest version of Jetpack' )
						) }
						illustration="/calypso/images/illustrations/illustration-404.svg"
						action={ translate( 'Update Jetpack' ) }
						actionURL={ jetpackUpdateLink }
						secondaryAction={ translate( 'Enable autoupdates' ) }
						secondaryActionURL={ jetpackUpdateLink }
					/>
				) }
				{ ! showJetpackUpdateScreen && <SidebarNavigation /> }
				{ ! showJetpackUpdateScreen &&
				showPermissionError && (
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
				{ ! showJetpackUpdateScreen &&
				! showPermissionError && (
					<CommentList
						changePage={ changePage }
						order={ 'desc' }
						page={ page }
						postId={ postId }
						siteId={ siteId }
						siteFragment={ siteFragment }
						status={ status }
					/>
				) }
			</Main>
		);
	}
}

const mapStateToProps = ( state, { siteFragment } ) => {
	const siteId = getSiteId( state, siteFragment );
	const siteSlug = getSelectedSiteSlug( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );
	const jetpackCommentsManagementSupported = isJetpackMinimumVersion( state, siteId, '5.5' );
	const canModerateComments = canCurrentUser( state, siteId, 'moderate_comments' );
	return {
		siteId,
		siteSlug,
		isJetpack,
		jetpackCommentsManagementSupported,
		showPermissionError: canModerateComments === false,
	};
};

export default connect( mapStateToProps )( localize( CommentsManagement ) );
