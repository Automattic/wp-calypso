/**
 * External dependencies
 */
var React = require( 'react' ),
	url = require( 'url' ),
	Qs = require( 'qs' ),
	cloneDeep = require( 'lodash/lang/cloneDeep' ),
	debug = require( 'debug' )( 'calypso:my-sites:customize' );

/**
 * Internal dependencies
 */
var notices = require( 'notices' ),
	page = require( 'page' ),
	config = require( 'config' ),
	CustomizerLoadingPanel = require( 'my-sites/customize/loading-panel' ),
	EmptyContent = require( 'components/empty-content' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	museCustomizations = require( 'lib/customize/muse' ),
	Actions = require( 'my-sites/customize/actions' );

var mobileWidth = 400,
	loadingTimer;

module.exports = React.createClass( {
	displayName: 'Customize',

	propTypes: {
		domain: React.PropTypes.string.isRequired,
		sites: React.PropTypes.object.isRequired,
		prevPath: React.PropTypes.string,
		dispatchRedux: React.PropTypes.func.isRequired
	},

	getDefaultProps: function() {
		return {
			domain: '',
			prevPath: null
		};
	},

	getInitialState: function() {
		return {
			museCustomizations: null,
			isWaitingForSiteData: true,
			isWaitingForMuseData: true,
			iframeLoaded: false,
			errorFromIframe: false,
			timeoutError: false
		};
	},

	componentWillMount: function() {
		this.props.sites.on( 'change', this.sitesDidUpdate );
		this.listenToCustomizer();
		this.waitForLoading();
		this.sitesDidUpdate();
		window.scrollTo( 0, 0 );
		museCustomizations.on( 'change', this.gotMuseCustomizations );
		Actions.fetchMuseCustomizations( this.props.domain );
	},

	componentWillUnmount: function() {
		this.props.sites.off( 'change', this.sitesDidUpdate );
		museCustomizations.on( 'change', this.gotMuseCustomizations );
		window.removeEventListener( 'message', this.onMessage, false );
		this.cancelWaitingTimer();
	},

	gotMuseCustomizations: function() {
		const { customizations } = museCustomizations.get();
		debug( 'got muse customizations', customizations );
		this.setState( { isWaitingForMuseData: false, museCustomizations: customizations } );
	},

	sitesDidUpdate: function() {
		if ( this.props.sites.fetched === true ) {
			this.props.sites.off( 'change', this.sitesDidUpdate );
			this.setState( { isWaitingForSiteData: false } );
		}
	},

	getSite: function() {
		return this.props.sites.getSite( this.props.domain );
	},

	shouldLoadMuse: function() {
		var site;

		if ( ! config.isEnabled( 'muse' ) ) {
			return false;
		}

		if ( this.props.query.nomuse ) {
			return false;
		}

		if ( this.state.isWaitingForSiteData || this.state.isWaitingForMuseData ) {
			return false;
		}

		site = this.getSite();
		if ( site.jetpack ) {
			return false;
		}

		if ( window.innerWidth > mobileWidth ) {
			return false;
		}

		if ( ! this.state.museCustomizations || this.state.museCustomizations.length === 0 ) {
			return false;
		}

		return true;
	},

	canUserCustomizeDomain: function() {
		var site = this.getSite();
		if ( ! site ) {
			debug( 'domain is not in the user\'s site list', this.props.domain );
			return false;
		}
		if ( site.capabilities && site.capabilities.edit_theme_options ) {
			return true;
		}
		debug( 'user cannot customize domain', this.props.domain );
		return false;
	},

	getPreviousPath: function() {
		var path = this.props.prevPath;
		if ( ! path || /^\/customize\/?/.test( path ) ) {
			path = '/stats';
			if ( this.props.domain ) {
				path += '/' + this.props.domain;
			}
		}
		return path;
	},

	goBack: function() {
		var path = this.getPreviousPath();

		Actions.close( path );

		debug( 'returning to previous page', path );
		page.back( path );
	},

	waitForLoading: function() {
		debug( 'waiting for iframe to load' );
		this.cancelWaitingTimer();
		loadingTimer = setTimeout( this.cancelCustomizer, 25000 );
	},

	cancelWaitingTimer: function() {
		if ( loadingTimer ) {
			clearTimeout( loadingTimer );
		}
	},

	cancelCustomizer: function() {
		if ( this.state.iframeLoaded ) {
			return;
		}
		debug( 'iframe loading timed out' );
		this.setState( { timeoutError: true } );
	},

	getUrl: function() {
		var site = this.getSite();
		if ( ! site ) {
			return false;
		}
		let domain = '//' + site.domain;
		if ( site.options && site.options.unmapped_url ) {
			domain = site.options.unmapped_url;
		}

		// Muse
		if ( this.shouldLoadMuse() ) {
			let returnUrl = encodeURIComponent( window.location.protocol + '//' + window.location.host + this.getPreviousPath() );
			return domain + '?customize=true&return=' + returnUrl;
		}

		// Customizer
		if ( site.options && site.options.admin_url ) {
			return site.options.admin_url + 'customize.php?' + this.buildCustomizerQuery();
		}
		return domain + '/wp-admin/customize.php?' + this.buildCustomizerQuery();
	},

	buildCustomizerQuery: function() {
		var protocol = window.location.protocol,
			host = window.location.host,
			query = cloneDeep( this.props.query );

		query.return = protocol + '//' + host + this.getPreviousPath();
		query.calypso = true;
		query.calypsoOrigin = protocol + '//' + host;

		return Qs.stringify( query );
	},

	listenToCustomizer: function() {
		window.removeEventListener( 'message', this.onMessage, false );
		window.addEventListener( 'message', this.onMessage, false );
	},

	onMessage: function( event ) {
		var message, themeSlug, parsedOrigin, parsedSite,
			site = this.getSite();
		if ( ! site || ! site.options ) {
			debug( 'ignoring message received from iframe because the site data cannot be found' );
			return;
		}

		parsedOrigin = url.parse( event.origin, true );
		parsedSite = url.parse( site.options.unmapped_url );

		if ( parsedOrigin.hostname !== this.props.domain && parsedOrigin.hostname !== parsedSite.hostname ) {
			debug( 'ignoring message received from iframe with incorrect origin', event.origin );
			return;
		}
		// Ensure we have a string that's JSON.parse-able
		if ( typeof event.data !== 'string' || event.data[0] !== '{' ) {
			debug( 'ignoring message received from iframe with bad data', event.data );
			return;
		}
		message = JSON.parse( event.data );
		if ( message.calypso && message.command ) {
			switch ( message.command ) {
				case 'back':
					debug( 'iframe says it is done', message );
					if ( message.error ) {
						this.setState( { errorFromIframe: message.error } );
						return;
					}
					if ( message.warning ) {
						notices.warning( message.warning, { displayOnNextPage: true } );
					}
					if ( message.info ) {
						notices.info( message.info, { displayOnNextPage: true } );
					}
					if ( message.success ) {
						notices.success( message.success, { displayOnNextPage: true } );
					}
					this.goBack();
					break;
				case 'loading':
					debug( 'iframe says it is starting loading customizer' );
					this.cancelWaitingTimer();
					break;
				case 'loaded':
					debug( 'iframe says it is finished loading customizer' );
					this.cancelWaitingTimer();
					this.setState( { iframeLoaded: true } );
					break;
				case 'activated':
					themeSlug = message.theme.stylesheet.split( '/' )[1];
					Actions.activated( themeSlug, site, this.props.dispatchRedux );
					break;
				case 'purchased':
					themeSlug = message.theme.stylesheet.split( '/' )[1];
					Actions.purchase( themeSlug, site );
					break;
			}
		}
	},

	renderErrorPage: function( error ) {
		return (
			<div className="main main-column customize" role="main">
				<SidebarNavigation />
				<EmptyContent
					title={ error.title }
					line={ error.line }
					action={ error.action }
					actionURL={ error.actionURL }
					actionCallback={ error.actionCallback }
				/>
			</div>
		);
	},

	render: function() {
		var iframeUrl, showingMuse;

		if ( this.state.timeoutError ) {
			this.cancelWaitingTimer();
			return this.renderErrorPage( {
				title: this.translate( 'Sorry, the customizing tools did not load correctly' ),
				action: this.translate( 'Try again' ),
				actionCallback: function() {
					window.location.reload();
				}
			} );
		}

		if ( this.state.errorFromIframe ) {
			this.cancelWaitingTimer();
			return this.renderErrorPage( {
				title: this.state.errorFromIframe
			} );
		}

		if ( this.props.sites.fetched !== true ) {
			return (
				<div className="main main-column customize is-iframe" role="main">
					<CustomizerLoadingPanel isMuse={ this.shouldLoadMuse() }/>
				</div>
			);
		}

		if ( ! this.canUserCustomizeDomain() ) {
			this.cancelWaitingTimer();
			return this.renderErrorPage( {
				title: this.translate( 'Sorry, you do not have enough permissions to customize this site' )
			} );
		}

		if ( window.innerWidth <= mobileWidth && ! config.isEnabled( 'muse' ) ) {
			this.cancelWaitingTimer();
			return this.renderErrorPage( {
				title: this.translate( 'Sorry, our customization tools are not ready for use on small screens yet' ),
				line: this.translate( 'Please use a tablet or desktop browser to customize your site' )
			} );
		}

		iframeUrl = this.getUrl();
		showingMuse = this.shouldLoadMuse();

		debug( 'we will load', ( showingMuse ? 'muse' : 'wp-admin customizer' ) );

		if ( showingMuse ) {
			// Redirect to Muse on the frontend
			window.location = iframeUrl;
			return (
				<div className="main main-column customize is-iframe" role="main">
					<CustomizerLoadingPanel isMuse={ showingMuse }/>
				</div>
			);
		}

		if ( iframeUrl ) {
			debug( 'loading iframe URL', iframeUrl );
			let iframeClassName = this.state.iframeLoaded ? 'is-iframe-loaded' : '';
			// The loading message here displays while the iframe is loading. When the
			// loading completes, the customizer will send a postMessage back to this
			// component. If the loading takes longer than 25 seconds (see
			// waitForLoading above) then an error will be shown.
			return (
				<div className="main main-column customize is-iframe" role="main">
					<CustomizerLoadingPanel isLoaded={ this.state.iframeLoaded } isMuse={ showingMuse } />
					<iframe className={ iframeClassName } src={ iframeUrl } />
				</div>
			);
		}

		// This should never be shown, because getUrl will always return a value if
		// canUserCustomizeDomain returns true. But just in case...
		this.cancelWaitingTimer();
		return this.renderErrorPage( {
			title: this.translate( 'Sorry, the customizing tools did not load correctly' ),
			action: this.translate( 'Try again' ),
			actionCallback: function() {
				window.location.reload();
			}
		} );
	}
} );
