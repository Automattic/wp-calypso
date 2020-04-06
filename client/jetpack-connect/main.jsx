/**
 * External dependencies
 */
import debugModule from 'debug';
import config from 'config';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { concat, flowRight, get, includes } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import HelpButton from './help-button';
import JetpackConnectNotices from './jetpack-connect-notices';
import LocaleSuggestions from 'components/locale-suggestions';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import MainHeader from './main-header';
import MainWrapper from './main-wrapper';
import page from 'page';
import SiteUrlInput from './site-url-input';
import versionCompare from 'lib/version-compare';
import { addCalypsoEnvQueryArg, cleanUrl } from './utils';
import { addQueryArgs, externalRedirect } from 'lib/route';
import { checkUrl, dismissUrl } from 'state/jetpack-connect/actions';
import { FLOW_TYPES } from 'state/jetpack-connect/constants';
import { getConnectingSite, getJetpackSiteByUrl } from 'state/jetpack-connect/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { isRequestingSites } from 'state/sites/selectors';
import { persistSession, retrieveMobileRedirect } from './persistence-utils';
import { recordTracksEvent } from 'state/analytics/actions';
import { urlToSlug } from 'lib/url';
import {
	JPC_PATH_PLANS,
	JPC_PATH_REMOTE_INSTALL,
	MINIMUM_JETPACK_VERSION,
	REMOTE_PATH_AUTH,
} from './constants';
import {
	ALREADY_CONNECTED,
	ALREADY_OWNED,
	IS_DOT_COM,
	NOT_ACTIVE_JETPACK,
	NOT_CONNECTED_JETPACK,
	NOT_EXISTS,
	NOT_JETPACK,
	NOT_WORDPRESS,
	OUTDATED_JETPACK,
	SITE_BLACKLISTED,
	WORDPRESS_DOT_COM,
} from './connection-notice-types';

const debug = debugModule( 'calypso:jetpack-connect:main' );

export class JetpackConnectMain extends Component {
	static propTypes = {
		locale: PropTypes.string,
		path: PropTypes.string,
		type: PropTypes.oneOf( concat( FLOW_TYPES, false ) ),
		url: PropTypes.string,
	};

	state = this.props.url
		? {
				currentUrl: cleanUrl( this.props.url ),
				shownUrl: this.props.url,
				waitingForSites: false,
		  }
		: {
				currentUrl: '',
				shownUrl: '',
				waitingForSites: false,
		  };

	UNSAFE_componentWillMount() {
		if ( this.props.url ) {
			this.checkUrl( cleanUrl( this.props.url ) );
		}
	}

	componentDidMount() {
		let from = 'direct';
		if ( this.props.type === 'install' ) {
			from = 'jpdotcom';
		}
		if ( this.props.type === 'pro' ) {
			from = 'ad';
		}
		if ( this.props.type === 'premium' ) {
			from = 'ad';
		}
		if ( this.props.type === 'personal' ) {
			from = 'ad';
		}

		this.props.recordTracksEvent( 'calypso_jpc_url_view', {
			jpc_from: from,
			cta_id: this.props.ctaId,
			cta_from: this.props.ctaFrom,
		} );
	}

	componentDidUpdate() {
		const { isMobileAppFlow, skipRemoteInstall, forceRemoteInstall } = this.props;

		if (
			this.getStatus() === NOT_CONNECTED_JETPACK &&
			this.isCurrentUrlFetched() &&
			! forceRemoteInstall &&
			! this.state.redirecting
		) {
			return this.goToRemoteAuth( this.props.siteHomeUrl );
		}
		if ( this.getStatus() === ALREADY_OWNED && ! this.state.redirecting ) {
			if ( isMobileAppFlow ) {
				return this.redirectToMobileApp( 'already-connected' );
			}
			return this.goToPlans( this.state.currentUrl );
		}

		if ( this.state.waitingForSites && ! this.props.isRequestingSites ) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( { waitingForSites: false } );
			this.checkUrl( this.state.currentUrl );
		}

		if (
			includes( [ NOT_JETPACK, NOT_ACTIVE_JETPACK ], this.getStatus() ) ||
			( this.getStatus() === NOT_CONNECTED_JETPACK && forceRemoteInstall )
		) {
			if (
				config.isEnabled( 'jetpack/connect/remote-install' ) &&
				! isMobileAppFlow &&
				! skipRemoteInstall
			) {
				this.goToRemoteInstall( JPC_PATH_REMOTE_INSTALL );
			} else {
				this.goToInstallInstructions( '/jetpack/connect/instructions' );
			}
		}
	}

	dismissUrl = () => this.props.dismissUrl( this.state.currentUrl );

	goBack = () => page.back();

	makeSafeRedirectionFunction( func ) {
		return url => {
			if ( ! this.state.redirecting ) {
				this.setState( { redirecting: true } );
				func( url );
			}
		};
	}

	goToPlans = this.makeSafeRedirectionFunction( url => {
		this.props.recordTracksEvent( 'calypso_jpc_success_redirect', {
			url: url,
			type: 'plans_selection',
		} );

		page.redirect( `${ JPC_PATH_PLANS }/${ urlToSlug( url ) }` );
	} );

	goToRemoteAuth = this.makeSafeRedirectionFunction( url => {
		this.props.recordTracksEvent( 'calypso_jpc_success_redirect', {
			url: url,
			type: 'remote_auth',
		} );
		externalRedirect( addCalypsoEnvQueryArg( url + REMOTE_PATH_AUTH ) );
	} );

	goToRemoteInstall = this.makeSafeRedirectionFunction( url => {
		this.props.recordTracksEvent( 'calypso_jpc_success_redirect', {
			url: url,
			type: 'remote_install',
		} );
		page.redirect( url );
	} );

	goToInstallInstructions = this.makeSafeRedirectionFunction( url => {
		const urlWithQuery = addQueryArgs( { url: this.state.currentUrl }, url );
		this.props.recordTracksEvent( 'calypso_jpc_success_redirect', {
			url: urlWithQuery,
			type: 'install_instructions',
		} );
		page( urlWithQuery );
	} );

	redirectToMobileApp = this.makeSafeRedirectionFunction( reason => {
		const url = addQueryArgs( { reason }, this.props.mobileAppRedirect );
		debug( `Redirecting to mobile app ${ url }` );
		externalRedirect( url );
	} );

	isCurrentUrlFetched() {
		return (
			this.props.jetpackConnectSite &&
			this.state.currentUrl === this.props.jetpackConnectSite.url &&
			this.props.jetpackConnectSite.isFetched
		);
	}

	isCurrentUrlFetching() {
		return (
			this.state.currentUrl !== '' &&
			this.props.jetpackConnectSite &&
			this.state.currentUrl === this.props.jetpackConnectSite.url &&
			this.props.jetpackConnectSite.isFetching
		);
	}

	handleUrlChange = event => {
		const url = event.target.value;
		this.setState( {
			currentUrl: cleanUrl( url ),
			shownUrl: url,
		} );
	};

	checkUrl( url ) {
		return this.props.checkUrl( url, !! this.props.getJetpackSiteByUrl( url ) );
	}

	handleUrlSubmit = () => {
		this.props.recordTracksEvent( 'calypso_jpc_url_submit', {
			jetpack_url: this.state.currentUrl,
		} );
		// Track that connection was started by button-click, so we can auto-approve at auth step.
		persistSession( this.state.currentUrl );

		if ( this.props.isRequestingSites ) {
			this.setState( { waitingForSites: true } );
		} else {
			this.checkUrl( this.state.currentUrl );
		}
	};

	checkProperty( propName ) {
		return (
			this.state.currentUrl &&
			this.props.jetpackConnectSite &&
			this.props.jetpackConnectSite.data &&
			this.isCurrentUrlFetched() &&
			this.props.jetpackConnectSite.data[ propName ]
		);
	}

	isError( error ) {
		return (
			this.state.currentUrl &&
			this.isCurrentUrlFetched() &&
			get( this.props.jetpackConnectSite, [ 'error', 'error' ] ) === error
		);
	}

	getStatus() {
		if ( this.state.currentUrl === '' ) {
			return false;
		}

		if ( this.isError( 'site_blacklisted' ) ) {
			return SITE_BLACKLISTED;
		}

		if ( this.checkProperty( 'userOwnsSite' ) ) {
			return ALREADY_OWNED;
		}

		if ( this.props.jetpackConnectSite.installConfirmedByUser === false ) {
			return NOT_JETPACK;
		}

		if ( this.props.jetpackConnectSite.installConfirmedByUser === true ) {
			return NOT_ACTIVE_JETPACK;
		}

		if (
			this.state.currentUrl.toLowerCase() === 'http://wordpress.com' ||
			this.state.currentUrl.toLowerCase() === 'https://wordpress.com'
		) {
			return WORDPRESS_DOT_COM;
		}
		if ( this.checkProperty( 'isWordPressDotCom' ) ) {
			return IS_DOT_COM;
		}
		if ( ! this.checkProperty( 'exists' ) ) {
			return NOT_EXISTS;
		}
		if ( ! this.checkProperty( 'isWordPress' ) ) {
			return NOT_WORDPRESS;
		}
		if ( ! this.checkProperty( 'hasJetpack' ) ) {
			return NOT_JETPACK;
		}
		const jetpackVersion = this.checkProperty( 'jetpackVersion' );
		if ( jetpackVersion && versionCompare( jetpackVersion, MINIMUM_JETPACK_VERSION, '<' ) ) {
			return OUTDATED_JETPACK;
		}
		if ( ! this.checkProperty( 'isJetpackActive' ) ) {
			return NOT_ACTIVE_JETPACK;
		}
		if (
			! this.checkProperty( 'isJetpackConnected' ) ||
			( this.checkProperty( 'isJetpackConnected' ) && ! this.checkProperty( 'userOwnsSite' ) )
		) {
			return NOT_CONNECTED_JETPACK;
		}
		if ( this.checkProperty( 'isJetpackConnected' ) && this.checkProperty( 'userOwnsSite' ) ) {
			return ALREADY_CONNECTED;
		}

		return false;
	}

	handleOnClickTos = () => this.props.recordTracksEvent( 'calypso_jpc_tos_link_click' );

	isInstall() {
		return includes( FLOW_TYPES, this.props.type );
	}

	renderFooter() {
		const { translate } = this.props;
		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem href="https://jetpack.com/support/installing-jetpack/">
					{ translate( 'Install Jetpack manually' ) }
				</LoggedOutFormLinkItem>
				<HelpButton />
			</LoggedOutFormLinks>
		);
	}

	renderSiteInput( status ) {
		return (
			<Card className="jetpack-connect__site-url-input-container">
				{ ! this.isCurrentUrlFetching() &&
				this.isCurrentUrlFetched() &&
				! this.props.jetpackConnectSite.isDismissed &&
				status ? (
					<JetpackConnectNotices
						noticeType={ status }
						onDismissClick={ IS_DOT_COM === status ? this.goBack : this.dismissUrl }
						url={ this.state.currentUrl }
						onTerminalError={ this.props.isMobileAppFlow ? this.redirectToMobileApp : null }
					/>
				) : null }

				<SiteUrlInput
					url={ this.state.shownUrl }
					onTosClick={ this.handleOnClickTos }
					onChange={ this.handleUrlChange }
					onSubmit={ this.handleUrlSubmit }
					isError={ this.getStatus() }
					isFetching={
						this.isCurrentUrlFetching() || this.state.redirecting || this.state.waitingForSites
					}
					isInstall={ this.isInstall() }
				/>
			</Card>
		);
	}

	renderLocaleSuggestions() {
		if ( this.props.isLoggedIn || ! this.props.locale ) {
			return;
		}

		return <LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />;
	}

	render() {
		const status = this.getStatus();
		const { type } = this.props;

		return (
			<MainWrapper>
				{ this.renderLocaleSuggestions() }
				<div className="jetpack-connect__site-url-entry-container">
					<MainHeader type={ type } />

					{ this.renderSiteInput( status ) }
					{ this.renderFooter() }
				</div>
			</MainWrapper>
		);
	}
}

const connectComponent = connect(
	state => {
		// Note: reading from a cookie here rather than redux state,
		// so any change in value will not execute connect().
		const mobileAppRedirect = retrieveMobileRedirect();
		const isMobileAppFlow = !! mobileAppRedirect;
		const jetpackConnectSite = getConnectingSite( state );
		const siteData = jetpackConnectSite.data || {};
		const skipRemoteInstall = siteData.skipRemoteInstall;

		return {
			// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
			getJetpackSiteByUrl: url => getJetpackSiteByUrl( state, url ),
			isLoggedIn: !! getCurrentUserId( state ),
			isMobileAppFlow,
			isRequestingSites: isRequestingSites( state ),
			jetpackConnectSite,
			mobileAppRedirect,
			skipRemoteInstall,
			siteHomeUrl: siteData.urlAfterRedirects || jetpackConnectSite.url,
		};
	},
	{
		checkUrl,
		dismissUrl,
		recordTracksEvent,
	}
);

export default flowRight( connectComponent, localize )( JetpackConnectMain );
