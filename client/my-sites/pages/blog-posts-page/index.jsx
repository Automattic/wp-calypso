/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { identity, noop } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { getSiteFrontPageType, getSitePostsPage, getSiteFrontPage } from 'state/sites/selectors';
import isSiteUsingFullSiteEditing from 'state/selectors/is-site-using-full-site-editing';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class BlogPostsPage extends React.Component {
	static propTypes = {
		site: PropTypes.object,
		recordCalloutClick: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
		recordCalloutClick: noop,
	};

	getPostsPageLink() {
		return this.props.site.URL;
	}

	renderPostsPageInfo() {
		const { translate } = this.props;

		return (
			<span>
				<Gridicon size={ 12 } icon="house" className="blog-posts-page__front-page-icon" />
				{ translate( 'The homepage is showing your latest posts.' ) }
			</span>
		);
	}

	recordCalloutClick = () => {
		this.props.recordCalloutClick( this.props.site.ID );
	};

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
				href={ this.getPostsPageLink() }
				target="_blank"
				rel="noopener noreferrer"
				className="blog-posts-page"
				onClick={ this.recordCalloutClick }
			>
				<div className="blog-posts-page__details">
					<div
						className={ classNames( {
							'blog-posts-page__info': true,
						} ) }
					>
						{ this.renderPostsPageInfo() }
					</div>
				</div>
			</Card>
		);
	}
}

const mapDispatchToProps = ( dispatch ) => ( {
	recordCalloutClick: ( siteId ) => {
		dispatch( recordTracksEvent( 'calypso_pages_blog_posts_callout_click', { blog_id: siteId } ) );
	},
} );

export default connect( ( state, props ) => {
	return {
		frontPageType: getSiteFrontPageType( state, props.site.ID ),
		isFrontPage: getSiteFrontPageType( state, props.site.ID ) === 'posts',
		postsPage: getSitePostsPage( state, props.site.ID ),
		frontPage: getSiteFrontPage( state, props.site.ID ),
		isFullSiteEditing: isSiteUsingFullSiteEditing( state, props.site.ID ),
	};
}, mapDispatchToProps )( localize( BlogPostsPage ) );
