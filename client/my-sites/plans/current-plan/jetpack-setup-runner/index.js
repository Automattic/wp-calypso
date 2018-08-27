/** @format */
/**
 * External dependencies
 */
import debugFactory from 'debug';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

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
		keyProvisioning: {
			/** These should be keyed on plugin slugs */
			akismet: KEY_PROVISION_STATE_IDLE,
			vaultpress: KEY_PROVISION_STATE_IDLE,
		},
	};

	componentDidUpdate() {
		const { engineState } = this.state;
		// Wait until the install/activate engine completes
		if ( ENGINE_STATE_DONE_SUCCESS === engineState ) {
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
	 * Handle progress updates and notify parent of progress
	 *
	 * The plugin installer reports progress. Intercept and modify that progress to account for key provisioning.
	 *
	 * @param {Object} stateUpdate          Updated state object
	 * @param {number} stateUpdate.complete Number of completed tasks
	 * @param {number} stateUpdate.total    Total number of tasks
	 */
	handleUpdateProgress = stateUpdate => {
		this.setState( stateUpdate, () => {
			if ( 'function' === typeof this.props.notifyProgress ) {
				// Two tasks are added to the total for provisioning the two plugins
				const total = stateUpdate.total + 2;

				// Add completed provisioning tasks depending on state.
				const { akismet: akismetState, vaultpress: vaultpressState } = this.state.keyProvisioning;
				const complete =
					stateUpdate.complete +
					( KEY_PROVISION_STATE_DONE === akismetState || KEY_PROVISION_STATE_FAIL === akismetState
						? 1
						: 0 ) +
					( KEY_PROVISION_STATE_DONE === vaultpressState ||
					KEY_PROVISION_STATE_FAIL === vaultpressState
						? 1
						: 0 );

				this.props.notifyProgress( {
					...stateUpdate,
					complete,
					total,
				} );
			}
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
