/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import url from 'url';
import { stringify } from 'qs';
import { cloneDeep, get, startsWith } from 'lodash';
import { connect } from 'react-redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import notices from 'notices';
import page from 'page';
import CustomizerLoadingPanel from 'my-sites/customize/loading-panel';
import EmptyContent from 'components/empty-content';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { requestSite } from 'state/sites/actions';
import { themeActivated } from 'state/themes/actions';
import { getCustomizerFocus } from './panels';
import getMenusUrl from 'state/selectors/get-menus-url';
import { getSelectedSite } from 'state/ui/selectors';
import { getCustomizerUrl, isJetpackSite } from 'state/sites/selectors';
import wpcom from 'lib/wp';
import { addItem } from 'lib/cart/actions';
import { trackClick } from 'my-sites/themes/helpers';
import { themeItem } from 'lib/cart-values/cart-items';

/**
 * Style dependencies
 */
import './style.scss';

const debug = debugFactory( 'calypso:my-sites:customize' );

// Used to allow timing-out the iframe loading process
let loadingTimer;

class Customize extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			iframeLoaded: false,
			errorFromIframe: false,
			timeoutError: false,
		};
	}

	static propTypes = {
		domain: PropTypes.string.isRequired,
		site: PropTypes.object,
		pathname: PropTypes.string.isRequired,
		prevPath: PropTypes.string,
		query: PropTypes.object,
		themeActivated: PropTypes.func.isRequired,
		panel: PropTypes.string,
		isJetpack: PropTypes.bool,
		customizerUrl: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		domain: '',
		prevPath: null,
	};

	UNSAFE_componentWillMount() {
		this.redirectIfNeeded( this.props.pathname );
		this.listenToCustomizer();
		this.waitForLoading();
	}

	componentDidMount() {
		if ( window ) {
			window.scrollTo( 0, 0 );
		}
	}

	componentWillUnmount() {
		if ( window ) {
			window.removeEventListener( 'message', this.onMessage, false );
		}
		this.cancelWaitingTimer();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		this.redirectIfNeeded( nextProps.pathname );
	}

	redirectIfNeeded = ( pathname ) => {
		const { menusUrl, isJetpack, customizerUrl } = this.props;
		if ( startsWith( pathname, '/customize/menus' ) && pathname !== menusUrl ) {
			page( menusUrl );
		}
		if ( isJetpack ) {
			page( customizerUrl );
		}
	};

	canUserCustomizeDomain = () => {
		const { site } = this.props;
		if ( ! site ) {
			debug( "domain is not in the user's site list", this.props.domain );
			return false;
		}
		if ( site.capabilities && site.capabilities.edit_theme_options ) {
			return true;
		}
		debug( 'user cannot customize domain', this.props.domain );
		return false;
	};

	getPreviousPath = () => {
		let path = this.props.prevPath;
		if ( ! path || /^\/customize\/?/.test( path ) ) {
			path = '/stats';
			if ( this.props.domain ) {
				path += '/' + this.props.domain;
			}
		}
		return path;
	};

	goBack = () => {
		const path = this.getPreviousPath();

		if ( path.includes( '/themes' ) ) {
			trackClick( 'customizer', 'close' );
		}

		debug( 'returning to previous page', path );
		page.back( path );
	};

	navigateTo = ( destination ) => {
		if ( ! startsWith( destination, '/checkout' ) ) {
			return;
		}

		debug( 'navigating to', destination );
		page( destination );
	};

	waitForLoading = () => {
		debug( 'waiting for iframe to load' );
		this.cancelWaitingTimer();
		loadingTimer = setTimeout( this.cancelCustomizer, 25000 );
	};

	cancelWaitingTimer = () => {
		if ( loadingTimer ) {
			clearTimeout( loadingTimer );
		}
	};

	cancelCustomizer = () => {
		if ( this.state.iframeLoaded ) {
			return;
		}
		debug( 'iframe loading timed out' );
		this.setState( { timeoutError: true } );
	};

	getUrl = () => {
		const { site } = this.props;
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
	};

	buildCustomizerQuery = () => {
		const { protocol, host } = window.location;
		const query = cloneDeep( this.props.query );
		const { panel, site } = this.props;

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

		//needed to load the customizer correctly when su'd
		if ( wpcom.addSupportParams ) {
			return stringify( wpcom.addSupportParams( query ) );
		}
		return stringify( query );
	};

	listenToCustomizer = () => {
		window.removeEventListener( 'message', this.onMessage, false );
		window.addEventListener( 'message', this.onMessage, false );
	};

	onMessage = ( event ) => {
		const { site } = this.props;
		if ( ! site || ! site.options ) {
			debug( 'ignoring message received from iframe because the site data cannot be found' );
			return;
		}

		const parsedOrigin = url.parse( event.origin, true );
		const parsedSite = url.parse( site.options.unmapped_url );

		if (
			parsedOrigin.hostname !== this.props.domain &&
			parsedOrigin.hostname !== parsedSite.hostname
		) {
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
				case 'saved':
					debug( 'iframe says it saved' );
					this.props.requestSite( this.props.siteId );
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
					trackClick( 'customizer', 'activate' );
					page( '/themes/' + site.slug );
					this.props.themeActivated( message.theme.stylesheet, site.ID, 'customizer' );
					break;
				case 'purchased': {
					const themeSlug = message.theme.stylesheet.split( '/' )[ 1 ];
					addItem( themeItem( themeSlug, 'customizer' ) );
					trackClick( 'customizer', 'purchase' );
					page( '/checkout/' + site.slug );
					break;
				}
				case 'navigateTo': {
					const destination = message.destination;
					if ( ! destination ) {
						debug( 'missing destination' );
						return;
					}
					this.navigateTo( destination );
					break;
				}
			}
		}
	};

	renderErrorPage = ( error ) => {
		return (
			<div className="main main-column customize customize__main-error" role="main">
				<PageViewTracker path="/customize/:site" title="Customizer" />
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
	};

	render() {
		if ( this.state.timeoutError ) {
			this.cancelWaitingTimer();
			return this.renderErrorPage( {
				title: this.props.translate( 'Sorry, the customizing tools did not load correctly' ),
				action: this.props.translate( 'Try again' ),
				actionCallback: function () {
					window.location.reload();
				},
			} );
		}

		if ( this.state.errorFromIframe ) {
			this.cancelWaitingTimer();
			return this.renderErrorPage( {
				title: this.state.errorFromIframe,
			} );
		}

		if ( ! this.props.site ) {
			return (
				<div className="main main-column customize customize__main is-iframe" role="main">
					<PageViewTracker path="/customize/:site" title="Customizer" />
					<CustomizerLoadingPanel />
				</div>
			);
		}

		if ( ! this.canUserCustomizeDomain() ) {
			this.cancelWaitingTimer();
			return this.renderErrorPage( {
				title: this.props.translate(
					'Sorry, you do not have enough permissions to customize this site'
				),
			} );
		}

		const iframeUrl = this.getUrl();

		if ( iframeUrl ) {
			debug( 'loading iframe URL', iframeUrl );
			const iframeClassName = this.state.iframeLoaded ? 'is-iframe-loaded' : '';
			// The loading message here displays while the iframe is loading. When the
			// loading completes, the customizer will send a postMessage back to this
			// component. If the loading takes longer than 25 seconds (see
			// waitForLoading above) then an error will be shown.
			return (
				<div className="main main-column customize customize__main is-iframe" role="main">
					<PageViewTracker path="/customize/:site" title="Customizer" />
					<CustomizerLoadingPanel isLoaded={ this.state.iframeLoaded } />
					<iframe className={ iframeClassName } src={ iframeUrl } title="Customizer" />
				</div>
			);
		}

		// This should never be shown, because getUrl will always return a value if
		// canUserCustomizeDomain returns true. But just in case...
		this.cancelWaitingTimer();
		return this.renderErrorPage( {
			title: this.props.translate( 'Sorry, the customizing tools did not load correctly' ),
			action: this.props.translate( 'Try again' ),
			actionCallback: function () {
				window.location.reload();
			},
		} );
	}
}

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		const siteId = get( site, 'ID' );
		return {
			site,
			siteId,
			menusUrl: getMenusUrl( state, siteId ),
			isJetpack: isJetpackSite( state, siteId ),
			// TODO: include panel from props?
			customizerUrl: getCustomizerUrl( state, siteId ),
		};
	},
	{ requestSite, themeActivated }
)( localize( Customize ) );
