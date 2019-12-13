/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import getSiteId from 'state/selectors/get-site-id';
import { isJetpackSite, isJetpackMinimumVersion } from 'state/sites/selectors';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import CommentList from './comment-list';
import CommentTree from './comment-tree';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import canCurrentUser from 'state/selectors/can-current-user';
import { preventWidows } from 'lib/formatting';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import { updatePlugin } from 'state/plugins/installed/actions';
import { getPlugins } from 'state/plugins/installed/selectors';
import { infoNotice } from 'state/notices/actions';
import { isEnabled } from 'config';
import { NEWEST_FIRST } from './constants';

/**
 * Style dependencies
 */
import './style.scss';

export class CommentsManagement extends Component {
	static propTypes = {
		analyticsPath: PropTypes.string,
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

	state = {
		order: NEWEST_FIRST,
	};

	setOrder = order => () => this.setState( { order } );

	updateJetpackHandler = () => {
		const { siteId, translate, jetpackPlugin } = this.props;

		this.props.infoNotice( translate( 'Please wait while we update your Jetpack plugin.' ) );
		this.props.updatePlugin( siteId, jetpackPlugin );
	};

	render() {
		const {
			analyticsPath,
			changePage,
			page,
			postId,
			showCommentList,
			showCommentTree,
			showJetpackUpdateScreen,
			showPermissionError,
			siteId,
			siteFragment,
			status,
			translate,
		} = this.props;
		const { order } = this.state;

		return (
			<Main className="comments" wideLayout>
				{ showJetpackUpdateScreen && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
				<PageViewTracker path={ analyticsPath } title="Comments" />
				<DocumentHead title={ translate( 'Comments' ) } />
				<SidebarNavigation />
				{ showJetpackUpdateScreen && (
					<EmptyContent
						title={ preventWidows( translate( "Looking to manage this site's comments?" ) ) }
						line={ preventWidows(
							translate( 'Please update to the latest version of Jetpack first' )
						) }
						illustration="/calypso/images/illustrations/illustration-404.svg"
						action={ translate( 'Update Jetpack' ) }
						actionCallback={ this.updateJetpackHandler }
					/>
				) }
				{ ! showJetpackUpdateScreen && ! showPermissionError && (
					<FormattedHeader
						className="comments__page-heading"
						headerText={ translate( 'Comments' ) }
						align="left"
					/>
				) }
				{ ! showJetpackUpdateScreen && showPermissionError && (
					<EmptyContent
						title={ preventWidows(
							translate( "Oops! You don't have permission to manage comments." )
						) }
						line={ preventWidows(
							translate( "If you think you should, contact this site's administrator." )
						) }
						illustration="/calypso/images/illustrations/error.svg"
					/>
				) }
				{ showCommentList && (
					<CommentList
						changePage={ changePage }
						order={ order }
						page={ page }
						postId={ postId }
						setOrder={ this.setOrder }
						siteId={ siteId }
						siteFragment={ siteFragment }
						status={ status }
					/>
				) }
				{ showCommentTree && (
					<CommentTree
						changePage={ changePage }
						order={ order }
						page={ page }
						postId={ postId }
						setOrder={ this.setOrder }
						siteId={ siteId }
						siteFragment={ siteFragment }
						status={ status }
					/>
				) }
			</Main>
		);
	}
}

const mapStateToProps = ( state, { postId, siteFragment } ) => {
	const siteId = getSiteId( state, siteFragment );
	const isJetpack = isJetpackSite( state, siteId );
	const isPostView = !! postId;
	const canModerateComments = canCurrentUser( state, siteId, 'edit_posts' );
	const showPermissionError = false === canModerateComments;
	const showJetpackUpdateScreen = isJetpack && ! isJetpackMinimumVersion( state, siteId, '5.6' );

	const sitePlugins = getPlugins( state, [ siteId ] );
	const jetpackPlugin = find( sitePlugins, { slug: 'jetpack' } );

	const showCommentTree =
		! showJetpackUpdateScreen &&
		! showPermissionError &&
		isPostView &&
		isEnabled( 'comments/management/threaded-view' );

	const showCommentList = ! showCommentTree && ! showJetpackUpdateScreen && ! showPermissionError;

	return {
		siteId,
		jetpackPlugin,
		showCommentList,
		showCommentTree,
		showJetpackUpdateScreen,
		showPermissionError,
	};
};

const mapDispatchToProps = {
	updatePlugin,
	infoNotice,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentsManagement ) );
