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
import {
	getSiteFrontPageType,
	getSitePostsPage,
	getSiteFrontPage,
} from 'state/sites/selectors';
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

	getPostsPageLink( { isStaticHomePageWithNoPostsPage } ) {
		return ! isStaticHomePageWithNoPostsPage && this.props.site.URL;
	}

	renderPostsPageInfo( { isStaticHomePageWithNoPostsPage, isCurrentlySetAsHomepage } ) {
		const { translate } = this.props;

		if ( isStaticHomePageWithNoPostsPage ) {
			return (
				<span>
					<Gridicon size="12" icon="not-visible" />
					{ this.props.translate( 'Not in use.' ) }
					{
						this.props.translate( '"%(pageTitle)s" is the front page.', {
							args: {
								pageTitle: this.props.frontPage,
							}
						} )
					}
				</span>
			);
		}

		if ( isCurrentlySetAsHomepage ) {
			return (
				<span>
					{ translate( 'Front page is showing your latest posts.' ) }
				</span>
			);
		}

		return (
			<span>
				{
					translate( '"%(pageTitle)s" page is showing your latest posts.', {
						args: {
							pageTitle: this.props.postsPage,
						}
					} )
				}
			</span>
		);
	}

	render() {
		const { translate } = this.props;
		const isStaticHomePageWithNoPostsPage = this.props.frontPageType === 'page' && ! this.props.postsPage;
		const isCurrentlySetAsHomepage = this.props.frontPageType === 'posts';

		return (
			<Card href={ this.getPostsPageLink( { isStaticHomePageWithNoPostsPage } ) }
				target="_blank" rel="noopener noreferrer" className="blog-posts-page">
				<div className="blog-posts-page__details">
					<div className="blog-posts-page__title">
						{ translate( 'Blog Posts' ) }
					</div>
					<div className="blog-posts-page__info">
						{ this.renderPostsPageInfo( { isStaticHomePageWithNoPostsPage, isCurrentlySetAsHomepage } ) }
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
			postsPage: getSitePostsPage( state, props.site.ID ),
			frontPage: getSiteFrontPage( state, props.site.ID ),
		};
	},
	( dispatch ) => bindActionCreators( {
		setFrontPage
	}, dispatch )
)( localize( BlogPostsPage ) );
