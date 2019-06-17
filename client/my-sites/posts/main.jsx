/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PostTypeFilter from 'my-sites/post-type-filter';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PostTypeList from 'my-sites/post-type-list';
import PostTypeBulkEditBar from 'my-sites/post-type-list/bulk-edit-bar';
import titlecase from 'to-title-case';
import Main from 'components/main';
import { getSelectedSiteId } from 'state/ui/selectors';
import { mapPostStatus } from 'lib/route';

/**
 * Style dependencies
 */
import './style.scss';

class PostsMain extends React.Component {
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
		const status = mapPostStatus( statusSlug );
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
			<Main className="posts">
				<PageViewTracker path={ this.getAnalyticsPath() } title={ this.getAnalyticsTitle() } />
				<SidebarNavigation />
				<PostTypeFilter query={ query } siteId={ siteId } statusSlug={ statusSlug } />
				{ siteId && <PostTypeBulkEditBar /> }
				<PostTypeList query={ query } scrollContainer={ document.body } />
			</Main>
		);
	}
}

export default connect( state => ( {
	siteId: getSelectedSiteId( state ),
} ) )( PostsMain );
