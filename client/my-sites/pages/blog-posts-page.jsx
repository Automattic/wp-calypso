/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'components/gridicon';

const BlogPostsPage = React.createClass( {
	render() {
		return (
			<CompactCard className="pages__blog-posts-page">
				<span className="pages__blog-posts-page__title" href="">
					<Gridicon icon="house" size={ 18 } />
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
