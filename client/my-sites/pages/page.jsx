/**
 * External dependencies
 */
var React = require( 'react' ),
	ReactCSSTransitionGroup = require( 'react-addons-css-transition-group' ),
	i18n = require( 'i18n-calypso' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var updatePostStatus = require( 'lib/mixins/update-post-status' ),
	CompactCard = require( 'components/card/compact' ),
	Gridicon = require( 'components/gridicon' ),
	PopoverMenu = require( 'components/popover/menu' ),
	PopoverMenuItem = require( 'components/popover/menu-item' ),
	SiteIcon = require( 'components/site-icon' ),
	helpers = require( './helpers' ),
	analytics = require( 'lib/analytics' ),
	utils = require( 'lib/posts/utils' ),
	classNames = require( 'classnames' );

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
		'trash': i18n.translate( 'Trashed' ),
		'auto-draft': i18n.translate( 'Draft' ),
		'inherit': i18n.translate( 'Inherited' )
	};

	return humanReadableStatus [ status ] || status;
}

module.exports = React.createClass( {

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

	viewPage: function() {
		window.open( this.props.page.URL );
	},

	getViewItem: function() {
		if ( this.props.page.status === 'trash' ) {
			return null;
		}

		if ( this.props.page.status !== 'publish' ) {
			return (
				<PopoverMenuItem onClick={ this.viewPage }>
					<Gridicon icon="external" size={ 18 } />
					{ this.translate( 'Preview' ) }
				</PopoverMenuItem>
			);
		}

		return (
			<PopoverMenuItem onClick={ this.viewPage }>
				<Gridicon icon="external" size={ 18 } />
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
		if ( ! helpers.isFrontPage( this.props.page, this.props.site ) ) {
			return null;
		}

		return ( <div className="page__popover-more-info">{
			this.translate( 'Currently set as {{link}}Front Page{{/link}}', {
				components: {
					link: <a target="_blank" href={ this.props.site.options.admin_url + 'options-reading.php' } />
				}
			} )
		}</div> );
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
				<hr className="popover__hr" />
				{ status }
				{ childPageInfo }
				{ frontPageInfo }
			</div>
		);
	},

	render: function() {
		var page = this.props.page,
			published = this.moment( page.modified ).fromNow(),
			title = page.title || this.translate( '(no title)' ),
			site = this.props.site || {},
			isFrontPage = helpers.isFrontPage( page, site ),
			canEdit = utils.userCan( 'edit_post', this.props.page ),
			depthIndicator;

		// Replace published date with `Draft` if the page is a draft
		if ( page.status === 'draft' ) {
			published = ( <span>{ published } <em>{ this.translate( 'Draft', { context: 'page status' } ) }</em></span> );
		}

		if ( page.parent ) {
			depthIndicator = '— ';
		}

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
					{ isFrontPage ? <Gridicon icon="house" size={ 18 } /> : null }
					{ title }
				</a>
				{ this.props.multisite ? <span className="page__site-url">{ this.getSiteDomain() }</span> : null }
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
					{ this.getViewItem() }
					{ this.getPublishItem() }
					{ this.getEditItem() }
					{ this.getRestoreItem() }
					{ this.getSendToTrashItem() }
					{ this.popoverMoreInfo() }
				</PopoverMenu>
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
	}
} );
