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

	getPostsPageLink( { isCurrentlySetAsHomepage } ) {
		if ( ! isCurrentlySetAsHomepage ) {
			return this.getPageProperty( { pageId: this.props.postsPage, property: 'URL' } );
		}

		return this.props.site.URL;
	}

	renderPostsPageInfo( { isCurrentlySetAsHomepage } ) {
		const { translate } = this.props;

		if ( isCurrentlySetAsHomepage ) {
			return (
				<span>
					<Gridicon size={ 12 } icon="house" className="blog-posts-page__front-page-icon" />
					{ translate( 'The homepage is showing your latest posts.' ) }
				</span>
			);
		}
	}

	render() {
		const { isFullSiteEditing } = this.props;

		if ( isFullSiteEditing ) {
			return null;
		}

		const isCurrentlySetAsHomepage = this.props.frontPageType === 'posts';

		if ( ! isCurrentlySetAsHomepage ) {
			return null;
		}

		return (
			<Card
				href={ this.getPostsPageLink( {
					isCurrentlySetAsHomepage,
				} ) }
				target="_blank"
				rel="noopener noreferrer"
				className="blog-posts-page"
			>
				<div className="blog-posts-page__details">
					<div
						className={ classNames( {
							'blog-posts-page__info': true,
						} ) }
					>
						{ this.renderPostsPageInfo( {
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
