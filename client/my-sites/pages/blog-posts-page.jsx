/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'components/gridicon';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { isEnabled } from 'config';
import { getSiteFrontPageType, getSitePostsPage } from 'state/sites/selectors';
import { setFrontPage } from 'state/sites/actions';

const BlogPostsPage = React.createClass( {
	propTypes() {
		return {
			homePageType: React.PropTypes.string,
			pageForPosts: React.PropTypes.number
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
		this.props.setFrontPage( this.props.siteId, 0 );
	},

	getSetAsHomepageItem: function() {
		if ( this.props.isFrontPage ) {
			return null;
		}

		return (
			<PopoverMenuItem onClick={ this.setAsHomepage }>
				<Gridicon icon="house" size={ 18 } />
				{ this.translate( 'Set as Homepage' ) }
			</PopoverMenuItem>
		);
	},

	getFrontPageInfo: function() {
		if ( ! this.props.isFrontPage ) {
			return null;
		}

		return (
			<div className="pages__blog-posts-page__popover-more-info">
				{ this.translate( 'This page is set as your site\'s homepage' ) }
			</div>
		);
	},

	render() {
		const isStaticHomePageWithNoPostsPage = this.props.frontPageType === 'page' && ! this.props.postsPage;
		const shouldShow = this.props.isFrontPage ||
			( isEnabled( 'manage/pages/set-homepage' ) && isStaticHomePageWithNoPostsPage );

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

		let frontPageIcon = null;
		if ( this.props.frontPageType === 'posts' ) {
			frontPageIcon = <Gridicon icon="house" size={ 18 } />;
		}

		return (
			<CompactCard className="pages__blog-posts-page">
				{ notUsedLabel }
				<span className="pages__blog-posts-page__title" href="">
					{ frontPageIcon }
					{ this.translate( 'Blog Posts' ) }
				</span>
				<div className="pages__blog-posts-page__info">
					{ this.translate( 'Your latest posts' ) }
				</div>
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
					{ this.getFrontPageInfo() }
				</PopoverMenu>
			</CompactCard>
		);
	}
} );

export default connect(
	( state, props ) => {
		return {
			frontPageType: getSiteFrontPageType( state, props.siteId ),
			isFrontPage: getSiteFrontPageType( state, props.siteId ) === 'posts',
			postsPage: getSitePostsPage( state, props.siteId )
		};
	},
	( dispatch ) => bindActionCreators( {
		setFrontPage
	}, dispatch )
)( BlogPostsPage );
