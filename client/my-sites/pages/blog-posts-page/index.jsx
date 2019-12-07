/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { getSiteFrontPageType, getSitePostsPage, getSiteFrontPage } from 'state/sites/selectors';
import isSiteUsingFullSiteEditing from 'state/selectors/is-site-using-full-site-editing';

/**
 * Style dependencies
 */
import './style.scss';

class BlogPostsPage extends React.Component {
	static propTypes = {
		site: PropTypes.object,
		pages: PropTypes.array,
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

	getPageTitle = pageId => {
		const pageTitle = this.getPageProperty( { pageId, property: 'title' } );
		if ( pageTitle ) {
			return pageTitle;
		}
		return pageId
			? `${ this.props.translate( 'Untitled' ) } (#${ pageId })`
			: this.props.translate( 'Untitled' );
	};

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
					{ // Prevent displaying '"Untitled" is the homepage.' while the settings are loading.
					!! this.props.frontPage &&
						this.props.translate( '"%(pageTitle)s" is the homepage.', {
							args: {
								pageTitle: this.getPageTitle( this.props.frontPage ),
							},
						} ) }
				</span>
			);
		}

		if ( isCurrentlySetAsHomepage ) {
			return (
				<span>
					<Gridicon size={ 12 } icon="house" className="blog-posts-page__front-page-icon" />
					{ translate( 'The homepage is showing your latest posts.' ) }
				</span>
			);
		}

		// Prevent displaying '"Untitled" page is showing your latest posts.' while the settings are loading.
		if ( ! this.props.postsPage ) {
			return null;
		}

		return (
			<span>
				{ translate( '"%(pageTitle)s" page is showing your latest posts.', {
					args: {
						pageTitle: this.getPageTitle( this.props.postsPage ),
					},
				} ) }
			</span>
		);
	}

	render() {
		const { isFullSiteEditing, translate } = this.props;

		if ( isFullSiteEditing ) {
			return null;
		}

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
		isFullSiteEditing: isSiteUsingFullSiteEditing( state, props.site.ID ),
	};
} )( localize( BlogPostsPage ) );
