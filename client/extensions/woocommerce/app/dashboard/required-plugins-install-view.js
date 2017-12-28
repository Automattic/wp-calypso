/** @format */
/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { find } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	activatePlugin,
	installPlugin,
	fetchPlugins,
} from 'client/state/plugins/installed/actions';
import analytics from 'client/lib/analytics';
import Button from 'client/components/button';
import { fetchPluginData } from 'client/state/plugins/wporg/actions';
import { getPlugin } from 'client/state/plugins/wporg/selectors';
import { getPlugins } from 'client/state/plugins/installed/selectors';
import { getSelectedSiteWithFallback } from 'client/extensions/woocommerce/state/sites/selectors';
import ProgressBar from 'client/components/progress-bar';
import QueryJetpackPlugins from 'client/components/data/query-jetpack-plugins';
import SetupHeader from './setup-header';
import { setFinishedInstallOfRequiredPlugins } from 'client/extensions/woocommerce/state/sites/setup-choices/actions';
import { hasSitePendingAutomatedTransfer } from 'client/state/selectors';
import { getAutomatedTransferStatus } from 'client/state/automated-transfer/selectors';
import { transferStates } from 'client/state/automated-transfer/constants';

// Time in seconds to complete various steps.
const TIME_TO_TRANSFER_ACTIVE = 5;
const TIME_TO_TRANSFER_UPLOADING = 5;
const TIME_TO_TRANSFER_BACKFILLING = 25;
const TIME_TO_TRANSFER_COMPLETE = 6;
const TIME_TO_PLUGIN_INSTALLATION = 15;

const transferStatusesToTimes = {};

transferStatusesToTimes[ transferStates.PENDING ] = TIME_TO_TRANSFER_ACTIVE;

// ACTIVE and PENDING have the same time because it's a way to show some progress even
// if nothing happened yet (good for UX).
transferStatusesToTimes[ transferStates.ACTIVE ] =
	transferStatusesToTimes[ transferStates.PENDING ];

transferStatusesToTimes[ transferStates.UPLOADING ] =
	TIME_TO_TRANSFER_UPLOADING + transferStatusesToTimes[ transferStates.ACTIVE ];

transferStatusesToTimes[ transferStates.BACKFILLING ] =
	TIME_TO_TRANSFER_BACKFILLING + transferStatusesToTimes[ transferStates.UPLOADING ];

transferStatusesToTimes[ transferStates.COMPLETE ] =
	TIME_TO_TRANSFER_COMPLETE + transferStatusesToTimes[ transferStates.BACKFILLING ];

class RequiredPluginsInstallView extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
	};

	constructor( props ) {
		super( props );
		this.state = {
			engineState: props.skipConfirmation ? 'INITIALIZING' : 'CONFIRMING',
			toActivate: [],
			toInstall: [],
			workingOn: '',
			progress: 0,
			totalSeconds: this.getTotalSeconds(),
		};
		this.updateTimer = false;
	}

	componentDidMount = () => {
		const { hasPendingAT, automatedTransferStatus } = this.props;

		this.createUpdateTimer();

		if ( automatedTransferStatus ) {
			this.setState( {
				progress: transferStatusesToTimes[ automatedTransferStatus ],
			} );
		}

		if ( hasPendingAT ) {
			this.startSetup();
		}
	};

	componentWillUnmount = () => {
		this.destroyUpdateTimer();
	};

	componentWillReceiveProps( nextProps ) {
		const { automatedTransferStatus: currentATStatus, siteId, hasPendingAT } = this.props;
		const { automatedTransferStatus: nextATStatus } = nextProps;

		if ( hasPendingAT && nextATStatus ) {
			this.setState( {
				progress: transferStatusesToTimes[ nextATStatus ],
			} );
		}

		const { BACKFILLING, COMPLETE } = transferStates;

		if ( BACKFILLING === currentATStatus && COMPLETE === nextATStatus ) {
			this.setState( {
				engineState: 'INITIALIZING',
				workingOn: '',
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
	};

	getRequiredPluginsList = () => {
		const { translate } = this.props;

		return {
			woocommerce: translate( 'WooCommerce' ),
			'woocommerce-gateway-stripe': translate( 'WooCommerce Stripe Gateway' ),
			'woocommerce-services': translate( 'WooCommerce Services' ),
			'mailchimp-for-woocommerce': translate(
				'MailChimp is the world’s largest marketing automation platform'
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
		const { hasPendingAT } = this.props;

		analytics.tracks.recordEvent( 'calypso_woocommerce_dashboard_action_click', {
			action: 'initial-setup',
		} );

		if ( ! hasPendingAT ) {
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

	getTotalSeconds() {
		const { hasPendingAT } = this.props;

		if ( hasPendingAT ) {
			return transferStatusesToTimes[ transferStates.COMPLETE ] + TIME_TO_PLUGIN_INSTALLATION;
		}

		return TIME_TO_PLUGIN_INSTALLATION;
	}

	render = () => {
		const { site, translate, hasPendingAT } = this.props;
		const { engineState, progress, totalSeconds } = this.state;

		if ( ! hasPendingAT && 'CONFIRMING' === engineState ) {
			return this.renderConfirmScreen();
		}

		return (
			<div className="card dashboard__setup-wrapper">
				{ site && <QueryJetpackPlugins siteIds={ [ site.ID ] } /> }
				<SetupHeader
					imageSource={ '/calypso/images/extensions/woocommerce/woocommerce-store-creation.svg' }
					imageWidth={ 160 }
					title={ translate( 'Building your store' ) }
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

	return {
		site,
		siteId,
		sitePlugins,
		wporg: state.plugins.wporg.items,
		automatedTransferStatus: getAutomatedTransferStatus( state, siteId ),
		hasPendingAT: hasSitePendingAutomatedTransfer( state, siteId ),
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			activatePlugin,
			fetchPluginData,
			installPlugin,
			setFinishedInstallOfRequiredPlugins,
			fetchPlugins,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )(
	localize( RequiredPluginsInstallView )
);
