/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'components/gridicon';
import { isEnabled } from 'config';

const BlogPostsPage = React.createClass( {
	propTypes() {
		return {
			homePageType: React.PropTypes.string,
			pageForPosts: React.PropTypes.number
		};
	},

	render() {
		const isStaticHomePageWithNoPostsPage = this.props.homePageType === 'page' && this.props.pageForPosts === 0;
		const shouldShow = this.props.homePageType === 'posts' ||
			( isEnabled( 'manage/pages/set-homepage' ) && isStaticHomePageWithNoPostsPage );

		if ( ! shouldShow ) {
			return null;
		}

		let notUsedLabel = null;
		if ( isStaticHomePageWithNoPostsPage ) {
			notUsedLabel =
				<div className="pages__blog-posts-page__not-used-label">
					{ this.translate( 'Not Used' ) }
				</div>;
		}

		let homePageIcon = null;
		if ( this.props.homePageType === 'posts' ) {
			homePageIcon = <Gridicon icon="house" size={ 18 } />;
		}

		return (
			<CompactCard className="pages__blog-posts-page">
				{ notUsedLabel }
				<span className="pages__blog-posts-page__title" href="">
					{ homePageIcon }
					{ this.translate( 'Blog Posts' ) }
				</span>
				<div className="pages__blog-posts-page__info">
					{ this.translate( 'Your latest posts' ) }
				</div>
			</CompactCard>
		);
	}
} );

export default BlogPostsPage;
