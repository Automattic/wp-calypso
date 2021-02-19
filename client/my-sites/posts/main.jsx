/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PostTypeFilter from 'calypso/my-sites/post-type-filter';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import PostTypeList from 'calypso/my-sites/post-type-list';
import titlecase from 'to-title-case';
import Main from 'calypso/components/main';
import { POST_STATUSES } from 'calypso/state/posts/constants';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { mapPostStatus } from 'calypso/lib/route';

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
		const { author, category, search, siteId, statusSlug, tag, translate } = this.props;
		const status = mapPostStatus( statusSlug );
		const query = {
			author,
			category,
			number: 20, // max supported by /me/posts endpoint for all-sites mode
			order: status === 'future' ? 'ASC' : 'DESC',
			search,
			site_visibility: ! siteId ? 'visible' : undefined,
			// When searching, search across all statuses so the user can
			// always find what they are looking for, regardless of what tab
			// the search was initiated from. Use POST_STATUSES rather than
			// "any" to do this, since the latter excludes trashed posts.
			status: search ? POST_STATUSES.join( ',' ) : status,
			tag,
			type: 'post',
		};
		// Since searches are across all statuses, the status needs to be shown
		// next to each post.
		const showPublishedStatus = Boolean( query.search );

		return (
			<Main wideLayout className="posts">
				<PageViewTracker path={ this.getAnalyticsPath() } title={ this.getAnalyticsTitle() } />
				<DocumentHead title={ translate( 'Posts' ) } />
				<SidebarNavigation />
				<FormattedHeader
					brandFont
					className="posts__page-heading"
					headerText={ translate( 'Posts' ) }
					align="left"
				/>
				<PostTypeFilter query={ query } siteId={ siteId } statusSlug={ statusSlug } />
				<PostTypeList
					query={ query }
					showPublishedStatus={ showPublishedStatus }
					scrollContainer={ document.body }
				/>
			</Main>
		);
	}
}

export default connect( ( state ) => ( {
	siteId: getSelectedSiteId( state ),
} ) )( localize( PostsMain ) );
