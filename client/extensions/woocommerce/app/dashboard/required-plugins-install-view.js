/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import debugFactory from 'debug';
import { find, size } from 'lodash';
import { localize } from 'i18n-calypso';
const debug = debugFactory( 'calypso:allendav' );

/**
 * Internal dependencies
 */
import { installPlugin } from 'state/plugins/installed/actions';
import { fetchPluginData } from 'state/plugins/wporg/actions';
import { getPlugin } from 'state/plugins/wporg/selectors';
import { getPlugins } from 'state/plugins/installed/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import ProgressBar from 'components/progress-bar';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import SetupHeader from './setup-header';
//import { setFinishedInstallOfRequiredPlugins } from 'woocommerce/state/sites/setup-choices/actions';
// import wp from 'lib/wp';

class RequiredPluginsInstallView extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired
		} )
	};

	constructor( props ) {
		super( props );
		this.state = {
			engineState: 'INITIALIZING',
			message: '',
			progress: 0,
			toActivate: [],
			toInstall: [],
			workingOn: ''
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

		this.updateTimer = window.setInterval( () => {
			this.updateEngine();
		}, 1000 );
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
			'wc-api-dev': translate( 'WooCommerce API Dev' ),
			'woocommerce-gateway-stripe': translate( 'WooCommerce Stripe Gateway' ),
			'woocommerce-services': translate( 'WooCommerce Services' ),
			'taxjar-simplified-taxes-for-woocommerce': translate( 'TaxJar - Sales Tax Automation for WooCommerce' )
		};
	}

	doInitialization = () => {
		const { site, sitePlugins, translate, wporg } = this.props;

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
			this.setState( {
				message: translate( 'Waiting for plugin list from site' ),
				progress: 0
			} );
			return;
		}

		debug( 'sitePlugins=', sitePlugins );

		const requiredPlugins = this.getRequiredPluginsList();
		let pluginDataLoaded = true;
		for ( const requiredPluginSlug in requiredPlugins ) {
			const pluginData = getPlugin( wporg, requiredPluginSlug );
			debug( 'plugin Data', requiredPluginSlug, pluginData );
			if ( ! pluginData ) {
				this.props.fetchPluginData( requiredPluginSlug );
				pluginDataLoaded = false;
			}
		}
		if ( ! pluginDataLoaded ) {
			this.setState( {
				message: translate( 'Loading plugin data' ),
				progress: 0
			} );
			return;
		}

		const toInstall = [];
		const toActivate = [];
		for ( const requiredPluginSlug in requiredPlugins ) {
			const pluginFound = find( sitePlugins, { slug: requiredPluginSlug } );

			if ( ! pluginFound ) {
				toInstall.push( requiredPluginSlug );
				toActivate.push( requiredPluginSlug );
			} else if ( ! pluginFound.active ) {
				toActivate.push( requiredPluginSlug );
			}
		}

		debug( 'plugins to install=', toInstall );
		debug( 'plugins to activate=', toActivate );

		if ( toInstall.length ) {
			this.setState( {
				engineState: 'INSTALLING',
				message: '',
				progress: 25,
				toActivate,
				toInstall
			} );
			return;
		}

		if ( toActivate.length ) {
			this.setState( {
				engineState: 'ACTIVATING',
				message: '',
				progress: 50,
				toActivate
			} );
			return;
		}

		this.setState( {
			engineState: 'DONESUCCESS',
			message: ''
		} );
	}

	doInstallation = () => {
		const { site, sitePlugins, translate, wporg } = this.props;
		const requiredPlugins = this.getRequiredPluginsList();

		if ( 0 === this.state.workingOn.length ) {
			const toInstall = this.state.toInstall;

			// Nothing left to install? Advance to activation step
			if ( 0 === toInstall.length ) {
				this.setState( {
					engineState: 'ACTIVATING',
					message: '',
					progress: 50
				} );
				return;
			}

			const workingOn = toInstall.shift();
			debug( 'kicking off install of ', workingOn );
			this.props.installPlugin( site.ID, getPlugin( wporg, workingOn ) );

			this.setState( {
				message: translate( 'Installing %(plugin)s', { args: { plugin: requiredPlugins[ workingOn ] } } ),
				toInstall,
				workingOn
			} );
			return;
		}

		const pluginFound = find( sitePlugins, { slug: this.state.workingOn } );
		if ( pluginFound ) {
			this.setState( {
				workingOn: ''
			} );
		}
	}

	doActivation = () => {
		const { translate } = this.props;
		const requiredPlugins = this.getRequiredPluginsList();

		if ( 0 === this.state.workingOn.length ) {
			const toActivate = this.state.toActivate;

			// Nothing left to install? Advance to done success
			if ( 0 === toActivate.length ) {
				this.setState( {
					engineState: 'DONESUCCESS',
					message: '',
					progress: 100
				} );
				return;
			}

			const workingOn = toActivate.shift();
			// TODO kick off activation

			this.setState( {
				message: translate( 'Activating %(plugin)s', { args: { plugin: requiredPlugins[ workingOn ] } } ),
				toActivate,
				workingOn
			} );
			return;
		}

		// TODO - check and see if the plugin is now in the plugin list for the site
		this.setState( {
			workingOn: ''
		} );
	}

	doneSuccess = () => {
		// TODO - dispatch setFinishedInstallOfRequiredPlugins

		this.setState( {
			engineState: 'IDLE',
			message: this.props.translate( 'All required plugins are installed and activated' ),
			progress: 100
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
		const { engineState, toActivate, toInstall } = this.state;

		const requiredPluginsCount = size( this.getRequiredPluginsList() );
		const installedPluginsCount = requiredPluginsCount - toInstall.length;
		const activatedPluginsCount = requiredPluginsCount - toActivate.length;
		const perPluginProgress = 25 / requiredPluginsCount;

		if ( 'INITIALIZING' === engineState ) {
			return 0;
		}

		if ( 'INSTALLING' === engineState ) {
			return 25 + installedPluginsCount * perPluginProgress;
		}

		if ( 'ACTIVATING' === engineState ) {
			return 50 + activatedPluginsCount * perPluginProgress;
		}

		return 100;
	}

	render = () => {
		const { site, translate } = this.props;
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
					<p>
						{ this.state.message }
					</p>
				</SetupHeader>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const sitePlugins = site ? getPlugins( state, [ site ] ) : [];

	return {
		site,
		sitePlugins,
		wporg: state.plugins.wporg.items,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchPluginData,
			installPlugin
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( RequiredPluginsInstallView ) );
