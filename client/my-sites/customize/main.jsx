/**
 * External dependencies
 */
var React = require( 'react' ),
	url = require( 'url' ),
	Qs = require( 'qs' ),
	cloneDeep = require( 'lodash/cloneDeep' ),
	connect = require( 'react-redux' ).connect,
	debug = require( 'debug' )( 'calypso:my-sites:customize' );
import { get, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
var notices = require( 'notices' ),
	page = require( 'page' ),
	CustomizerLoadingPanel = require( 'my-sites/customize/loading-panel' ),
	EmptyContent = require( 'components/empty-content' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	Actions = require( 'my-sites/customize/actions' ),
	themeActivated = require( 'state/themes/actions' ).themeActivated;
import { getCustomizerFocus } from './panels';
import { getMenusUrl } from 'state/selectors';
import { getSelectedSite } from 'state/ui/selectors';

var loadingTimer;

var Customize = React.createClass( {
	displayName: 'Customize',

	propTypes: {
		domain: React.PropTypes.string.isRequired,
		site: React.PropTypes.object.isRequired,
		pathname: React.PropTypes.string.isRequired,
		prevPath: React.PropTypes.string,
		query: React.PropTypes.object,
		themeActivated: React.PropTypes.func.isRequired,
		panel: React.PropTypes.string,
	},

	getDefaultProps: function() {
		return {
			domain: '',
			prevPath: null
		};
	},

	getInitialState: function() {
		return {
			iframeLoaded: false,
			errorFromIframe: false,
			timeoutError: false
		};
	},

	componentWillMount: function() {
		this.redirectIfNeeded( this.props.pathname );
		this.listenToCustomizer();
		this.waitForLoading();
		window.scrollTo( 0, 0 );
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'message', this.onMessage, false );
		this.cancelWaitingTimer();
	},

	componentWillReceiveProps: function( nextProps ) {
		this.redirectIfNeeded( nextProps.pathname );
	},

	redirectIfNeeded: function( pathname ) {
		const { menusUrl } = this.props;
		if ( startsWith( pathname, '/customize/menus' ) && pathname !== menusUrl ) {
			page( menusUrl );
		}
	},

	canUserCustomizeDomain: function() {
		const { site } = this.props;
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
		const { site } = this.props;
		if ( ! site ) {
			return false;
		}
		let domain = '//' + site.domain;
		if ( site.options && site.options.unmapped_url ) {
			domain = site.options.unmapped_url;
		}

		// Customizer
		if ( site.options && site.options.admin_url ) {
			return site.options.admin_url + 'customize.php?' + this.buildCustomizerQuery();
		}
		return domain + '/wp-admin/customize.php?' + this.buildCustomizerQuery();
	},

	buildCustomizerQuery: function() {
		const { protocol, host } = window.location;
		const query = cloneDeep( this.props.query );
		const { panel, site } = this.props;

		query.return = protocol + '//' + host + this.getPreviousPath();
		query.calypso = true;
		query.calypsoOrigin = protocol + '//' + host;
		if ( site.options && site.options.frame_nonce ) {
			query[ 'frame-nonce' ] = site.options.frame_nonce;
		}

		const focus = getCustomizerFocus( panel );
		if ( focus ) {
			Object.assign( query, focus );
		}

		if ( panel === 'amp' ) {
			query.customize_amp = 1;
		}

		return Qs.stringify( query );
	},

	listenToCustomizer: function() {
		window.removeEventListener( 'message', this.onMessage, false );
		window.addEventListener( 'message', this.onMessage, false );
	},

	onMessage: function( event ) {
		const { site } = this.props;
		if ( ! site || ! site.options ) {
			debug( 'ignoring message received from iframe because the site data cannot be found' );
			return;
		}

		const parsedOrigin = url.parse( event.origin, true );
		const parsedSite = url.parse( site.options.unmapped_url );

		if ( parsedOrigin.hostname !== this.props.domain && parsedOrigin.hostname !== parsedSite.hostname ) {
			debug( 'ignoring message received from iframe with incorrect origin', event.origin );
			return;
		}
		// Ensure we have a string that's JSON.parse-able
		if ( typeof event.data !== 'string' || event.data[ 0 ] !== '{' ) {
			debug( 'ignoring message received from iframe with bad data', event.data );
			return;
		}
		const message = JSON.parse( event.data );
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
					Actions.activated( message.theme.stylesheet, site, this.props.themeActivated );
					break;
				case 'purchased':
					const themeSlug = message.theme.stylesheet.split( '/' )[ 1 ];
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
		var iframeUrl;

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

		if ( ! this.props.site ) {
			return (
				<div className="main main-column customize is-iframe" role="main">
					<CustomizerLoadingPanel />
				</div>
			);
		}

		if ( ! this.canUserCustomizeDomain() ) {
			this.cancelWaitingTimer();
			return this.renderErrorPage( {
				title: this.translate( 'Sorry, you do not have enough permissions to customize this site' )
			} );
		}

		iframeUrl = this.getUrl();

		if ( iframeUrl ) {
			debug( 'loading iframe URL', iframeUrl );
			const iframeClassName = this.state.iframeLoaded ? 'is-iframe-loaded' : '';
			// The loading message here displays while the iframe is loading. When the
			// loading completes, the customizer will send a postMessage back to this
			// component. If the loading takes longer than 25 seconds (see
			// waitForLoading above) then an error will be shown.
			return (
				<div className="main main-column customize is-iframe" role="main">
					<CustomizerLoadingPanel isLoaded={ this.state.iframeLoaded } />
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

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		return {
			site,
			menusUrl: getMenusUrl( state, get( site, 'ID' ) )
		};
	},
	{ themeActivated }
)( Customize );
