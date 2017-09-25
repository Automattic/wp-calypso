/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import SetupHeader from './setup-header';
import Button from 'components/button';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import ProgressBar from 'components/progress-bar';
import analytics from 'lib/analytics';
import { activatePlugin, installPlugin } from 'state/plugins/installed/actions';
import { getPlugins } from 'state/plugins/installed/selectors';
import { fetchPluginData } from 'state/plugins/wporg/actions';
import { getPlugin } from 'state/plugins/wporg/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { setFinishedInstallOfRequiredPlugins } from 'woocommerce/state/sites/setup-choices/actions';

class RequiredPluginsInstallView extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} )
	};

	constructor( props ) {
		super( props );
		this.state = {
			engineState: 'CONFIRMING',
			toActivate: [],
			toInstall: [],
			workingOn: '',
			stepIndex: 0,
		};
		this.updateTimer = false;
	}

	componentDidMount = () => {
		this.createUpdateTimer();
	}

	componentWillUnmount = () => {
		this.destroyUpdateTimer();
	}

	createUpdateTimer = () => {
		if ( this.updateTimer ) {
			return;
		}

		// Proceed at rate of approximately 60 fps
		this.updateTimer = window.setInterval( () => {
			this.updateEngine();
		}, 17 );
	}

	destroyUpdateTimer = () => {
		if ( this.updateTimer ) {
			window.clearInterval( this.updateTimer );
			this.updateTimer = false;
		}
	}

	getRequiredPluginsList = () => {
		const { translate } = this.props;

		return {
			woocommerce: translate( 'WooCommerce' ),
			'woocommerce-gateway-stripe': translate( 'WooCommerce Stripe Gateway' ),
			'woocommerce-services': translate( 'WooCommerce Services' ),
			'taxjar-simplified-taxes-for-woocommerce': translate( 'TaxJar - Sales Tax Automation for WooCommerce' ),
		};
	}

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
		let numTotalSteps = 0;
		for ( const requiredPluginSlug in requiredPlugins ) {
			const pluginFound = find( sitePlugins, { slug: requiredPluginSlug } );
			if ( ! pluginFound ) {
				toInstall.push( requiredPluginSlug );
				toActivate.push( requiredPluginSlug );
				numTotalSteps++;
			} else if ( ! pluginFound.active ) {
				toActivate.push( requiredPluginSlug );
				numTotalSteps++;
			}
		}

		if ( toInstall.length ) {
			this.setState( {
				engineState: 'INSTALLING',
				toActivate,
				toInstall,
				workingOn: '',
				numTotalSteps,
			} );
			return;
		}

		if ( toActivate.length ) {
			this.setState( {
				engineState: 'ACTIVATING',
				toActivate,
				workingOn: '',
				numTotalSteps,
			} );
			return;
		}

		this.setState( {
			engineState: 'DONESUCCESS',
		} );
	}

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
				stepIndex: this.state.stepIndex + 1,
			} );
		}
	}

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
				stepIndex: this.state.stepIndex + 1,
			} );
		}
	}

	doneSuccess = () => {
		const { site } = this.props;
		this.props.setFinishedInstallOfRequiredPlugins( site.ID, true );

		this.setState( {
			engineState: 'IDLE',
		} );
	}

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
	}

	getProgress = () => {
		const { engineState, stepIndex, numTotalSteps } = this.state;

		if ( 'INITIALIZING' === engineState ) {
			return 0;
		}

		return ( stepIndex + 1 ) / ( numTotalSteps + 1 ) * 100;
	}

	startSetup = () => {
		analytics.tracks.recordEvent( 'calypso_woocommerce_dashboard_action_click', {
			action: 'initial-setup',
		} );
		this.setState( {
			engineState: 'INITIALIZING',
		} );
	}

	renderConfirmScreen = () => {
		const { translate } = this.props;
		return (
			<div className="card dashboard__setup-wrapper dashboard__setup-confirm">
				<SetupHeader
					imageSource={ '/calypso/images/extensions/woocommerce/woocommerce-setup.svg' }
					imageWidth={ 160 }
					title={ translate( 'Have something to sell?' ) }
					subtitle={ translate(
						'If you\'re in the {{strong}}United States{{/strong}} ' +
						'or {{strong}}Canada{{/strong}}, you can sell your products right on ' +
						'your site and ship them to customers in a snap!',
						{
							components: { strong: <strong /> }
						}
					) }
				>
					<Button onClick={ this.startSetup } primary>
						{ translate( 'Set up my store!' ) }
					</Button>
				</SetupHeader>
			</div>
		);
	}

	render = () => {
		const { site, translate } = this.props;
		const { engineState } = this.state;

		if ( 'CONFIRMING' === engineState ) {
			return this.renderConfirmScreen();
		}

		const progress = this.getProgress();

		return (
			<div className="card dashboard__setup-wrapper">
				{ site && <QueryJetpackPlugins siteIds={ [ site.ID ] } /> }
				<SetupHeader
					imageSource={ '/calypso/images/extensions/woocommerce/woocommerce-store-creation.svg' }
					imageWidth={ 160 }
					title={ translate( 'Setting up your store' ) }
					subtitle={ translate( 'Give us a minute and we\'ll move right along.' ) }
				>
					<ProgressBar value={ progress } isPulsing />
				</SetupHeader>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const sitePlugins = site ? getPlugins( state, [ site.ID ] ) : [];

	return {
		site,
		sitePlugins,
		wporg: state.plugins.wporg.items,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			activatePlugin,
			fetchPluginData,
			installPlugin,
			setFinishedInstallOfRequiredPlugins,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( RequiredPluginsInstallView ) );
