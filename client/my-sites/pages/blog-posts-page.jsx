/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
			site: React.PropTypes.object
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
				{ this.translate( 'Set as Homepage' ) }
			</PopoverMenuItem>
		);
	},

	render() {
		const isStaticHomePageWithNoPostsPage = this.props.frontPageType === 'page' && ! this.props.postsPage;
		const isCurrentlySetAsHomepage = this.props.frontPageType === 'posts';
		const shouldShow = this.props.isFrontPage ||
			( isEnabled( 'manage/pages/set-homepage' ) && isStaticHomePageWithNoPostsPage );
		const shouldShowPageActions = ! isCurrentlySetAsHomepage &&
			userCan( 'edit_theme_options', this.props.site ) && isEnabled( 'manage/pages/set-homepage' );

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

		return (
			<CompactCard className="pages__blog-posts-page">
				{ notUsedLabel }
				<span className="pages__blog-posts-page__title" href="">
					{ isCurrentlySetAsHomepage ? <Gridicon icon="house" size={ 18 } /> : null }
					{ this.translate( 'Blog Posts' ) }
				</span>
				<div className="pages__blog-posts-page__info">
					{
						isCurrentlySetAsHomepage
						? this.translate( 'Your latest posts, shown on homepage' )
						: this.translate( 'Your latest posts' )
					}
				</div>
				{
					shouldShowPageActions
					? <div>
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
)( BlogPostsPage );
