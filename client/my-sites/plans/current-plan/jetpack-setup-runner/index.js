/** @format */
/**
 * External dependencies
 */
import debugFactory from 'debug';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { get, reduce, some } from 'lodash';

/**
 * Internal dependencies
 */
import DoPluginSetup, { ENGINE_STATE_DONE_SUCCESS } from './do-plugin-setup';
import getPluginKey from 'state/selectors/get-plugin-key';
import QueryPluginKeys from 'components/data/query-plugin-keys';
import versionCompare from 'lib/version-compare';
import wpcom from 'lib/wp';
import { getPluginOnSite } from 'state/plugins/installed/selectors';

const debug = debugFactory( 'calypso:jetpack-setup-runner' );

const KEY_PROVISION_STATE_DONE = 'KPS_DONE';
const KEY_PROVISION_STATE_FAIL = 'KPS_FAIL';
const KEY_PROVISION_STATE_IDLE = 'KPS_IDLE';
const KEY_PROVISION_STATE_IN_PROGRESS = 'KPS_IN_PROGRESS';

class JetpackSetupRunner extends PureComponent {
	static propTypes = {
		notifyProgress: PropTypes.func,
		siteId: PropTypes.number.isRequired,
	};

	state = {
		installerState: null,
		installerComplete: 0,
		installerTotal: 0,
		keyProvisioning: {
			/** These should be keyed on plugin slugs */
			akismet: KEY_PROVISION_STATE_IDLE,
			vaultpress: KEY_PROVISION_STATE_IDLE,
		},
	};

	componentDidUpdate( prevProps, prevState ) {
		this.maybeProvisionNextKey();
		this.maybeReportProgress( prevState );
	}

	/**
	 * React to state updates that should initiate and proceed through key provisioning
	 */
	maybeProvisionNextKey() {
		const { installerState } = this.state;
		// Wait until the install/activate engine completes
		if ( ENGINE_STATE_DONE_SUCCESS === installerState ) {
			const { akismet: akismetState, vaultpress: vaultpressState } = this.state.keyProvisioning;

			// Try to provision Akismet if it's idle
			if ( KEY_PROVISION_STATE_IDLE === akismetState ) {
				this.provisionAkismetKey();
			}

			// Try to provision Vaultpress it's idle and Akismet has completed (success or fail)
			if (
				KEY_PROVISION_STATE_IDLE === vaultpressState &&
				( KEY_PROVISION_STATE_DONE === akismetState || KEY_PROVISION_STATE_FAIL === akismetState )
			) {
				this.provisionVaultpressKey();
			}
		}
	}

	/**
	 * Recalculate and report progress
	 *
	 * State changes drive this Component's flow. Recalculate and report progress on relevant state
	 * changes.
	 *
	 * @param {Object} prevState Previous Component state
	 */
	maybeReportProgress( prevState ) {
		if (
			'function' === typeof this.props.notifyProgress &&
			some(
				[ 'installerComplete', 'installerTotal', 'keyProvisioning' ],
				key => prevState[ key ] !== this.state[ key ]
			)
		) {
			// Add tasks to the total for provisioning of keys
			const total = this.state.installerTotal + Object.keys( this.state.keyProvisioning ).length;

			// Add completed provisioning tasks depending on state
			const complete = reduce(
				this.state.keyProvisioning,
				( acc, provisioningState ) =>
					[ KEY_PROVISION_STATE_DONE, KEY_PROVISION_STATE_FAIL ].includes( provisioningState )
						? acc + 1
						: acc,
				this.state.installerComplete
			);

			this.props.notifyProgress( {
				complete,
				total,
			} );
		}
	}

	async provisionKey( pluginSlug, optionName, optionValue ) {
		this.setState(
			( { keyProvisioning } ) => ( {
				keyProvisioning: {
					...keyProvisioning,
					[ pluginSlug ]: KEY_PROVISION_STATE_IN_PROGRESS,
				},
			} ),
			async () => {
				try {
					const result = await wpcom
						.undocumented()
						.site( this.props.siteId )
						.setOption( {
							option_name: optionName,
							option_value: optionValue,
							site_option: false,
							is_array: false,
						} );
					this.setState( ( { keyProvisioning } ) => ( {
						keyProvisioning: {
							...keyProvisioning,
							[ pluginSlug ]: KEY_PROVISION_STATE_DONE,
						},
					} ) );
					debug( 'Provision "%s" success: %o', pluginSlug, result );
				} catch ( err ) {
					this.setState( ( { keyProvisioning } ) => ( {
						keyProvisioning: {
							...keyProvisioning,
							[ pluginSlug ]: KEY_PROVISION_STATE_FAIL,
						},
					} ) );
					debug( 'Provision "%s" error: %o', pluginSlug, err );
				}
			}
		);
	}

	provisionAkismetKey() {
		if ( this.props.keyAkismet ) {
			this.provisionKey( 'akismet', 'wordpress_api_key', this.props.keyAkismet );
		}
	}

	provisionVaultpressKey() {
		if ( this.props.vaultpressVersion && this.props.keyVaultpress ) {
			const key = versionCompare( this.props.vaultpressVersion, '1.8.3', '>' )
				? JSON.stringify( {
						action: 'register',
						key: this.props.keyVaultpress,
				  } )
				: this.props.keyVaultpress;
			this.provisionKey( 'vaultpress', 'vaultpress_auto_register', key );
		}
	}

	/**
	 * Handle plugin progress updates and adjusting for additional tasks
	 *
	 * The plugin installer reports progress. Intercept and modify that progress to account for key provisioning.
	 *
	 * @param {Object} stateUpdate             Updated state object
	 * @param {number} stateUpdate.complete    Number of completed tasks
	 * @param {number} stateUpdate.engineState Description of installer state
	 * @param {number} stateUpdate.total       Total number of tasks
	 */
	handleUpdateProgress = stateUpdate => {
		this.setState( {
			installerComplete: stateUpdate.complete,
			installerState: stateUpdate.engineState,
			installerTotal: stateUpdate.total,
		} );
	};

	render() {
		const { siteId } = this.props;
		return (
			siteId && (
				<>
					<QueryPluginKeys siteId={ siteId } />
					<DoPluginSetup
						key={ /* Force remount on site change */ siteId }
						notifyProgress={ this.handleUpdateProgress }
						requiredPlugins={ [ 'akismet', 'vaultpress' ] }
						siteId={ siteId }
					/>
				</>
			)
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	keyAkismet: getPluginKey( state, siteId, 'akismet' ),
	keyVaultpress: getPluginKey( state, siteId, 'vaultpress' ),
	vaultpressVersion: get( getPluginOnSite( state, siteId, 'vaultpress' ), [ 'version' ] ),
	siteId,
} ) )( JetpackSetupRunner );
