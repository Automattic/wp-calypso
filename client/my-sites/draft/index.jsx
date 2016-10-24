/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' ),
	noop = require( 'lodash/noop' ),
	url = require( 'url' );

/**
 * Internal dependencies
 */
var CompactCard = require( 'components/card/compact' ),
	Gridicon = require( 'components/gridicon' ),
	Notice = require( 'components/notice' ),
	NoticeAction = require( 'components/notice/notice-action' ),
	SiteIcon = require( 'components/site-icon' ),
	PostRelativeTimeStatus = require( 'my-sites/post-relative-time-status' ),
	PopoverMenu = require( 'components/popover/menu' ),
	PopoverMenuItem = require( 'components/popover/menu-item' ),
	actions = require( 'lib/posts/actions' ),
	updatePostStatus = require( 'lib/mixins/update-post-status' ),
	utils = require( 'lib/posts/utils' ),
	hasTouch = require( 'lib/touch-detect' ).hasTouch;

import Gravatar from 'components/gravatar';
import photon from 'photon';

module.exports = React.createClass( {

	displayName: 'Draft',

	mixins: [ updatePostStatus ],

	propTypes: {
		showAllActions: React.PropTypes.bool,
		post: React.PropTypes.object,
		isPlaceholder: React.PropTypes.bool,
		sites: React.PropTypes.object,
		onTitleClick: React.PropTypes.func,
		postImages: React.PropTypes.object,
		selected: React.PropTypes.bool,
		showAuthor: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			showAllActions: false,
			onTitleClick: noop,
			selected: false,
			showAuthor: false
		};
	},

	getInitialState: function() {
		return {
			fullImage: false,
			showPopoverMenu: false,
			isRestoring: false,
			hasError: false
		};
	},

	toggleImageState: function() {
		this.setState( { fullImage: ! this.state.fullImage } );
	},

	trashPost: function() {
		var updateStatus;

		this.setState( {
			showPopoverMenu: false,
			isTrashing: true
		} );

		updateStatus = function( error ) {
			if ( ! this.isMounted() ) {
				return;
			}

			if ( error ) {
				return this.setState( {
					isTrashing: false,
					hasError: true
				} );
			}

			return this.setState( { isTrashing: false } );
		}.bind( this );

		if ( utils.userCan( 'delete_post', this.props.post ) ) {
			actions.trash( this.props.post, updateStatus );
		}
	},

	restorePost: function() {
		var updateStatus;

		this.setState( {
			showPopoverMenu: false,
			isRestoring: true
		} );

		updateStatus = function( error ) {
			if ( ! this.isMounted() ) {
				return;
			}

			if ( error ) {
				return this.setState( {
					isRestoring: false,
					hasError: true
				} );
			}

			return this.setState( { isRestoring: false } );
		}.bind( this );

		if ( utils.userCan( 'delete_post', this.props.post ) ) {
			actions.restore( this.props.post, updateStatus );
		}
	},

	previewPost: function() {
		window.open( utils.getPreviewURL( this.props.post ) );
	},

	publishPost: function() {
		this.setState( { showPopoverMenu: false	} );
		if ( utils.userCan( 'publish_post', this.props.post ) ) {
			this.updatePostStatus( 'publish' );
		}
	},

	togglePopoverMenu: function() {
		this.setState( {
			showPopoverMenu: ! this.state.showPopoverMenu
		} );
	},

	render: function() {
		var post = this.props.post,
			image = null,
			site, classes, imageUrl, editPostURL, title, excerpt;

		if ( this.props.isPlaceholder ) {
			return this.postPlaceholder();
		}

		site = this.props.sites.getSite( post.site_ID );

		if ( utils.userCan( 'edit_post', post ) ) {
			editPostURL = utils.getEditURL( post, site );
		}

		if ( this.props.postImages && this.props.postImages.canonical_image ) {
			image = url.parse( this.props.postImages.canonical_image.uri, true );
			imageUrl = '//' + image.hostname + image.pathname + '?w=680px';
		}

		if ( post && post.canonical_image ) {
			image = url.parse( post.canonical_image.uri, true );

			if ( image.hostname.indexOf( 'files.wordpress.com' ) > 0 ) {
				imageUrl = '//' + image.hostname + image.pathname + '?w=680px';
			} else {
				imageUrl = photon( post.canonical_image.uri, { width: 680 } );
			}
		}

		classes = [
			'draft',
			{
				'has-all-actions': this.props.showAllActions,
				'has-image': !! image,
				'is-image-expanded': this.state.fullImage,
				'is-trashed': this.props.post.status === 'trash' || this.state.isTrashing,
				'is-placeholder': this.props.isPlaceholder,
				'is-restoring': this.state.isRestoring,
				'is-touch': hasTouch(),
				'is-selected': this.props.selected
			}
		];

		title = post.title || <span className="draft__untitled">{ this.translate( 'Untitled' ) }</span>;
		excerpt = post.excerpt ? <span className="draft__excerpt"><Gridicon icon="aside" size={ 18 } />{ post.excerpt }</span> : title;

		// Render each Post
		return (
			<CompactCard className={ classnames.apply( null, classes ) } key={ 'draft-' + post.ID }>
				{ this.showStatusChange() }
				<h3 className="draft__title">
					{ post.status === 'pending' &&
						<span className="draft__pending-label">{ this.translate( 'Pending' ) }</span> }
					{ this.props.showAuthor && <Gravatar user={ post.author } size={ 22 } /> }
					<a href={ editPostURL } onClick={ this.props.onTitleClick }>
						{ post.format === 'aside' ? excerpt : title }
					</a>
				</h3>
				{ this.props.sites.selected ? this.draftActions() : <SiteIcon site={ site } size={ 32 } /> }
				{ image ? this.renderImage( imageUrl ) : null }
				{ this.props.post.status === 'trash' ? this.restoreButton() : null }
			</CompactCard>
		);
	},

	renderImage: function( image ) {
		var style;

		if ( ! this.state.fullImage ) {
			style = { backgroundImage: 'url(' + image + ')' };
		}

		return (
			<div className="draft__featured-image" style={ style } onClick={ this.toggleImageState } >
				{ this.state.fullImage ?
					<img className="draft__image" src={ image } />
				: null }
			</div>
		);
	},

	restoreButton: function() {
		if ( this.state.isRestoring ) {
			return null;
		}

		return (
			<button className="draft__restore" onClick={ this.restorePost }>
				<Gridicon icon="undo" size={ 18 } />
				{ this.translate( 'Restore' ) }
			</button>
		);
	},

	showStatusChange: function() {
		if ( this.props.post.status === 'publish' ) {
			return (
					<Notice isCompact = { true }
						status="is-success"
						text={ 'Post successfully published.' }
						button={ 'View' }
						showDismiss={ false }>
						<NoticeAction href={ this.props.post.URL }>
							{ 'View' }
						</NoticeAction>
					</Notice>
					);
		} else if ( this.state.hasError ) {
			return <Notice isCompact = { true }
						status="is-error"
						text={ 'There was a problem.' }
						showDismiss={ false } />;
		}
	},

	postPlaceholder: function() {
		return (
			<CompactCard className="draft is-placeholder">
				<h3 className="draft__title" />
				<div className="draft__actions">
					<p className="post-relative-time-status">
						<span className="time"><span className="noticon noticon-time" /><span className="time-text" /></span>
					</p>
				</div>
			</CompactCard>
		);
	},

	renderTrashAction: function() {
		if ( ! utils.userCan( 'delete_post', this.props.post ) ) {
			return null;
		}

		if ( this.props.post.status === 'trash' || this.state.isRestoring ) {
			return null;
		}

		return (
			<div className="draft__actions">
				<Gridicon icon="trash" onClick={ this.trashPost } size={ 18 } />
			</div>
		);
	},

	renderAllActions: function() {
		return (
			<div className="draft__all-actions">
				<PostRelativeTimeStatus post={ this.props.post } includeEditLink={ true } />
				<span className="draft__actions-toggle noticon noticon-ellipsis" onClick={ this.togglePopoverMenu } ref="popoverMenuButton" />
				<PopoverMenu
					isVisible={ this.state.showPopoverMenu }
					onClose={ this.togglePopoverMenu }
					position={ 'bottom left' }
					context={ this.refs && this.refs.popoverMenuButton }
				>
					<PopoverMenuItem onClick={ this.previewPost }>{ this.translate( 'Preview' ) }</PopoverMenuItem>
					<PopoverMenuItem onClick={ this.publishPost }>{ this.translate( 'Publish' ) }</PopoverMenuItem>
					<PopoverMenuItem className="draft__trash-item" onClick={ this.trashPost }>
						{ this.translate( 'Send to Trash' ) }
					</PopoverMenuItem>
				</PopoverMenu>
			</div>
		);
	},

	draftActions: function() {
		return this.props.showAllActions ? this.renderAllActions() : this.renderTrashAction();
	}
} );
