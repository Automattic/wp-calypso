/** @format */
/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { find, get, delay } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { activatePlugin, installPlugin, fetchPlugins } from 'state/plugins/installed/actions';
import analytics from 'lib/analytics';
import Button from 'components/button';
import { fetchPluginData } from 'state/plugins/wporg/actions';
import { getPlugin } from 'state/plugins/wporg/selectors';
import { getPlugins } from 'state/plugins/installed/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import ProgressBar from 'components/progress-bar';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import SetupHeader from './setup-header';
import { setFinishedInstallOfRequiredPlugins } from 'woocommerce/state/sites/setup-choices/actions';
import QuerySites from 'components/data/query-sites';
import { getSiteOptions } from 'state/selectors';
import { getAutomatedTransferStatus as fetchAutomatedTransferStatus } from 'state/automated-transfer/actions';
import { getAutomatedTransferStatus } from 'state/automated-transfer/selectors';
import { transferStates } from 'state/automated-transfer/constants';
import { isSiteAutomatedTransfer as isSiteAutomatedTransferSelector } from 'state/selectors';

// Time in seconds to complete various steps.
const TIME_TO_TRANSFER_ELIGIBILITY = 5;
const TIME_TO_TRANSFER_UPLOADING = 5;
const TIME_TO_TRANSFER_BACKFILLING = 25;
const TIME_TO_TRANSFER_COMPLETE = 6;
const TIME_TO_PLUGIN_INSTALLATION = 15;

class RequiredPluginsInstallView extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
	};

	constructor( props ) {
		super( props );
		this.state = {
			engineState: 'CONFIRMING',
			toActivate: [],
			toInstall: [],
			workingOn: '',
			progress: 0,
			totalSeconds: this.getTotalSeconds(),
		};
		this.updateTimer = false;
		this.transferStatusFetcher = null;
	}

	componentDidMount = () => {
		const { signupIsStore } = this.props;

		this.createUpdateTimer();

		if ( signupIsStore ) {
			this.fetchAutomatedTransferStatus();
			this.startSetup();
		}
	};

	componentWillUnmount = () => {
		this.destroyUpdateTimer();
	};

	fetchAutomatedTransferStatus = () => {
		const { signupIsStore, automatedTransferStatus } = this.props;

		if ( signupIsStore ) {
			this.props.fetchAutomatedTransferStatus( this.props.siteId );

			if ( ! automatedTransferStatus ) {
				this.transferStatusFetcher = delay( this.fetchAutomatedTransferStatus, 4000 );

				return;
			}

			this.setState( {
				progress: this.state.progress + TIME_TO_TRANSFER_ELIGIBILITY,
			} );
		}
	};

	componentWillReceiveProps( nextProps ) {
		const { ACTIVE, UPLOADING, BACKFILLING, COMPLETE } = transferStates;
		const { automatedTransferStatus: currentAutomatedTransferStatus, siteId } = this.props;
		const { automatedTransferStatus: nextAutomatedTransferStatus } = nextProps;

		if ( currentAutomatedTransferStatus === ACTIVE && nextAutomatedTransferStatus === UPLOADING ) {
			this.setState( {
				progress: this.state.progress + TIME_TO_TRANSFER_UPLOADING,
			} );

			return;
		}

		if (
			currentAutomatedTransferStatus === UPLOADING &&
			nextAutomatedTransferStatus === BACKFILLING
		) {
			this.setState( {
				progress: this.state.progress + TIME_TO_TRANSFER_BACKFILLING,
			} );

			return;
		}

		if (
			currentAutomatedTransferStatus === BACKFILLING &&
			nextAutomatedTransferStatus === COMPLETE
		) {
			this.setState( {
				engineState: 'INITIALIZING',
				workingOn: '',
				progress: this.state.progress + TIME_TO_TRANSFER_COMPLETE,
			} );

			this.props.fetchPlugins( [ siteId ] );
		}
	}

	createUpdateTimer = () => {
		if ( this.updateTimer ) {
			return;
		}

		// Proceed at rate of approximately 60 fps
		this.updateTimer = window.setInterval( () => {
			this.updateEngine();
		}, 17 );
	};

	destroyUpdateTimer = () => {
		if ( this.updateTimer ) {
			window.clearInterval( this.updateTimer );
			this.updateTimer = false;
		}

		if ( this.transferStatusFetcher ) {
			window.clearTimeout( this.transferStatusFetcher );
			this.transferStatusFetcher = null;
		}
	};

	getRequiredPluginsList = () => {
		const { translate } = this.props;

		return {
			woocommerce: translate( 'WooCommerce' ),
			'woocommerce-gateway-stripe': translate( 'WooCommerce Stripe Gateway' ),
			'woocommerce-services': translate( 'WooCommerce Services' ),
			'taxjar-simplified-taxes-for-woocommerce': translate(
				'TaxJar - Sales Tax Automation for WooCommerce'
			),
		};
	};

	doInitialization = () => {
		const { site, sitePlugins, wporg } = this.props;
		const { workingOn } = this.state;

		if ( ! site ) {
			return;
		}

		let waitingForPluginListFromSite = false;
		if ( ! sitePlugins ) {
			waitingForPluginListFromSite = true;
		} else if ( ! Array.isArray( sitePlugins ) ) {
			waitingForPluginListFromSite = true;
		} else if ( 0 === sitePlugins.length ) {
			waitingForPluginListFromSite = true;
		}

		if ( waitingForPluginListFromSite ) {
			if ( workingOn === 'WAITING_FOR_PLUGIN_LIST_FROM_SITE' ) {
				return;
			}

			this.setState( {
				workingOn: 'WAITING_FOR_PLUGIN_LIST_FROM_SITE',
			} );
			return;
		}

		// Iterate over the required plugins, fetching plugin
		// data from wordpress.org for each into state
		const requiredPlugins = this.getRequiredPluginsList();
		let pluginDataLoaded = true;
		for ( const requiredPluginSlug in requiredPlugins ) {
			const pluginData = getPlugin( wporg, requiredPluginSlug );
			// pluginData will be null until the action has had
			// a chance to try and fetch data for the plugin slug
			// given. Note that non-wp-org plugins
			// will be accepted too, but with
			// { fetched: false, wporg: false }
			// as their response
			if ( ! pluginData ) {
				this.props.fetchPluginData( requiredPluginSlug );
				pluginDataLoaded = false;
			}
		}
		if ( ! pluginDataLoaded ) {
			if ( workingOn === 'LOAD_PLUGIN_DATA' ) {
				return;
			}

			this.setState( {
				workingOn: 'LOAD_PLUGIN_DATA',
			} );
			return;
		}

		const toInstall = [];
		const toActivate = [];
		let pluginInstallationTotalSteps = 0;
		for ( const requiredPluginSlug in requiredPlugins ) {
			const pluginFound = find( sitePlugins, { slug: requiredPluginSlug } );
			if ( ! pluginFound ) {
				toInstall.push( requiredPluginSlug );
				toActivate.push( requiredPluginSlug );
				pluginInstallationTotalSteps++;
			} else if ( ! pluginFound.active ) {
				toActivate.push( requiredPluginSlug );
				pluginInstallationTotalSteps++;
			}
		}

		if ( toInstall.length ) {
			this.setState( {
				engineState: 'INSTALLING',
				toActivate,
				toInstall,
				workingOn: '',
				pluginInstallationTotalSteps,
			} );
			return;
		}

		if ( toActivate.length ) {
			this.setState( {
				engineState: 'ACTIVATING',
				toActivate,
				workingOn: '',
				pluginInstallationTotalSteps,
			} );
			return;
		}

		this.setState( {
			engineState: 'DONESUCCESS',
		} );
	};

	doInstallation = () => {
		const { site, sitePlugins, wporg } = this.props;

		// If we are working on nothing presently, get the next thing to install and install it
		if ( 0 === this.state.workingOn.length ) {
			const toInstall = this.state.toInstall;

			// Nothing left to install? Advance to activation step
			if ( 0 === toInstall.length ) {
				this.setState( {
					engineState: 'ACTIVATING',
				} );
				return;
			}

			const workingOn = toInstall.shift();
			this.props.installPlugin( site.ID, getPlugin( wporg, workingOn ) );

			this.setState( {
				toInstall,
				workingOn,
			} );
			return;
		}

		// Otherwise, if we are working on something presently, see if it has appeared in state yet
		const pluginFound = find( sitePlugins, { slug: this.state.workingOn } );
		if ( pluginFound ) {
			this.setState( {
				workingOn: '',
				progress: this.state.progress + this.getPluginInstallationTime(),
			} );
		}
	};

	doActivation = () => {
		const { site, sitePlugins } = this.props;

		// If we are working on nothing presently, get the next thing to activate and activate it
		if ( 0 === this.state.workingOn.length ) {
			const toActivate = this.state.toActivate;

			// Nothing left to activate? Advance to done success
			if ( 0 === toActivate.length ) {
				this.setState( {
					engineState: 'DONESUCCESS',
				} );
				return;
			}

			const workingOn = toActivate.shift();

			// It is best to use sitePlugins to get the right id since the
			// plugin id isn't always slug/slug unless the main plugin PHP
			// file is the same name as the plugin folder
			const pluginToActivate = find( sitePlugins, { slug: workingOn } );
			// Already active? Skip it
			if ( pluginToActivate.active ) {
				this.setState( {
					toActivate,
					workingOn: '',
				} );
				return;
			}

			// Otherwise, activate!
			this.props.activatePlugin( site.ID, pluginToActivate );

			this.setState( {
				toActivate,
				workingOn,
			} );
			return;
		}

		// See if activation has appeared in state yet
		const pluginFound = find( sitePlugins, { slug: this.state.workingOn } );
		if ( pluginFound && pluginFound.active ) {
			this.setState( {
				workingOn: '',
				progress: this.state.progress + this.getPluginInstallationTime(),
			} );
		}
	};

	doneSuccess = () => {
		const { site } = this.props;
		this.props.setFinishedInstallOfRequiredPlugins( site.ID, true );

		this.setState( {
			engineState: 'IDLE',
		} );
	};

	updateEngine = () => {
		switch ( this.state.engineState ) {
			case 'INITIALIZING':
				this.doInitialization();
				break;
			case 'INSTALLING':
				this.doInstallation();
				break;
			case 'ACTIVATING':
				this.doActivation();
				break;
			case 'DONESUCCESS':
				this.doneSuccess();
				break;
		}
	};

	getPluginInstallationTime() {
		const { pluginInstallationTotalSteps } = this.state;

		if ( pluginInstallationTotalSteps ) {
			return TIME_TO_PLUGIN_INSTALLATION / pluginInstallationTotalSteps;
		}

		// If there's some error, return 3 seconds for a single plugin installation time.
		return 3;
	}

	startSetup = () => {
		const { signupIsStore } = this.props;

		analytics.tracks.recordEvent( 'calypso_woocommerce_dashboard_action_click', {
			action: 'initial-setup',
		} );

		if ( ! signupIsStore ) {
			this.setState( {
				engineState: 'INITIALIZING',
			} );
		}
	};

	renderConfirmScreen = () => {
		const { translate } = this.props;
		return (
			<div className="card dashboard__setup-wrapper dashboard__setup-confirm">
				<SetupHeader
					imageSource={ '/calypso/images/extensions/woocommerce/woocommerce-setup.svg' }
					imageWidth={ 160 }
					title={ translate( 'Have something to sell?' ) }
					subtitle={ translate(
						"If you're in the {{strong}}United States{{/strong}} " +
							'or {{strong}}Canada{{/strong}}, you can sell your products right on ' +
							'your site and ship them to customers in a snap!',
						{
							components: { strong: <strong /> },
						}
					) }
				>
					<Button onClick={ this.startSetup } primary>
						{ translate( 'Set up my store!' ) }
					</Button>
				</SetupHeader>
			</div>
		);
	};

	fetchSiteData = () => {
		const { automatedTransferStatus, isSiteAutomatedTransfer, siteId } = this.props;
		const { COMPLETE } = transferStates;

		if ( ! siteId ) {
			return;
		}

		if ( automatedTransferStatus === COMPLETE && ! isSiteAutomatedTransfer ) {
			return <QuerySites siteId={ siteId } />;
		}
	};

	getTotalSeconds() {
		const { signupIsStore } = this.props;

		if ( signupIsStore ) {
			return (
				TIME_TO_TRANSFER_ELIGIBILITY +
				TIME_TO_TRANSFER_UPLOADING +
				TIME_TO_TRANSFER_BACKFILLING +
				TIME_TO_TRANSFER_COMPLETE +
				TIME_TO_PLUGIN_INSTALLATION
			);
		}

		return TIME_TO_PLUGIN_INSTALLATION;
	}

	render = () => {
		const { site, translate, signupIsStore } = this.props;
		const { engineState, progress, totalSeconds } = this.state;

		if ( ! signupIsStore && 'CONFIRMING' === engineState ) {
			return this.renderConfirmScreen();
		}

		return (
			<div className="card dashboard__setup-wrapper">
				{ site && <QueryJetpackPlugins siteIds={ [ site.ID ] } /> }
				{ this.fetchSiteData() }
				<SetupHeader
					imageSource={ '/calypso/images/extensions/woocommerce/woocommerce-store-creation.svg' }
					imageWidth={ 160 }
					title={ translate( 'Setting up your store' ) }
					subtitle={ translate( "Give us a minute and we'll move right along." ) }
				>
					<ProgressBar value={ progress } total={ totalSeconds } isPulsing />
				</SetupHeader>
			</div>
		);
	};
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const siteId = site.ID;

	const sitePlugins = site ? getPlugins( state, [ siteId ] ) : [];
	const siteOptions = getSiteOptions( state, siteId );

	return {
		site,
		siteId,
		sitePlugins,
		wporg: state.plugins.wporg.items,
		automatedTransferStatus: getAutomatedTransferStatus( state, siteId ),
		isSiteAutomatedTransfer: isSiteAutomatedTransferSelector( state, siteId ),
		signupIsStore: get( siteOptions, 'signup_is_store', false ),
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			activatePlugin,
			fetchPluginData,
			installPlugin,
			setFinishedInstallOfRequiredPlugins,
			fetchAutomatedTransferStatus,
			fetchPlugins,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )(
	localize( RequiredPluginsInstallView )
);
