/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ConnectHeader from './connect-header';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import JetpackConnectNotices from './jetpack-connect-notices';
import SiteURLInput from './site-url-input';
import { getSiteByUrl } from 'state/sites/selectors';
import QuerySites from 'components/data/query-sites';
import JetpackExampleInstall from './exampleComponents/jetpack-install';
import JetpackExampleActivate from './exampleComponents/jetpack-activate';
import JetpackExampleConnect from './exampleComponents/jetpack-connect';
import JetpackInstallStep from './install-step';
import versionCompare from 'lib/version-compare';
import LocaleSuggestions from 'signup/locale-suggestions';
import { recordTracksEvent } from 'state/analytics/actions';
import Gridicon from 'components/gridicon';
import MainWrapper from './main-wrapper';
import {
	confirmJetpackInstallStatus,
	dismissUrl,
	goToRemoteAuth,
	goToPluginInstall,
	goToPluginActivation,
	checkUrl
} from 'state/jetpack-connect/actions';
/**
 * Constants
 */
const MINIMUM_JETPACK_VERSION = '3.9.6';

const JetpackConnectMain = React.createClass( {
	displayName: 'JetpackConnectSiteURLStep',

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
		this.props.recordTracksEvent( 'calypso_jpc_url_view', {
			jpc_from: from
		} );
	},

	getInitialState() {
		return {
			currentUrl: '',
		};
	},

	dismissUrl() {
		this.props.dismissUrl( this.state.currentUrl );
	},

	confirmJetpackInstalled( event ) {
		event.preventDefault();
		this.props.confirmJetpackInstallStatus( true );
	},

	confirmJetpackNotInstalled( event ) {
		event.preventDefault();
		this.props.confirmJetpackInstallStatus( false );
	},

	isCurrentUrlFetched() {
		return this.props.jetpackConnectSite &&
			this.state.currentUrl === this.props.jetpackConnectSite.url &&
			this.props.jetpackConnectSite.isFetched;
	},

	isCurrentUrlFetching() {
		return this.state.currentUrl !== '' &&
			this.props.jetpackConnectSite &&
			this.state.currentUrl === this.props.jetpackConnectSite.url &&
			this.props.jetpackConnectSite.isFetching;
	},

	getCurrentUrl() {
		let url = this.refs.siteUrlInputRef.state.value;
		if ( url && url.substr( 0, 4 ) !== 'http' ) {
			url = 'http://' + url;
		}
		return url;
	},

	onURLChange() {
		this.setState( { currentUrl: this.getCurrentUrl() } );
		this.dismissUrl();
	},

	onURLEnter() {
		this.props.recordTracksEvent( 'calypso_jpc_url_submit', {
			jetpack_url: this.state.currentUrl
		} );
		this.props.checkUrl(
			this.state.currentUrl,
			!! this.props.getJetpackSiteByUrl( this.state.currentUrl ),
			this.props.type
		);
	},

	installJetpack() {
		this.props.recordTracksEvent( 'calypso_jpc_instructions_click', {
			jetpack_funnel: this.state.currentUrl,
			type: 'install_jetpack'
		} );

		this.props.goToPluginInstall( this.state.currentUrl );
	},

	activateJetpack() {
		this.props.recordTracksEvent( 'calypso_jpc_instructions_click', {
			jetpack_funnel: this.state.currentUrl,
			type: 'activate_jetpack'
		} );
		this.props.goToPluginActivation( this.state.currentUrl );
	},

	checkProperty( propName ) {
		return this.state.currentUrl &&
			this.props.jetpackConnectSite &&
			this.props.jetpackConnectSite.data &&
			this.isCurrentUrlFetched() &&
			this.props.jetpackConnectSite.data[ propName ];
	},

	componentDidUpdate() {
		if ( this.getStatus() === 'notConnectedJetpack' &&
			this.isCurrentUrlFetched() &&
			! this.props.jetpackConnectSite.isRedirecting
		) {
			return this.props.goToRemoteAuth( this.state.currentUrl );
		}
	},

	isRedirecting() {
		return this.props.jetpackConnectSite &&
			this.props.jetpackConnectSite.isRedirecting &&
			this.isCurrentUrlFetched();
	},

	getStatus() {
		if ( this.state.currentUrl === '' ) {
			return false;
		}

		if ( this.props.jetpackConnectSite.installConfirmedByUser === false ) {
			return 'notJetpack';
		}

		if ( this.props.jetpackConnectSite.installConfirmedByUser === true ) {
			return 'notActiveJetpack';
		}

		if ( this.state.currentUrl.toLowerCase() === 'http://wordpress.com' ||
			this.state.currentUrl.toLowerCase() === 'https://wordpress.com' ) {
			return 'wordpress.com';
		}
		if ( this.checkProperty( 'isWordPressDotCom' ) ) {
			return 'isDotCom';
		}
		if ( ! this.checkProperty( 'exists' ) ) {
			return 'notExists';
		}
		if ( ! this.checkProperty( 'isWordPress' ) ) {
			return 'notWordPress';
		}
		if ( ! this.checkProperty( 'hasJetpack' ) ) {
			return 'notJetpack';
		}
		const jetpackVersion = this.checkProperty( 'jetpackVersion' );
		if ( jetpackVersion && versionCompare( jetpackVersion, MINIMUM_JETPACK_VERSION, '<' ) ) {
			return 'outdatedJetpack';
		}
		if ( ! this.checkProperty( 'isJetpackActive' ) ) {
			return 'notActiveJetpack';
		}
		if ( ! this.checkProperty( 'isJetpackConnected' ) ) {
			return 'notConnectedJetpack';
		}
		if ( this.checkProperty( 'userOwnsSite' ) ) {
			return 'alreadyOwned';
		}
		if ( this.checkProperty( 'isJetpackConnected' ) ) {
			return 'alreadyConnected';
		}

		return false;
	},

	clearUrl() {
		this.dismissUrl();
	},

	handleOnClickTos() {
		this.props.recordTracksEvent( 'calypso_jpc_tos_link_click' );
	},

	getTexts() {
		if ( this.props.type === 'install' ) {
			return {
				headerTitle: this.translate( 'Install Jetpack' ),
				headerSubtitle: this.translate( 'We\'ll be installing the Jetpack plugin so WordPress.com can connect ' +
					'to your self-hosted WordPress site.' ),
			};
		}
		if ( this.props.type === 'pro' ) {
			return {
				headerTitle: this.translate( 'Get Jetpack Professional' ),
				headerSubtitle: this.translate( 'To start securing and backing up your site, first install Jetpack, ' +
					'then purchase and activate your plan.' ),
			};
		}
		if ( this.props.type === 'premium' ) {
			return {
				headerTitle: this.translate( 'Get Jetpack Premium' ),
				headerSubtitle: this.translate( 'To start securing and backing up your site, first install Jetpack, ' +
					'then purchase and activate your plan.' ),
			};
		}
		return {
			headerTitle: this.translate( 'Connect a self-hosted WordPress' ),
			headerSubtitle: this.translate( 'We\'ll be installing the Jetpack plugin so WordPress.com can connect to ' +
				'your self-hosted WordPress site.' ),
		};
	},

	isInstall() {
		return this.props.type === 'install' || this.props.type === 'pro' || this.props.type === 'premium';
	},

	renderFooter() {
		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem href="https://jetpack.com/support/installing-jetpack/">
					{ this.translate( 'Install Jetpack Manually' ) }
				</LoggedOutFormLinkItem>
				{ this.isInstall()
					? null
					: <LoggedOutFormLinkItem href="/start">{ this.translate( 'Start a new site on WordPress.com' ) }</LoggedOutFormLinkItem>
				}
			</LoggedOutFormLinks>
		);
	},

	renderSiteInput( status ) {
		return (
			<Card className="jetpack-connect__site-url-input-container">
				{ ! this.isCurrentUrlFetching() && this.isCurrentUrlFetched() && ! this.props.jetpackConnectSite.isDismissed && status
					? <JetpackConnectNotices noticeType={ status } onDismissClick={ this.dismissUrl } url={ this.state.currentUrl } />
					: null
				}

				<SiteURLInput ref="siteUrlInputRef"
					onTosClick={ this.handleOnClickTos }
					onChange={ this.onURLChange }
					onClick={ this.onURLEnter }
					onDismissClick={ this.onDismissClick }
					isError={ this.getStatus() }
					isFetching={ this.isCurrentUrlFetching() || this.isRedirecting() }
					isInstall={ this.isInstall() } />
			</Card>
		);
	},

	renderLocaleSuggestions() {
		if ( this.props.userModule.get() || ! this.props.locale ) {
			return;
		}

		return (
			<LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />
		);
	},

	renderSiteEntry() {
		const status = this.getStatus();
		return (
			<MainWrapper>
				{ this.renderLocaleSuggestions() }
				<div className="jetpack-connect__site-url-entry-container">
					<QuerySites/>
					<ConnectHeader
						showLogo={ false }
						headerText={ this.getTexts().headerTitle }
						subHeaderText={ this.getTexts().headerSubtitle }
						step={ 1 }
						steps={ 3 } />

					{ this.renderSiteInput( status ) }
					{ this.renderFooter() }
				</div>
			</MainWrapper>
		);
	},

	renderSiteEntryInstall() {
		const status = this.getStatus();
		return (
			<MainWrapper>
				{ this.renderLocaleSuggestions() }
				<div className="jetpack-connect__site-url-entry-container">
					<QuerySites/>
					<ConnectHeader
						showLogo={ false }
						headerText={ this.getTexts().headerTitle }
						subHeaderText={ this.getTexts().headerSubtitle }
						step={ 1 }
						steps={ 3 } />

					{ this.renderSiteInput( status ) }
					{ this.renderFooter() }
				</div>
			</MainWrapper>
		);
	},

	renderInstallInstructions() {
		return (
			<MainWrapper isWide>
				{ this.renderLocaleSuggestions() }
				<div className="jetpack-connect__install">
					<ConnectHeader
						showLogo={ false }
						headerText={ this.translate( 'Ready for installation' ) }
						subHeaderText={ this.translate( 'We\'ll need to send you to your site dashboard for a few manual steps.' ) }
						step={ 1 }
						steps={ 3 } />
					<div className="jetpack-connect__install-steps">
						<JetpackInstallStep title={ this.translate( '1. Install Jetpack' ) }
							text={ this.isInstall()
									? this.translate( 'You will be redirected to your site\'s dashboard to install ' +
										'Jetpack. Click the blue "Install Now" button.' )
									: this.translate( 'You will be redirected to the Jetpack plugin page on your site\'s ' +
										'dashboard to install Jetpack. Click the blue install button.' )
								}
							action={ this.renderAlreadyHaveJetpackButton() }
							example={ <JetpackExampleInstall url={ this.state.currentUrl } /> } />
						<JetpackInstallStep title={ this.translate( '2. Activate Jetpack' ) }
							text={ this.translate( 'Then you\'ll click the blue "Activate" link to activate Jetpack.' ) }
							example={ <JetpackExampleActivate url={ this.state.currentUrl } isInstall={ true } /> } />
						<JetpackInstallStep title={ this.translate( '3. Connect Jetpack' ) }
							text={ this.translate( 'Finally, click the green "Connect to WordPress.com" button to finish the process.' ) }
							example={ <JetpackExampleConnect url={ this.state.currentUrl } /> } />
					</div>
					<Button onClick={ this.installJetpack } primary>{ this.translate( 'Install Jetpack' ) }</Button>
					<div className="jetpack-connect__navigation">
						<div>{ this.renderBackButton() }</div>
					</div>
				</div>
			</MainWrapper>
		);
	},

	renderAlreadyHaveJetpackButton() {
		return (
			<a className="jetpack-connect__already-installed-jetpack-button" href="#" onClick={ this.confirmJetpackInstalled }>
				{ this.translate( 'Already have jetpack installed?' ) }
			</a>
		);
	},

	renderNotJetpackButton() {
		return (
			<a className="jetpack-connect__no-jetpack-button" href="#" onClick={ this.confirmJetpackNotInstalled }>
				{ this.translate( 'Don\'t have jetpack installed?' ) }
			</a>
		);
	},

	renderBackButton() {
		return (
			<Button compact borderless className="jetpack-connect__back-button" onClick={ this.clearUrl }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ this.translate( 'Back' ) }
			</Button>
		);
	},

	renderActivateInstructions() {
		return (
			<MainWrapper isWide>
				{ this.renderLocaleSuggestions() }
				<div className="jetpack-connect__install">
					<ConnectHeader showLogo={ false }
						headerText={ this.translate( 'Ready for activation' ) }
						subHeaderText={ this.translate( 'We\'ll need to send you to your site dashboard for a few manual steps.' ) }
						step={ 1 }
						steps={ 3 } />
					<div className="jetpack-connect__install-steps">
						<JetpackInstallStep title={ this.translate( '1. Activate Jetpack' ) }
							text={ this.translate( 'You will be redirected to your site\'s dashboard to activate ' +
								'Jetpack. Click the blue "Activate" link.' ) }
							action={ this.renderNotJetpackButton() }
							example={ <JetpackExampleActivate url={ this.state.currentUrl } isInstall={ false } /> } />
						<JetpackInstallStep title={ this.translate( '2. Connect Jetpack' ) }
							text={ this.translate( 'Then click the green "Connect to WordPress.com" button to finish the process.' ) }
							example={ <JetpackExampleConnect url={ this.state.currentUrl } /> } />
					</div>
					<Button onClick={ this.activateJetpack } primary>{ this.translate( 'Activate Jetpack' ) }</Button>
					<div className="jetpack-connect__navigation">
						{ this.renderBackButton() }
					</div>
				</div>
			</MainWrapper>
		);
	},

	render() {
		const status = this.getStatus();
		if ( status === 'notJetpack' && ! this.props.jetpackConnectSite.isDismissed ) {
			return this.renderInstallInstructions();
		}
		if ( status === 'notActiveJetpack' && ! this.props.jetpackConnectSite.isDismissed ) {
			return this.renderActivateInstructions();
		}
		if ( this.isInstall() ) {
			return this.renderSiteEntryInstall();
		}
		return this.renderSiteEntry();
	}
} );

export default connect(
	state => {
		const getJetpackSiteByUrl = ( url ) => {
			const site = getSiteByUrl( state, url );
			if ( site && ! site.jetpack ) {
				return false;
			}
			return site;
		};
		return {
			jetpackConnectSite: state.jetpackConnect.jetpackConnectSite,
			getJetpackSiteByUrl
		};
	},
	dispatch => bindActionCreators( {
		recordTracksEvent,
		confirmJetpackInstallStatus,
		checkUrl,
		dismissUrl,
		goToRemoteAuth,
		goToPluginInstall,
		goToPluginActivation
	}, dispatch )
)( JetpackConnectMain );
