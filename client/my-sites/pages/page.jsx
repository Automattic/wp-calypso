/**
 * External dependencies
 */
var React = require( 'react' ),
	ReactCSSTransitionGroup = require( 'react-addons-css-transition-group' ),
	i18n = require( 'i18n-calypso' ),
	page = require( 'page' );

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
var updatePostStatus = require( 'lib/mixins/update-post-status' ),
	CompactCard = require( 'components/card/compact' ),
	Gridicon = require( 'gridicons' ),
	PopoverMenu = require( 'components/popover/menu' ),
	PopoverMenuItem = require( 'components/popover/menu-item' ),
	SiteIcon = require( 'blocks/site-icon' ),
	helpers = require( './helpers' ),
	analytics = require( 'lib/analytics' ),
	utils = require( 'lib/posts/utils' ),
	classNames = require( 'classnames' ),
	config = require( 'config' );

import MenuSeparator from 'components/popover/menu-separator';
import { getSelectedSiteId } from 'state/ui/selectors';
import { hasStaticFrontPage, isSitePreviewable } from 'state/sites/selectors';
import {
	isFrontPage,
	isPostsPage,
} from 'state/pages/selectors';
import { setFrontPage } from 'state/sites/actions';
import { userCan } from 'lib/site/utils';
import { updateSitesList } from './helpers';
import { setPreviewUrl } from 'state/ui/preview/actions';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { getPreviewURL } from 'lib/posts/utils';

function recordEvent( eventAction ) {
	analytics.ga.recordEvent( 'Pages', eventAction );
}

function getReadableStatus( status ) {
	var humanReadableStatus = {
		'publish': i18n.translate( 'Published' ),
		'draft': i18n.translate( 'Draft' ),
		'pending': i18n.translate( 'Pending' ),
		'future': i18n.translate( 'Future' ),
		'private': i18n.translate( 'Private' ),
		'trash': i18n.translate( 'Trashed' )
	};

	return humanReadableStatus [ status ] || status;
}

const Page = React.createClass( {

	displayName: 'Page',

	mixins: [ updatePostStatus ],

	analyticsEvents: {
		moreOptions: function() {
			recordEvent( 'Clicked More Options Menu' );
		},
		pageTitle: function() {
			recordEvent( 'Clicked Page Title' );
		},
		editPage: function() {
			recordEvent( 'Clicked Edit Page' );
		},
		viewPage: function() {
			recordEvent( 'Clicked View Page' );
		}
	},

	getInitialState: function() {
		return {
			showPageActions: false
		};
	},

	componentWillMount: function() {
		// used from the `update-post-status` mixin
		this.strings = {
			trashing: this.translate( 'Trashing Page' ),
			deleting: this.translate( 'Deleting Page' ),
			trashed: this.translate( 'Moved to Trash' ),
			undo: this.translate( 'undo?' ),
			restoring: this.translate( 'Restoring Page' ),
			restored: this.translate( 'Page Restored' ),
			deleted: this.translate( 'Page Deleted' ),
			updating: this.translate( 'Updating Page' ),
			error: this.translate( 'Error' ),
			updated: this.translate( 'Updated' ),
			deleteWarning: this.translate( 'Delete this page permanently?' )
		};
	},

	togglePageActions: function() {
		this.setState( { showPageActions: ! this.state.showPageActions } );
		if ( this.state.showPageActions ) {
			this.analyticsEvents.moreOptions();
		}
	},

	// Construct a link to the Site the page belongs too
	getSiteDomain: function() {
		return ( this.props.site && this.props.site.domain ) || '...';
	},

	setAsHomepage: function() {
		this.setState( { showPageActions: false } );
		this.props.setFrontPage( this.props.page.site_ID, this.props.page.ID, updateSitesList );
	},

	getSetAsHomepageItem: function() {
		if ( ! this.props.selectedSiteId ) {
			return null;
		}

		const isPublished = this.props.page.status === 'publish';

		if ( ! isPublished || this.props.isFrontPage ||
			! config.isEnabled( 'manage/pages/set-homepage' ) ||
			! userCan( 'edit_theme_options', this.props.site ) ) {
			return null;
		}

		return (
			<PopoverMenuItem onClick={ this.setAsHomepage }>
				<Gridicon icon="house" size={ 18 } />
				{ this.translate( 'Set as Homepage' ) }
			</PopoverMenuItem>
		);
	},

	viewPage: function( event ) {
		event.preventDefault();
		const { isPreviewable, previewURL } = this.props;

		if ( this.props.page.status && this.props.page.status === 'publish' ) {
			this.analyticsEvents.viewPage();
		}

		if ( ! isPreviewable ) {
			return window.open( previewURL );
		}

		this.props.setPreviewUrl( previewURL );
		this.props.setLayoutFocus( 'preview' );
	},

	getViewItem: function() {
		const { isPreviewable } = this.props;
		if ( this.props.page.status === 'trash' ) {
			return null;
		}

		if ( this.props.hasStaticFrontPage && this.props.isPostsPage ) {
			return null;
		}

		if ( this.props.page.status !== 'publish' ) {
			return (
				<PopoverMenuItem onClick={ this.viewPage }>
					<Gridicon icon={ isPreviewable ? 'visible' : 'external' } size={ 18 } />
					{ this.translate( 'Preview' ) }
				</PopoverMenuItem>
			);
		}

		return (
			<PopoverMenuItem onClick={ this.viewPage }>
				<Gridicon icon={ isPreviewable ? 'visible' : 'external' } size={ 18 } />
				{ this.translate( 'View Page' ) }
			</PopoverMenuItem>
		);
	},

	childPageInfo: function() {
		var page = this.props.page,
			site = this.props.site,
			parentTitle, parentHref, parentLink;

		if ( ! page.parent ) {
			return null;
		}

		parentTitle = page.parent.title || this.translate( '( Untitled )' );

		// This is technically if you can edit the current page, not the parent.
		// Capabilities are not exposed on the parent page.
		parentHref = utils.userCan( 'edit_post', this.props.page ) ? helpers.editLinkForPage( page.parent, site ) : page.parent.URL;
		parentLink = <a href={ parentHref }>{ parentTitle }</a>;

		return ( <div className="page__popover-more-info">{
			this.translate( "Child of {{PageTitle/}}", {
				components: {
					PageTitle: parentLink
				}
			} )
		}</div> );
	},

	frontPageInfo: function() {
		if ( ! this.props.isFrontPage ) {
			return null;
		}

		if ( config.isEnabled( 'manage/pages/set-homepage' ) ) {
			return ( <div className="page__popover-more-info">{
				this.translate( 'This page is set as your site\'s homepage' )
			}</div> );
		} else {
			return ( <div className="page__popover-more-info">{
				this.translate( 'Currently set as {{link}}Front Page{{/link}}', {
					components: {
						link: <a target="_blank" rel="noopener noreferrer" href={ this.props.site.options.admin_url + 'options-reading.php' } />
					}
				} )
			}</div> );
		}
	},

	getPublishItem: function() {
		if ( this.props.page.status === 'publish' || ! utils.userCan( 'publish_post', this.props.page ) || this.props.page.status === 'trash' ) {
			return null;
		}

		return (
			<PopoverMenuItem onClick={ this.updateStatusPublish }>
				<Gridicon icon="checkmark" size={ 18 } />
				{ this.translate( 'Publish' ) }
			</PopoverMenuItem>
		);
	},

	getEditItem: function() {
		if ( this.props.hasStaticFrontPage && this.props.isPostsPage ) {
			return null;
		}

		if ( ! utils.userCan( 'edit_post', this.props.page ) ) {
			return null;
		}

		return (
			<PopoverMenuItem onClick={ this.editPage }>
				<Gridicon icon="pencil" size={ 18 } />
				{ this.translate( 'Edit' ) }
			</PopoverMenuItem>
		);
	},

	getSendToTrashItem: function() {
		if ( ( this.props.hasStaticFrontPage && this.props.isPostsPage ) || this.props.isFrontPage ) {
			return null;
		}

		if ( ! utils.userCan( 'delete_post', this.props.page ) ) {
			return null;
		}

		if ( this.props.page.status !== 'trash' ) {
			return (
				<PopoverMenuItem className="page__trash-item" onClick={ this.updateStatusTrash }>
					<Gridicon icon="trash" size={ 18 } />
					{ this.translate( 'Trash' ) }
				</PopoverMenuItem>
			);
		} else {
			return (
				<PopoverMenuItem className="page__delete-item" onClick={ this.updateStatusDelete }>
					<Gridicon icon="trash" size={ 18 } />
					{ this.translate( 'Delete' ) }
				</PopoverMenuItem>
			);
		}
	},

	getCopyItem: function() {
		const { page: post, site } = this.props;
		if (
			! includes( [ 'draft', 'future', 'pending', 'private', 'publish' ], post.status ) ||
			! utils.userCan( 'edit_post', post )
		) {
			return null;
		}
		return (
			<PopoverMenuItem onClick={ this.copyPage } href={ `/page/${ site.slug }?copy=${ post.ID }` }>
				<Gridicon icon="clipboard" size={ 18 } />
				{ this.translate( 'Copy' ) }
			</PopoverMenuItem>
		);
	},

	getRestoreItem: function() {
		if ( this.props.page.status !== 'trash' || ! utils.userCan( 'delete_post', this.props.page ) ) {
			return null;
		}

		return (
			<PopoverMenuItem onClick={ this.updateStatusRestore }>
				<Gridicon icon="undo" size={ 18 } />
				{ this.translate( 'Restore' ) }
			</PopoverMenuItem>
		);
	},

	editPage: function() {
		this.analyticsEvents.editPage();
		page( helpers.editLinkForPage( this.props.page, this.props.site ) );
	},

	getPageStatusInfo: function() {
		if ( this.props.page.status === 'publish' ) {
			return null;
		}

		return <div className="page__popover-more-info">{ getReadableStatus( this.props.page.status ) }</div>;
	},

	popoverMoreInfo: function() {
		var status = this.getPageStatusInfo(),
			childPageInfo = this.childPageInfo(),
			frontPageInfo = this.frontPageInfo();

		if ( ! status && ! childPageInfo && ! frontPageInfo ) {
			return null;
		}

		return (
			<div>
				<MenuSeparator />
				{ status }
				{ childPageInfo }
				{ frontPageInfo }
			</div>
		);
	},

	render: function() {
		var page = this.props.page,
			title = page.title || this.translate( '(no title)' ),
			site = this.props.site || {},
			canEdit = utils.userCan( 'edit_post', this.props.page ),
			depthIndicator;

		if ( page.parent ) {
			depthIndicator = '— ';
		}

		const setAsHomepageItem = this.getSetAsHomepageItem();
		const viewItem = this.getViewItem();
		const publishItem = this.getPublishItem();
		const editItem = this.getEditItem();
		const restoreItem = this.getRestoreItem();
		const sendToTrashItem = this.getSendToTrashItem();
		const copyItem = this.getCopyItem();
		const moreInfoItem = this.popoverMoreInfo();
		const hasSeparatedItems = (
			viewItem || publishItem || editItem ||
			restoreItem || sendToTrashItem || moreInfoItem
		);
		const hasPopoverItems = setAsHomepageItem || hasSeparatedItems;
		const setHomepageMenuSeparator = ( setAsHomepageItem && hasSeparatedItems ) ? <MenuSeparator /> : null;
		const popoverMenu = hasPopoverItems ? (
			<PopoverMenu
				isVisible={ this.state.showPageActions }
				onClose={ this.togglePageActions }
				position={ 'bottom left' }
				context={ this.refs && this.refs.popoverMenuButton }
			>
				{ setAsHomepageItem }
				{ setHomepageMenuSeparator }
				{ viewItem }
				{ publishItem }
				{ editItem }
				{ copyItem }
				{ restoreItem }
				{ sendToTrashItem }
				{ moreInfoItem }
			</PopoverMenu>
		) : null;
		const ellipsisGridicon = hasPopoverItems ? (
			<Gridicon
			icon="ellipsis"
			className={ classNames( {
				'page__actions-toggle': true,
				'is-active': this.state.showPageActions
			} ) }
			onClick={ this.togglePageActions }
			ref="popoverMenuButton" />
		) : null;

		return (
			<CompactCard className="page">
				{ this.props.multisite ? <SiteIcon site={ site } size={ 34 } /> : null }
				<a className="page__title"
					href={ canEdit ? helpers.editLinkForPage( page, site ) : page.URL }
					title={ canEdit ?
						this.translate( 'Edit %(title)s', { textOnly: true, args: { title: page.title } } ) :
						this.translate( 'View %(title)s', { textOnly: true, args: { title: page.title } } ) }
					onClick={ this.analyticsEvents.pageTitle }
					>
					{ depthIndicator }
					{ this.props.isFrontPage ? <Gridicon icon="house" size={ 18 } /> : null }
					{ title }
				</a>
				{ this.props.isPostsPage ? <div className="page__posts-page">{ this.translate( 'Your latest posts' ) }</div> : null }
				{ this.props.multisite ? <span className="page__site-url">{ this.getSiteDomain() }</span> : null }
				{ ellipsisGridicon }
				{ popoverMenu }
				<ReactCSSTransitionGroup
					transitionName="updated-trans"
					transitionEnterTimeout={ 300 }
					transitionLeaveTimeout={ 300 }>
					{ this.buildUpdateTemplate() }
				</ReactCSSTransitionGroup>
			</CompactCard>

		);
	},

	updateStatusPublish: function() {
		this.setState( { showPageActions: false } );
		this.updatePostStatus( 'publish' );
		recordEvent( 'Clicked Publish Page' );
	},

	updateStatusTrash: function() {
		this.setState( { showPageActions: false } );
		this.updatePostStatus( 'trash' );
		recordEvent( 'Clicked Move to Trash' );
	},

	updateStatusRestore: function() {
		this.setState( { showPageActions: false } );
		this.updatePostStatus( 'restore' );
		recordEvent( 'Clicked Restore' );
	},

	updateStatusDelete: function() {
		this.setState( { showPageActions: false } );
		this.updatePostStatus( 'delete' );
		recordEvent( 'Clicked Delete Page' );
	},

	copyPage: function() {
		recordEvent( 'Clicked Copy Page' );
	},
} );

export default connect(
	( state, props ) => {
		return {
			selectedSiteId: getSelectedSiteId( state ),
			hasStaticFrontPage: hasStaticFrontPage( state, props.page.site_ID ),
			isFrontPage: isFrontPage( state, props.page.site_ID, props.page.ID ),
			isPostsPage: isPostsPage( state, props.page.site_ID, props.page.ID ),
			isPreviewable: false !== isSitePreviewable( state, props.site.ID ),
			previewURL: getPreviewURL( props.page ),
		};
	},
	( dispatch ) => bindActionCreators( {
		setFrontPage,
		setPreviewUrl,
		setLayoutFocus
	}, dispatch )
)( Page );
