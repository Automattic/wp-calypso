/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { getSiteFrontPageType, getSitePostsPage } from 'state/sites/selectors';
import { setFrontPage } from 'state/sites/actions';

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

	renderNotInUseInfo() {
		return (
			<span>
				<Gridicon size="12" icon="not-visible" />
				{ this.props.translate( 'Not in use.' ) }
			</span>
		);
	}

	render() {
		const { translate } = this.props;

		const isStaticHomePageWithNoPostsPage = this.props.frontPageType === 'page' && ! this.props.postsPage;
		const isCurrentlySetAsHomepage = this.props.frontPageType === 'posts';

		const blogPostsPageHref = ! isStaticHomePageWithNoPostsPage && this.props.site.URL;

		return (
			<Card href={ blogPostsPageHref } target="_blank" rel="noopener noreferrer" className="blog-posts-page">
				<div className="blog-posts-page__details">
					<div className="blog-posts-page__title">
						{ translate( 'Blog Posts' ) }
					</div>
					<div className="blog-posts-page__info">
						{ isStaticHomePageWithNoPostsPage && this.renderNotInUseInfo() }
						{
							isCurrentlySetAsHomepage
							? translate( 'Your latest posts, shown on homepage' )
							: translate( 'Your latest posts' )
						}
					</div>
				</div>
			</Card>
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
	},
	( dispatch ) => bindActionCreators( {
		setFrontPage
	}, dispatch )
)( localize( BlogPostsPage ) );
