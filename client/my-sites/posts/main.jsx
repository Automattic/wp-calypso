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
import Main from 'components/main';
import { getSelectedSiteId } from 'state/ui/selectors';
import { mapPostStatus as mapStatus } from 'lib/route';

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
}

export default connect( state => ( {
	siteId: getSelectedSiteId( state ),
} ) )( localize( PostsMain ) );
