/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Gridicon from 'gridicons';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import JetpackConnectNotices from './jetpack-connect-notices';
import SiteURLInput from './site-url-input';
import {
	getGlobalSelectedPlan,
	getConnectingSite,
	getJetpackSiteByUrl
} from 'state/jetpack-connect/selectors';
import { isRequestingSites } from 'state/sites/selectors';
import QuerySites from 'components/data/query-sites';
import JetpackInstallStep from './install-step';
import versionCompare from 'lib/version-compare';
import LocaleSuggestions from 'signup/locale-suggestions';
import { recordTracksEvent } from 'state/analytics/actions';
import MainWrapper from './main-wrapper';
import StepHeader from 'signup/step-header';
import HelpButton from './help-button';
import untrailingslashit from 'lib/route/untrailingslashit';
import {
	confirmJetpackInstallStatus,
	dismissUrl,
	goToRemoteAuth,
	goToPluginInstall,
	goToPlans,
	goToPluginActivation,
	checkUrl
} from 'state/jetpack-connect/actions';

/**
 * Constants
 */
const MINIMUM_JETPACK_VERSION = '3.9.6';

class JetpackConnectSiteURLStep extends Component {

	state = {
		currentUrl: '',
		waitingForSites: false
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
			jpc_from: from
		} );
	}

	dismissUrl = () => this.props.dismissUrl( this.state.currentUrl );

	isCurrentUrlFetched() {
		return this.props.jetpackConnectSite &&
			this.state.currentUrl === this.props.jetpackConnectSite.url &&
			this.props.jetpackConnectSite.isFetched;
	}

	isCurrentUrlFetching() {
		return this.state.currentUrl !== '' &&
			this.props.jetpackConnectSite &&
			this.state.currentUrl === this.props.jetpackConnectSite.url &&
			this.props.jetpackConnectSite.isFetching;
	}

	cleanInputURL( inputUrl ) {
		let url = inputUrl.toLowerCase();
		if ( url && url.substr( 0, 4 ) !== 'http' ) {
			url = 'http://' + url;
		}
		return untrailingslashit( url );
	}

	onURLChange = ( url ) => {
		this.setState( { currentUrl: this.cleanInputURL( url ) } );
		this.dismissUrl();
	}

	onURLEnter = () => {
		this.props.recordTracksEvent( 'calypso_jpc_url_submit', {
			jetpack_url: this.state.currentUrl
		} );
		if ( this.props.isRequestingSites ) {
			this.setState( { waitingForSites: true } );
		} else {
			this.props.checkUrl(
				this.state.currentUrl,
				!! this.props.getJetpackSiteByUrl( this.state.currentUrl ),
				this.props.type
			);
		}
	}

	installJetpack = () => {
		this.props.recordTracksEvent( 'calypso_jpc_instructions_click', {
			jetpack_funnel: this.state.currentUrl,
			type: 'install_jetpack'
		} );

		this.props.goToPluginInstall( this.state.currentUrl );
	}

	activateJetpack = () => {
		this.props.recordTracksEvent( 'calypso_jpc_instructions_click', {
			jetpack_funnel: this.state.currentUrl,
			type: 'activate_jetpack'
		} );
		this.props.goToPluginActivation( this.state.currentUrl );
	}

	checkProperty( propName ) {
		return this.state.currentUrl &&
			this.props.jetpackConnectSite &&
			this.props.jetpackConnectSite.data &&
			this.isCurrentUrlFetched() &&
			this.props.jetpackConnectSite.data[ propName ];
	}

	componentDidUpdate() {
		if ( this.getStatus() === 'notConnectedJetpack' &&
			this.isCurrentUrlFetched() &&
			! this.props.jetpackConnectSite.isRedirecting
		) {
			return this.props.goToRemoteAuth( this.state.currentUrl );
		}
		if ( this.getStatus() === 'alreadyOwned' &&
			! this.props.jetpackConnectSite.isRedirecting
		) {
			return this.props.goToPlans( this.state.currentUrl );
		}

		if ( this.state.waitingForSites && ! this.props.isRequestingSites ) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( { waitingForSites: false } );
			this.props.checkUrl(
				this.state.currentUrl,
				!! this.props.getJetpackSiteByUrl( this.state.currentUrl ),
				this.props.type
			);
		}
	}

	isRedirecting() {
		return this.props.jetpackConnectSite &&
			this.props.jetpackConnectSite.isRedirecting &&
			this.isCurrentUrlFetched();
	}

	getStatus() {
		if ( this.state.currentUrl === '' ) {
			return false;
		}

		if ( this.checkProperty( 'userOwnsSite' ) ) {
			return 'alreadyOwned';
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
		if ( this.checkProperty( 'isJetpackConnected' ) ) {
			return 'alreadyConnected';
		}

		return false;
	}

	clearUrl = () => {
		this.dismissUrl();
	}

	handleOnClickTos = () => {
		this.props.recordTracksEvent( 'calypso_jpc_tos_link_click' );
	}

	getTexts() {
		const { type, selectedPlan } = this.props;

		if ( type === 'pro' || selectedPlan === 'jetpack_business' || selectedPlan === 'jetpack_business_monthly' ) {
			return {
				headerTitle: this.props.translate( 'Get Jetpack Professional' ),
				headerSubtitle: this.props.translate( 'To start securing and backing up your site, first install Jetpack, ' +
					'then purchase and activate your plan.' ),
			};
		}
		if ( type === 'premium' || selectedPlan === 'jetpack_premium' || selectedPlan === 'jetpack_premium_monthly' ) {
			return {
				headerTitle: this.props.translate( 'Get Jetpack Premium' ),
				headerSubtitle: this.props.translate( 'To start securing and backing up your site, first install Jetpack, ' +
					'then purchase and activate your plan.' ),
			};
		}
		if ( type === 'personal' || selectedPlan === 'jetpack_personal' || selectedPlan === 'jetpack_personal_monthly' ) {
			return {
				headerTitle: this.props.translate( 'Get Jetpack Personal' ),
				headerSubtitle: this.props.translate( 'To start securing and backing up your site, first install Jetpack, ' +
					'then purchase and activate your plan.' ),
			};
		}

		if ( type === 'install' ) {
			return {
				headerTitle: this.props.translate( 'Install Jetpack' ),
				headerSubtitle: this.props.translate( 'We\'ll be installing the Jetpack plugin so WordPress.com can connect ' +
					'to your self-hosted WordPress site.' ),
			};
		}
		return {
			headerTitle: this.props.translate( 'Connect a self-hosted WordPress' ),
			headerSubtitle: this.props.translate( 'We\'ll be installing the Jetpack plugin so WordPress.com can connect to ' +
				'your self-hosted WordPress site.' ),
		};
	}

	isInstall() {
		return this.props.type === 'install' ||
			this.props.type === 'pro' ||
			this.props.type === 'premium' ||
			this.props.type === 'personal';
	}

	getInstructionsData( status ) {
		return {
			headerTitle: ( 'notJetpack' === status )
				? this.props.translate( 'Ready for installation' )
				: this.props.translate( 'Ready for activation' ),
			headerSubtitle: this.props.translate( 'We\'ll need to send you to your site dashboard for a few manual steps.' ),
			steps: ( 'notJetpack' === status )
				? [ 'installJetpack', 'activateJetpackAfterInstall', 'connectJetpackAfterInstall' ]
				: [ 'activateJetpack', 'connectJetpack' ],
			buttonOnClick: ( 'notJetpack' === status )
				? this.installJetpack
				: this.activateJetpack,
			buttonText: ( 'notJetpack' === status )
				? this.props.translate( 'Install Jetpack' )
				: this.props.translate( 'Activate Jetpack' )
		};
	}

	renderFooter() {
		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem href="https://jetpack.com/support/installing-jetpack/">
					{ this.props.translate( 'Install Jetpack manually' ) }
				</LoggedOutFormLinkItem>
				{ this.isInstall()
					? null
					: <LoggedOutFormLinkItem href="/start">
						{ this.props.translate( 'Start a new site on WordPress.com' ) }
					</LoggedOutFormLinkItem>
				}
				<HelpButton />
			</LoggedOutFormLinks>
		);
	}

	renderSiteInput( status ) {
		return (
			<Card className="jetpack-connect__site-url-input-container">
				{ ! this.isCurrentUrlFetching() && this.isCurrentUrlFetched() && ! this.props.jetpackConnectSite.isDismissed && status
					? <JetpackConnectNotices noticeType={ status } onDismissClick={ this.dismissUrl } url={ this.state.currentUrl } />
					: null
				}

				<SiteURLInput
					onTosClick={ this.handleOnClickTos }
					onURLChange={ this.onURLChange }
					onURLEnter={ this.onURLEnter }
					onDismissClick={ this.onDismissClick }
					isError={ this.getStatus() }
					isFetching={ this.isCurrentUrlFetching() || this.isRedirecting() || this.state.waitingForSites }
					isInstall={ this.isInstall() } />
			</Card>
		);
	}

	renderLocaleSuggestions() {
		if ( this.props.userModule.get() || ! this.props.locale ) {
			return;
		}

		return <LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />;
	}

	renderSiteEntry() {
		const status = this.getStatus();
		return (
			<MainWrapper>
				{ this.renderLocaleSuggestions() }
				<div className="jetpack-connect__site-url-entry-container">
					<QuerySites allSites />
					<StepHeader
						headerText={ this.getTexts().headerTitle }
						subHeaderText={ this.getTexts().headerSubtitle }
						step={ 1 }
						steps={ 3 }
					/>

					{ this.renderSiteInput( status ) }
					{ this.renderFooter() }
				</div>
			</MainWrapper>
		);
	}

	renderNotJetpackButton() {
		return (
			<a className="jetpack-connect__no-jetpack-button" href="#" onClick={ this.confirmJetpackNotInstalled }>
				{ this.props.translate( 'Don\'t have jetpack installed?' ) }
			</a>
		);
	}

	renderBackButton() {
		return (
			<Button compact borderless className="jetpack-connect__back-button" onClick={ this.clearUrl }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ this.props.translate( 'Back' ) }
			</Button>
		);
	}

	renderInstructions( instructionsData ) {
		const jetpackVersion = this.checkProperty( 'jetpackVersion' ),
			isInstall = this.isInstall(),
			{ currentUrl } = this.state;
		return (
			<MainWrapper isWide>
				{ this.renderLocaleSuggestions() }
				<div className="jetpack-connect__install">
					<StepHeader
						headerText={ instructionsData.headerTitle }
						subHeaderText={ instructionsData.headerSubtitle }
						step={ 1 }
						steps={ instructionsData.steps.length }
					/>
					<div className="jetpack-connect__install-steps">
						{
							instructionsData.steps.map( ( stepName, key ) => {
								return (
									<JetpackInstallStep
										key={ 'instructions-step-' + key }
										stepName={ stepName }
										jetpackVersion={ jetpackVersion }
										isInstall={ isInstall }
										currentUrl={ currentUrl }
										confirmJetpackInstallStatus={ this.props.confirmJetpackInstallStatus }
										onClick={ instructionsData.buttonOnClick }
									/>
								);
							} )
						}
					</div>
					<Button onClick={ instructionsData.buttonOnClick } primary>{ instructionsData.buttonText }</Button>
					<div className="jetpack-connect__navigation">
						{ this.renderBackButton() }
					</div>
				</div>
				<LoggedOutFormLinks>
					<HelpButton />
				</LoggedOutFormLinks>
			</MainWrapper>
		);
	}

	render() {
		const status = this.getStatus();
		if (
			[ 'notJetpack', 'notActiveJetpack' ].includes( status ) &&
			! this.props.jetpackConnectSite.isDismissed
		) {
			return this.renderInstructions( this.getInstructionsData( status ) );
		}
		return this.renderSiteEntry();
	}
}

const connectComponent = connect(
	state => {
		const getJetpackSite = ( url ) => {
			return getJetpackSiteByUrl( state, url );
		};

		return {
			jetpackConnectSite: getConnectingSite( state ),
			getJetpackSiteByUrl: getJetpackSite,
			isRequestingSites: isRequestingSites( state ),
			selectedPlan: getGlobalSelectedPlan( state )
		};
	},
	dispatch => bindActionCreators( {
		confirmJetpackInstallStatus,
		recordTracksEvent,
		checkUrl,
		dismissUrl,
		goToRemoteAuth,
		goToPlans,
		goToPluginInstall,
		goToPluginActivation
	}, dispatch )
);

export default flowRight(
	connectComponent,
	localize
)( JetpackConnectSiteURLStep );
