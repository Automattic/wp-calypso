/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { find, some } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { activatePlugin, installPlugin, fetchPlugins } from 'state/plugins/installed/actions';
import { fetchPluginData } from 'state/plugins/wporg/actions';
import { getPlugin } from 'state/plugins/wporg/selectors';
import { getPlugins, getStatusForSite } from 'state/plugins/installed/selectors';

export const ENGINE_STATE_ACTIVATE = 'ES_ACTIVATE';
export const ENGINE_STATE_DONE_FAIL = 'ES_DONE_FAIL';
export const ENGINE_STATE_DONE_SUCCESS = 'ES_DONE_SUCCESS';
export const ENGINE_STATE_INITIALIZE = 'ES_INIT';
export const ENGINE_STATE_INSTALL = 'ES_INSTALL';

class PluginInstaller extends Component {
	static propTypes = {
		notifyProgress: PropTypes.func,
		requiredPlugins: PropTypes.arrayOf( PropTypes.string ).isRequired,
		siteId: PropTypes.number.isRequired,
	};

	state = {
		engineState: ENGINE_STATE_INITIALIZE,
		toActivate: [],
		toInstall: [],
		workingOn: '',
	};

	updateTimer = null;

	componentDidMount() {
		const { siteId } = this.props;
		this.props.fetchPlugins( [ siteId ] );
		this.createUpdateTimer();
	}

	componentWillUnmount() {
		this.destroyUpdateTimer();
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( prevProps.siteId !== this.props.siteId ) {
			this.props.fetchPlugins( [ this.props.siteId ] );
			this.doInitialization();
		}

		/**
		 * Push relevant state changes up to consumers
		 */
		if ( 'function' === typeof this.props.notifyProgress ) {
			// Update if relevant bit of state has changed
			const prevPending = prevState.toActivate.length + prevState.toInstall.length;
			const thisPending = this.state.toActivate.length + this.state.toInstall.length;

			if (
				prevPending !== thisPending ||
				some(
					[ 'engineState', 'total', 'workingOn' ],
					key => prevState[ key ] !== this.state[ key ]
				)
			) {
				// Each plugin requires 2 steps
				const total = this.props.requiredPlugins.length * 2;
				this.props.notifyProgress( {
					complete: total - thisPending,
					engineState: this.state.engineState,
					total,
					workingOn: this.state.workingOn,
				} );
			}
		}
	}

	createUpdateTimer() {
		if ( this.updateTimer ) {
			return;
		}

		// Proceed at rate of approximately 60 fps
		this.updateTimer = window.setInterval( () => {
			this.updateEngine();
		}, 17 );
	}

	destroyUpdateTimer() {
		if ( this.updateTimer ) {
			window.clearInterval( this.updateTimer );
			this.updateTimer = null;
		}
	}

	doInitialization = () => {
		const { requiredPlugins, siteId, sitePlugins, wporg } = this.props;
		const { workingOn } = this.state;

		if ( ! siteId ) {
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
		let pluginDataLoaded = true;
		for ( const requiredPluginSlug of requiredPlugins ) {
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
		for ( const requiredPluginSlug of requiredPlugins ) {
			const pluginFound = find( sitePlugins, { slug: requiredPluginSlug } );
			if ( ! pluginFound ) {
				toInstall.push( requiredPluginSlug );
				toActivate.push( requiredPluginSlug );
			} else if ( ! pluginFound.active ) {
				toActivate.push( requiredPluginSlug );
			}
		}

		let engineState = ENGINE_STATE_DONE_SUCCESS;
		if ( toInstall.length ) {
			engineState = ENGINE_STATE_INSTALL;
		} else if ( toActivate.length ) {
			engineState = ENGINE_STATE_ACTIVATE;
		}

		this.setState( {
			engineState,
			toActivate,
			toInstall,
			workingOn: '',
		} );
	};

	doInstallation = () => {
		const { pluginsStatus, siteId, sitePlugins, wporg } = this.props;

		// If we are working on nothing presently, get the next thing to install and install it
		if ( 0 === this.state.workingOn.length ) {
			const toInstall = this.state.toInstall;

			// Nothing left to install? Advance to activation step
			if ( 0 === toInstall.length ) {
				this.setState( {
					engineState: ENGINE_STATE_ACTIVATE,
				} );
				return;
			}

			const workingOn = toInstall.shift();
			const thisPlugin = getPlugin( wporg, workingOn );
			// Set a default ID if needed.
			thisPlugin.id = thisPlugin.id || thisPlugin.slug;
			this.props.installPlugin( siteId, thisPlugin );

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
			} );
		}

		// Or, it's in the error state
		const pluginStatus = pluginsStatus[ this.state.workingOn ];
		if ( pluginStatus && 'error' === pluginStatus.status ) {
			this.setState( {
				engineState: ENGINE_STATE_DONE_FAIL,
			} );
		}
	};

	doActivation = () => {
		const { siteId, sitePlugins } = this.props;

		// If we are working on nothing presently, get the next thing to activate and activate it
		if ( 0 === this.state.workingOn.length ) {
			const toActivate = this.state.toActivate;

			// Nothing left to activate? Advance to done success
			if ( 0 === toActivate.length ) {
				this.setState( {
					engineState: ENGINE_STATE_DONE_SUCCESS,
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
			this.props.activatePlugin( siteId, pluginToActivate );

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
			} );
		}
	};

	doneFailure = this.destroyUpdateTimer;
	doneSuccess = this.destroyUpdateTimer;

	updateEngine = () => {
		switch ( this.state.engineState ) {
			case ENGINE_STATE_INITIALIZE:
				this.doInitialization();
				break;
			case ENGINE_STATE_INSTALL:
				this.doInstallation();
				break;
			case ENGINE_STATE_ACTIVATE:
				this.doActivation();
				break;
			case ENGINE_STATE_DONE_SUCCESS:
				this.doneSuccess();
				break;
			case ENGINE_STATE_DONE_FAIL:
				this.doneFailure();
				break;
		}
	};

	render() {
		return null;
	}
}

function mapStateToProps( state, { siteId } ) {
	const sitePlugins = siteId ? getPlugins( state, [ siteId ] ) : [];
	const pluginsStatus = getStatusForSite( state, siteId );

	return {
		siteId,
		sitePlugins,
		pluginsStatus,
		wporg: state.plugins.wporg.items,
	};
}

export default connect(
	mapStateToProps,
	{
		activatePlugin,
		fetchPluginData,
		installPlugin,
		fetchPlugins,
	}
)( localize( PluginInstaller ) );
