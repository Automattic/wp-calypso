/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'components/gridicon';
import { isEnabled } from 'config';
import { getSiteFrontPageType, getSitePostsPage } from 'state/sites/selectors';

const BlogPostsPage = React.createClass( {
	propTypes() {
		return {
			homePageType: React.PropTypes.string,
			pageForPosts: React.PropTypes.number
		};
	},

	render() {
		const isStaticHomePageWithNoPostsPage = this.props.frontPageType === 'page' && ! this.props.postsPage;
		const shouldShow = this.props.frontPageType === 'posts' ||
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

		let frontPageIcon = null;
		if ( this.props.frontPageType === 'posts' ) {
			frontPageIcon = <Gridicon icon="house" size={ 18 } />;
		}

		return (
			<CompactCard className="pages__blog-posts-page">
				{ notUsedLabel }
				<span className="pages__blog-posts-page__title" href="">
					{ frontPageIcon }
					{ this.translate( 'Blog Posts' ) }
				</span>
				<div className="pages__blog-posts-page__info">
					{ this.translate( 'Your latest posts' ) }
				</div>
			</CompactCard>
		);
	}
} );

export default connect(
	( state, props ) => {
		return {
			frontPageType: getSiteFrontPageType( state, props.siteId ),
			postsPage: getSitePostsPage( state, props.siteId )
		};
	}
)( BlogPostsPage );
