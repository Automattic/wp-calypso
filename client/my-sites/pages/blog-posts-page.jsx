/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { isEnabled } from 'config';
import { getSiteFrontPageType, getSitePostsPage } from 'state/sites/selectors';
import { setFrontPage } from 'state/sites/actions';
import { userCan } from 'lib/site/utils';
import { updateSitesList } from './helpers';

const BlogPostsPage = React.createClass( {
	propTypes() {
		return {
			site: React.PropTypes.object,
		};
	},

	getDefaultProps: function() {
		return {
			translate: identity,
		};
	},

	getInitialState: function() {
		return {
			showPageActions: false
		};
	},

	togglePageActions: function() {
		this.setState( { showPageActions: ! this.state.showPageActions } );
	},

	setAsHomepage: function() {
		this.setState( { showPageActions: false } );
		this.props.setFrontPage( this.props.site.ID, 0, updateSitesList );
	},

	getSetAsHomepageItem: function() {
		return (
			<PopoverMenuItem onClick={ this.setAsHomepage }>
				<Gridicon icon="house" size={ 18 } />
				{ this.props.translate( 'Set as Homepage' ) }
			</PopoverMenuItem>
		);
	},

	render() {
		const { translate } = this.props;

		const isStaticHomePageWithNoPostsPage = this.props.frontPageType === 'page' && ! this.props.postsPage;
		const isCurrentlySetAsHomepage = this.props.frontPageType === 'posts';
		const shouldShow = this.props.isFrontPage ||
			( isEnabled( 'manage/pages/set-homepage' ) && isStaticHomePageWithNoPostsPage );
		const shouldShowPageActions = ! isCurrentlySetAsHomepage &&
			userCan( 'edit_theme_options', this.props.site ) && isEnabled( 'manage/pages/set-homepage' );

		if ( ! shouldShow ) {
			return null;
		}

		return (
			<CompactCard className="pages__blog-posts-page">
				{ isStaticHomePageWithNoPostsPage &&
					<div className="pages__blog-posts-page__not-used-badge">{ translate( 'Not Used' ) }</div> }
				{ isCurrentlySetAsHomepage &&
					<Gridicon icon="house" size={ 18 } className="pages__blog-posts-page__home-badge" /> }
				<div className="pages__blog-posts-page__details">
					<div className="pages__blog-posts-page__title">
						{ translate( 'Blog Posts' ) }
					</div>
					<div className="pages__blog-posts-page__info">
						{
							isCurrentlySetAsHomepage
							? translate( 'Your latest posts, shown on homepage' )
							: translate( 'Your latest posts' )
						}
					</div>
				</div>
				{
					shouldShowPageActions
					? <div className="pages__blog-posts-page__actions">
							<Gridicon
								icon="ellipsis"
								className={ classNames( {
									'page__actions-toggle': true,
									'is-active': this.state.showPageActions
								} ) }
								onClick={ this.togglePageActions }
								ref="popoverMenuButton" />
							<PopoverMenu
								isVisible={ this.state.showPageActions }
								onClose={ this.togglePageActions }
								position={ 'bottom left' }
								context={ this.refs && this.refs.popoverMenuButton }
							>
								{ this.getSetAsHomepageItem() }
							</PopoverMenu>
						</div>
					: null
				}

			</CompactCard>
		);
	}
} );

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
