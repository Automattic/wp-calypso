/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { getSiteFrontPageType, getSitePostsPage, getSiteFrontPage } from 'state/sites/selectors';

class BlogPostsPage extends React.Component {
	static propTypes = {
		site: React.PropTypes.object,
		pages: React.PropTypes.array,
	};

	static defaultProps = {
		translate: identity,
	};

	getPageProperty( { pageId, property } ) {
		return this.props.pages
			.filter( page => page.ID === pageId )
			.map( page => page[ property ] )
			.shift();
	}

	getPostsPageLink( { isStaticHomePageWithNoPostsPage, isCurrentlySetAsHomepage } ) {
		if ( isStaticHomePageWithNoPostsPage ) {
			return null;
		}

		if ( ! isCurrentlySetAsHomepage ) {
			return this.getPageProperty( { pageId: this.props.postsPage, property: 'URL' } );
		}

		return this.props.site.URL;
	}

	renderPostsPageInfo( { isStaticHomePageWithNoPostsPage, isCurrentlySetAsHomepage } ) {
		const { translate } = this.props;

		if ( isStaticHomePageWithNoPostsPage ) {
			return (
				<span>
					<Gridicon size={ 12 } icon="not-visible" className="blog-posts-page__not-used-icon" />
					{ this.props.translate( 'Not in use.' ) + ' ' }
					{ this.props.translate( '"%(pageTitle)s" is the front page.', {
						args: {
							pageTitle: this.getPageProperty( {
								pageId: this.props.frontPage,
								property: 'title',
							} ),
						},
					} ) }
				</span>
			);
		}

		if ( isCurrentlySetAsHomepage ) {
			return (
				<span>
					<Gridicon size={ 12 } icon="house" className="blog-posts-page__front-page-icon" />
					{ translate( 'Front page is showing your latest posts.' ) }
				</span>
			);
		}

		return (
			<span>
				{ translate( '"%(pageTitle)s" page is showing your latest posts.', {
					args: {
						pageTitle: this.getPageProperty( { pageId: this.props.postsPage, property: 'title' } ),
					},
				} ) }
			</span>
		);
	}

	render() {
		const { translate } = this.props;
		const isStaticHomePageWithNoPostsPage =
			this.props.frontPageType === 'page' && ! this.props.postsPage;
		const isCurrentlySetAsHomepage = this.props.frontPageType === 'posts';

		return (
			<Card
				href={ this.getPostsPageLink( {
					isStaticHomePageWithNoPostsPage,
					isCurrentlySetAsHomepage,
				} ) }
				target="_blank"
				rel="noopener noreferrer"
				className="blog-posts-page"
			>
				<div className="blog-posts-page__details">
					<div
						className={ classNames( {
							'blog-posts-page__title': true,
							'is-disabled': isStaticHomePageWithNoPostsPage,
						} ) }
					>
						{ translate( 'Blog Posts' ) }
					</div>
					<div
						className={ classNames( {
							'blog-posts-page__info': true,
							'is-disabled': isStaticHomePageWithNoPostsPage,
						} ) }
					>
						{ this.renderPostsPageInfo( {
							isStaticHomePageWithNoPostsPage,
							isCurrentlySetAsHomepage,
						} ) }
					</div>
				</div>
			</Card>
		);
	}
}

export default connect( ( state, props ) => {
	return {
		frontPageType: getSiteFrontPageType( state, props.site.ID ),
		isFrontPage: getSiteFrontPageType( state, props.site.ID ) === 'posts',
		postsPage: getSitePostsPage( state, props.site.ID ),
		frontPage: getSiteFrontPage( state, props.site.ID ),
	};
} )( localize( BlogPostsPage ) );
