/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	url = require( 'url' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	utils = require( 'lib/posts/utils' ),
	Gridicon = require( 'components/gridicon'),
	recordEvent = require( 'lib/analytics' ).ga.recordEvent;

module.exports = React.createClass( {
	displayName: 'PostControls',

	mixins: [ PureRenderMixin ],

	propTypes: {
		post: React.PropTypes.object.isRequired,
		editURL: React.PropTypes.string.isRequired,
		onShowMore: React.PropTypes.func.isRequired,
		onHideMore: React.PropTypes.func.isRequired,
		onPublish: React.PropTypes.func,
		onTrash: React.PropTypes.func,
		onDelete: React.PropTypes.func,
		onRestore: React.PropTypes.func,
	},

	view: function() {
		recordEvent( 'Posts', 'Clicked View Post' );
	},

	preview: function() {
		recordEvent( 'Posts', 'Clicked Preview Post' );
	},

	edit: function() {
		recordEvent( 'Posts', 'Clicked Edit Post' );
	},

	viewStats: function() {
		recordEvent( 'Posts', 'Clicked View Post Stats' );
	},

	buildControls: function( controlsArray ) {
		var postId = this.props.post.ID,
			controls;

		controls = controlsArray.map( function( item, i ) {
			var itemKey = 'controls-' + postId + '-' + i;

			return (
				<li key={ itemKey }>
					<a href={ item.href } className={ item.className } onClick={ item.onClick } target={ item.target ? item.target : null }>
						<Gridicon icon={ item.icon } size={ 18 } />
						<span>{ item.text }</span>
					</a>
				</li>
			);
		}, this );

		return controls;
	},

	render: function() {
		var post = this.props.post,
			availableControls = [],
			extraControls = [],
			parsed, previewURL, statsURL, postControlsClass, mainControls, moreControls, i, moreControlsSpliceIndex;

		// NOTE: Currently Jetpack site posts are not returning `post.capabilities`
		// and those posts will not have access to post management type controls

		// --- Main Controls (not behind ... more link) ---
		if ( utils.userCan( 'edit_post', post ) ) {
			availableControls.push( {
				text: this.translate( 'Edit' ),
				className: 'post-controls__edit',
				href: this.props.editURL,
				target: null,
				onClick: this.edit,
				icon: 'pencil'
			} );
		}

		if ( post.status === 'publish' ) {
			availableControls.push( {
				text: this.translate( 'View' ),
				className: 'post-controls__view',
				href: post.URL,
				target: '_blank',
				onClick: this.view,
				icon: 'external'
			} );

			if ( config.isEnabled( 'manage/stats' ) ) {
				statsURL = '/stats/post/' + post.ID + '/' + this.props.site.slug;
			} else {
				statsURL = '//wordpress.com/my-stats/?view=post&post=' + post.ID + '&blog=' + post.site_ID;
			}
			availableControls.push( {
				text: this.translate( 'Stats' ),
				className: 'post-controls__stats',
				href: statsURL,
				onClick: this.viewStats,
				icon: 'stats-alt'
			} );
		} else {
			if ( post.status !== 'trash' ) {
				parsed = url.parse( post.URL, true );
				parsed.query.preview = 'true';
				// NOTE: search needs to be cleared in order to rebuild query
				// http://nodejs.org/api/url.html#url_url_format_urlobj
				parsed.search = '';
				previewURL = url.format( parsed );

				availableControls.push( {
					text: this.translate( 'Preview' ),
					className: 'post-controls__view',
					href: previewURL,
					target: '_blank',
					onClick: this.preview,
					icon: 'external'
				} );

				if ( utils.userCan( 'publish_post', post ) ) {
					availableControls.push( {
						text: this.translate( 'Publish' ),
						className: 'post-controls__publish',
						onClick: this.props.onPublish,
						icon: 'reader'
					} );
				}

			} else {

				if ( utils.userCan( 'delete_post', post ) ) {
					availableControls.push( {
						text: this.translate( 'Restore' ),
						className: 'post-controls__restore',
						onClick: this.props.onRestore,
						icon: 'undo'
					} );
				}

			}
		}

		if ( utils.userCan( 'delete_post', post ) ) {
			if ( post.status === 'trash') {
				availableControls.push( {
					text: this.translate( 'Delete Permanently' ),
					className: 'post-controls__trash is-scary',
					onClick: this.props.onDelete,
					icon: 'trash'
				} );
			} else {
				availableControls.push( {
					text: this.translate( 'Trash' ),
					className: 'post-controls__trash',
					onClick: this.props.onTrash,
					icon: 'trash'
				} );
			}
		}

		// --- Extra Controls (behind ... more link) ---
		if ( ( availableControls.length > 2 && ! this.props.fullWidth ) || ( availableControls.length > 4 && this.props.fullWidth ) ) {
			moreControlsSpliceIndex = ( ! this.props.fullWidth ) ? 2 : 4;

			for ( i = moreControlsSpliceIndex; i < availableControls.length; i++ ) {
				extraControls.push( availableControls[i] );
			}

			availableControls.splice( moreControlsSpliceIndex );
		}

		// --- Return Controls ---
		postControlsClass = 'post-controls';

		if ( extraControls.length ) {
			availableControls.push( {
				text: this.translate( 'More' ),
				className: 'post-controls__more',
				onClick: this.props.onShowMore,
				icon: 'ellipsis'
			} );

			extraControls.push( {
				text: this.translate( 'Back' ),
				className: 'post-controls__back',
				onClick: this.props.onHideMore,
				icon: 'chevron-left'
			} );

			mainControls = this.buildControls( availableControls );
			moreControls = this.buildControls( extraControls );
			postControlsClass += ( extraControls.length <= 2 ) ? ' post-controls--desk-nomore' : '';

			return (
				<div className={ postControlsClass }>
					<ul className="post-controls__pane post-controls__more-options">
						{ moreControls }
					</ul>
					<ul className="post-controls__pane post-controls__main-options">
						{ mainControls }
					</ul>
				</div>
			);
		} else {
			mainControls = this.buildControls( availableControls );

			return (
				<div className={ postControlsClass }>
					<ul className="post-controls__pane post-controls__main-options">
						{ mainControls }
					</ul>
				</div>
			);
		}
	},

} );
