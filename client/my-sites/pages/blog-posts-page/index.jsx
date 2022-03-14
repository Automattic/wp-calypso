import { Card, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getSiteFrontPageType,
	getSitePostsPage,
	getSiteFrontPage,
} from 'calypso/state/sites/selectors';

import './style.scss';

const noop = () => {};

class BlogPostsPage extends Component {
	static propTypes = {
		site: PropTypes.object,
		recordCalloutClick: PropTypes.func,
	};

	static defaultProps = {
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
	};
}, mapDispatchToProps )( localize( BlogPostsPage ) );
