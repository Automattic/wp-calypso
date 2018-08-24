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
import { getSelectedSiteId } from 'state/ui/selectors';

const debug = debugFactory( 'calypso:plugin-setup' );

const KEY_PROVISION_STATE_DONE = 'KPS_DONE';
const KEY_PROVISION_STATE_FAIL = 'KPS_FAIL';
const KEY_PROVISION_STATE_IDLE = 'KPS_IDLE';
const KEY_PROVISION_STATE_IN_PROGRESS = 'KPS_IN_PROGRESS';

class JetpackSetupRunner extends PureComponent {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
		notifyProgress: PropTypes.func,
	};

	state = {
		akismetKeyProvisioning: KEY_PROVISION_STATE_IDLE,
		vaultpressKeyProvisioning: KEY_PROVISION_STATE_IDLE,
	};

	componentDidUpdate( _, prevState ) {
		debug( 'Last state:\n%o\n\nThis state:\n%o', prevState, this.state );
		if ( ENGINE_STATE_DONE_SUCCESS === this.state.engineState ) {
			// Provision Akismet if it's idle
			if ( KEY_PROVISION_STATE_IDLE === this.state.akismetKeyProvisioning ) {
				this.provisionAkismetKey();
			}

			// Provision Vaultpress if Akismet is finished and it's idle
			if (
				KEY_PROVISION_STATE_IDLE === this.state.vaultpressKeyProvisioning &&
				( KEY_PROVISION_STATE_DONE === this.state.akismetKeyProvisioning ||
					KEY_PROVISION_STATE_FAIL === this.state.akismetKeyProvisioning )
			) {
				this.provisionVaultpressKey();
			}
		}
	}

	provisionAkismetKey() {
		if ( this.props.keyAkismet ) {
			this.setState(
				{
					akismetKeyProvisioning: KEY_PROVISION_STATE_IN_PROGRESS,
				},
				async () => {
					try {
						const result = await wpcom
							.undocumented()
							.site( this.props.siteId )
							.setOption( {
								option_name: 'wordpress_api_key',
								option_value: this.props.keyAkismet,
								site_option: false,
								is_array: false,
							} );
						this.setState( {
							akismetKeyProvisioning: KEY_PROVISION_STATE_DONE,
						} );
						debug( 'Akismet provision success: %o', result );
					} catch ( err ) {
						this.setState( {
							akismetKeyProvisioning: KEY_PROVISION_STATE_FAIL,
						} );
						debug( 'Akismet provision error: %o', err );
					}
				}
			);
		}
	}

	provisionVaultpressKey() {
		if ( this.props.vaultpressVersion && this.props.keyVaultpress ) {
			this.setState(
				{
					vaultpressKeyProvisioning: KEY_PROVISION_STATE_IN_PROGRESS,
				},
				async () => {
					// VP 1.8.4+ expects a different format for this option.
					const option_value = versionCompare( this.props.vaultpressVersion, '1.8.3', '>' )
						? JSON.stringify( {
								action: 'register',
								key: this.props.keyVaultpress,
						  } )
						: this.props.keyVaultpress;
					try {
						const result = await wpcom
							.undocumented()
							.site( this.props.siteId )
							.setOption( {
								option_name: 'vaultpress_auto_register',
								option_value,
								site_option: false,
								is_array: false,
							} );
						this.setState( {
							vaultpressKeyProvisioning: KEY_PROVISION_STATE_DONE,
						} );
						debug( 'VaultPress provision success: %o', result );
					} catch ( err ) {
						this.setState( {
							vaultpressKeyProvisioning: KEY_PROVISION_STATE_FAIL,
						} );
						debug( 'VaultPress provision error: %o', err );
					}
				}
			);
		}
	}

	/**
	 * Handle progress updates and notify parent of progress
	 *
	 * In addition to install and activation, handled by DoPluginSetup, this component will
	 * provision plugin keys provided by a plan.
	 *
	 * Adjust progress accordingly.
	 */
	handleUpdateProgress = stateUpdate => {
		this.setState( stateUpdate );
		if ( 'function' === typeof this.props.notifyProgress ) {
			this.props.notifyProgress( {
				...stateUpdate,
				total: stateUpdate.total + 2, // Add two tasks for key provisioning
			} );
		}
	};

	render() {
		const { siteId } = this.props;
		return (
			<>
				{ siteId && <QueryPluginKeys siteId={ siteId } /> }
				<DoPluginSetup
					key={ /* Force remount on site change */ siteId }
					notifyProgress={ this.handleUpdateProgress }
					requiredPlugins={ [ 'akismet', 'vaultpress' ] }
				/>
			</>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		keyAkismet: getPluginKey( state, siteId, 'akismet' ),
		keyVaultpress: getPluginKey( state, siteId, 'vaultpress' ),
		vaultpressVersion: get( getPluginOnSite( state, siteId, 'vaultpress' ), [ 'version' ] ),
		siteId,
	};
} )( JetpackSetupRunner );
