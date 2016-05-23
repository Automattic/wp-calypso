/**
 * External dependencies
 */
var React = require( 'react' ),
	get = require( 'lodash/get' ),
	includes = require( 'lodash/includes' ),
	map = require( 'lodash/map' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var PublicizeMessage = require( './publicize-message' ),
	PublicizeServices = require( './publicize-services' ),
	paths = require( 'lib/paths' ),
	PostMetadata = require( 'lib/post-metadata' ),
	PopupMonitor = require( 'lib/popup-monitor' ),
	Button = require( 'components/button' ),
	siteUtils = require( 'lib/site/utils' ),
	Gridicon = require( 'components/gridicon' ),
	stats = require( 'lib/posts/stats' );

module.exports = React.createClass( {
	displayName: 'EditorSharingPublicizeOptions',
	connectionPopupMonitor: false,
	jetpackModulePopupMonitor: false,

	propTypes: {
		site: React.PropTypes.object,
		post: React.PropTypes.object,
		connections: React.PropTypes.array,
		fetchConnections: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			fetchConnections: () => {}
		};
	},

	hasConnections: function() {
		return this.props.connections && this.props.connections.length;
	},

	componentWillUnmount() {
		if ( this.connectionPopupMonitor ) {
			this.connectionPopupMonitor.off( 'close', this.onNewConnectionPopupClosed );
		}

		if ( this.jetpackModulePopupMonitor ) {
			this.jetpackModulePopupMonitor.off( 'close', this.onModuleConnectionPopupClosed );
		}
	},

	newConnectionPopup: function() {
		let href;

		if ( ! this.props.site ) {
			return;
		}

		href = paths.publicizeConnections( this.props.site );

		if ( ! this.connectionPopupMonitor ) {
			this.connectionPopupMonitor = new PopupMonitor();
		}

		this.connectionPopupMonitor.open( href );
		this.connectionPopupMonitor.once( 'close', this.onNewConnectionPopupClosed );
	},

	onNewConnectionPopupClosed() {
		this.props.fetchConnections( this.props.site.ID );
	},

	newConnection: function() {
		this.newConnectionPopup();
		stats.recordStat( 'sharing_create_service' );
		stats.recordEvent( 'Opened Create New Sharing Service Dialog' );
	},

	jetpackModulePopup: function() {
		let href;

		if ( ! this.props.site || ! this.props.site.jetpack ) {
			return;
		}

		href = paths.jetpackModules( this.props.site, 'publicize' );

		if ( ! this.jetpackModulePopupMonitor ) {
			this.jetpackModulePopupMonitor = new PopupMonitor();
		}

		this.jetpackModulePopupMonitor.open( href );
		this.jetpackModulePopupMonitor.once( 'close', this.onModuleConnectionPopupClosed );
	},

	onModuleConnectionPopupClosed: function() {
		if ( ! this.props.site || ! this.props.site.jetpack ) {
			return;
		}

		// Refresh the list of connections so that the user is given the latest
		// possible state.  Also prevents a possible infinite loading state due
		// to connections previously returning a 400 error
		this.props.site.once( 'change', () => {
			if ( this.props.site.isModuleActive( 'publicize' ) ) {
				this.props.fetchConnections( this.props.site.ID );
			}
		} );
	},

	renderServices: function() {
		if ( ! this.props.site || ! this.hasConnections() ) {
			return;
		}

		return (
			<PublicizeServices
				post={ this.props.post }
				siteId={ this.props.site.ID }
				connections={ this.props.connections }
				newConnectionPopup={ this.newConnectionPopup } />
		);
	},

	renderMessage: function() {
		var preview = get( this.props.post, 'title' ),
			skipped = this.hasConnections() ? PostMetadata.publicizeSkipped( this.props.post ) : [],
			targeted = this.hasConnections() ? this.props.connections.filter( function( connection ) {
				return skipped && -1 === skipped.indexOf( connection.keyring_connection_ID );
			} ) : [],
			requireCount = includes( map( targeted, 'service' ), 'twitter' ),
			acceptableLength = ( requireCount ) ? 140 - 23 - 23 : null;

		if ( ! this.hasConnections() ) {
			return;
		}

		return (
			<PublicizeMessage
				message={ PostMetadata.publicizeMessage( this.props.post ) }
				preview={ preview }
				requireCount={ requireCount }
				acceptableLength={ acceptableLength } />
		);
	},

	renderAddNewButton: function() {
		// contributors cannot create publicize connections
		if ( ! siteUtils.userCan( 'publish_posts', this.props.site ) ) {
			return;
		}

		return (
			<Button borderless compact onClick={ this.newConnection }>
				<Gridicon icon="add" /> { this.translate( 'Connect new service' ) }
				<span className="editor-sharing__external-link-indicator">
					<Gridicon icon="external" size={ 18 } />
				</span>
			</Button>
		);
	},

	renderInfoNotice: function() {
		// don't show the message if the are no connections
		// and the user is not allowed to add any
		if ( ! this.hasConnections() && ! siteUtils.userCan( 'publish_posts', this.props.site ) ) {
			return;
		}

		return (
			<p className="editor-drawer__description">
				{ this.translate( 'Connect and select social media services to automatically share this post.' ) }
			</p>
		);
	},

	render: function() {
		if ( this.props.site && this.props.site.options.publicize_permanently_disabled ) {
			return (
				<div className="editor-sharing__publicize-disabled">
					<p><span>{ this.translate( 'Publicize is disabled on this site.' ) }</span></p>
				</div>
			);
		}

		if ( this.props.site && this.props.site.jetpack && ! this.props.site.isModuleActive( 'publicize' ) ) {
			return (
				<div className="editor-sharing__publicize-disabled">
					<p><span>{ this.translate( 'Enable the Publicize module to automatically share new posts to social networks.' ) }</span></p>
					<button
							className="editor-sharing__jetpack-modules-button button is-secondary"
							onClick={ this.jetpackModulePopup } >
						{ this.translate( 'View Module Settings' ) }
					</button>
				</div>
			);
		}

		const classes = classNames( 'editor-sharing__publicize-options', {
			'has-connections': this.hasConnections(),
			'has-add-option': siteUtils.userCan( 'publish_posts', this.props.site )
		} );

		return (
			<div className={ classes }>
				{ this.renderInfoNotice() }
				{ this.renderServices() }
				{ this.renderAddNewButton() }
				{ this.renderMessage() }
			</div>
		);
	}
} );
