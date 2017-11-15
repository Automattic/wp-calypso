/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import config from 'config';
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
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { canCurrentUser } from 'state/selectors';
import { preventWidows } from 'lib/formatting';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import { updatePlugin } from 'state/plugins/installed/actions';
import { getPlugins } from 'state/plugins/installed/selectors';
import { infoNotice } from 'state/notices/actions';

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

	updateJetpackHandler = () => {
		const { siteId, translate, jetpackPlugin } = this.props;

		this.props.infoNotice( translate( 'Please wait while we update your Jetpack plugin.' ) );
		this.props.updatePlugin( siteId, jetpackPlugin );
	};

	render() {
		const {
			changePage,
			showJetpackUpdateScreen,
			page,
			postId,
			showPermissionError,
			siteId,
			siteFragment,
			status,
			translate,
		} = this.props;

		return (
			<Main className="comments" wideLayout>
				{ showJetpackUpdateScreen && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
				<PageViewTracker path="/comments/:status/:site" title="Comments" />
				<DocumentHead title={ translate( 'Comments' ) } />
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
	const isJetpack = isJetpackSite( state, siteId );
	const canModerateComments = canCurrentUser( state, siteId, 'moderate_comments' );
	const showJetpackUpdateScreen =
		isJetpack &&
		! isJetpackMinimumVersion( state, siteId, '5.5' ) &&
		config.isEnabled( 'comments/management/jetpack-5.5' );

	const sitePlugins = getPlugins( state, [ siteId ] );
	const jetpackPlugin = find( sitePlugins, { slug: 'jetpack' } );

	return {
		siteId,
		jetpackPlugin,
		showJetpackUpdateScreen,
		showPermissionError: canModerateComments === false,
	};
};

const mapDispatchToProps = {
	updatePlugin,
	infoNotice,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentsManagement ) );
