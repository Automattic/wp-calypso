/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PostTypeFilter from 'my-sites/post-type-filter';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PostTypeList from 'my-sites/post-type-list';
import PostTypeBulkEditBar from 'my-sites/post-type-list/bulk-edit-bar';
import titlecase from 'to-title-case';
import config from 'config';
import Main from 'components/main';
import { getSelectedSiteId } from 'state/ui/selectors';
import { mapPostStatus as mapStatus } from 'lib/route';
import { warningNotice } from 'state/notices/actions';
import {
	getSiteAdminUrl,
	isJetpackSite,
	siteHasMinimumJetpackVersion,
} from 'state/sites/selectors';

class PostsMain extends React.Component {
	UNSAFE_componentWillMount() {
		this.setWarning( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if (
			nextProps.siteId !== this.props.siteId ||
			nextProps.hasMinimumJetpackVersion !== this.props.hasMinimumJetpackVersion
		) {
			this.setWarning( nextProps );
		}
	}

	getAnalyticsPath() {
		const { siteId, statusSlug, author } = this.props;
		let analyticsPath = '/posts';

		if ( author ) {
			analyticsPath += '/my';
		}

		if ( statusSlug ) {
			analyticsPath += `/${ statusSlug }`;
		}

		if ( siteId ) {
			analyticsPath += '/:site';
		}

		return analyticsPath;
	}

	getAnalyticsTitle() {
		const { statusSlug } = this.props;

		if ( statusSlug ) {
			return 'Blog Posts > ' + titlecase( statusSlug );
		}

		return 'Blog Posts > Published';
	}

	render() {
		const { author, category, search, siteId, statusSlug, tag } = this.props;
		const classes = classnames( 'posts', {
			'is-multisite': ! this.props.siteId,
			'is-single-site': this.props.siteId,
		} );
		const status = mapStatus( statusSlug );
		const query = {
			author,
			category,
			number: 20, // max supported by /me/posts endpoint for all-sites mode
			order: status === 'future' ? 'ASC' : 'DESC',
			search,
			site_visibility: ! siteId ? 'visible' : undefined,
			status,
			tag,
			type: 'post',
		};

		return (
			<Main className={ classes }>
				<PageViewTracker path={ this.getAnalyticsPath() } title={ this.getAnalyticsTitle() } />
				<SidebarNavigation />
				<div className="posts__primary">
					<PostTypeFilter query={ query } siteId={ siteId } statusSlug={ statusSlug } />
					{ siteId && <PostTypeBulkEditBar /> }
					<PostTypeList query={ query } scrollContainer={ document.body } />
				</div>
			</Main>
		);
	}

	setWarning = ( { adminUrl, hasMinimumJetpackVersion, isJetpack, siteId } ) => {
		if ( siteId && isJetpack && false === hasMinimumJetpackVersion ) {
			this.props.warningNotice(
				this.props.translate(
					'Jetpack %(version)s is required to take full advantage of all post editing features.',
					{
						args: { version: config( 'jetpack_min_version' ) },
					}
				),
				{
					button: this.props.translate( 'Update now' ),
					href: adminUrl,
				}
			);
		}
	};
}

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );

	return {
		adminUrl: getSiteAdminUrl( state, siteId, 'plugins.php?plugin_status=upgrade' ),
		hasMinimumJetpackVersion: siteHasMinimumJetpackVersion( state, siteId ),
		isJetpack: isJetpackSite( state, siteId ),
		siteId,
	};
}

export default connect(
	mapStateToProps,
	{
		warningNotice,
	}
)( localize( PostsMain ) );
