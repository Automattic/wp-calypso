/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import { getSiteFrontPageType, getSitePostsPage } from 'state/sites/selectors';

class BlogPostsPage extends React.Component {

	static propTypes = {
		site: React.PropTypes.object,
	}

	static defaultProps = {
		translate: identity,
	}

	state = {
		showPageActions: false,
	}

	togglePageActions = () => {
		this.setState( { showPageActions: ! this.state.showPageActions } );
	}

	render() {
		const { translate } = this.props;

		const isStaticHomePageWithNoPostsPage = this.props.frontPageType === 'page' && ! this.props.postsPage;
		const isCurrentlySetAsHomepage = this.props.frontPageType === 'posts';
		const shouldShow = this.props.isFrontPage || isStaticHomePageWithNoPostsPage;

		if ( ! shouldShow ) {
			return null;
		}

		return (
			<CompactCard className="blog-posts-page">
				{ isStaticHomePageWithNoPostsPage &&
					<div className="blog-posts-page__not-used-badge">{ translate( 'Not Used' ) }</div> }
				{ isCurrentlySetAsHomepage &&
					<Gridicon icon="house" size={ 18 } className="blog-posts-page__home-badge" /> }
				<div className="blog-posts-page__details">
					<div className="blog-posts-page__title">
						{ translate( 'Blog Posts' ) }
					</div>
					<div className="blog-posts-page__info">
						{
							isCurrentlySetAsHomepage
							? translate( 'Your latest posts, shown on homepage' )
							: translate( 'Your latest posts' )
						}
					</div>
				</div>
			</CompactCard>
		);
	}
}

export default connect(
	( state, props ) => {
		return {
			frontPageType: getSiteFrontPageType( state, props.site.ID ),
			isFrontPage: getSiteFrontPageType( state, props.site.ID ) === 'posts',
			postsPage: getSitePostsPage( state, props.site.ID )
		};
	}
)( localize( BlogPostsPage ) );
