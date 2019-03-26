/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import getJetpackProductInstallProgress from 'state/selectors/get-jetpack-product-install-progress';
import getJetpackProductInstallStatus from 'state/selectors/get-jetpack-product-install-status';
import Interval, { EVERY_SECOND } from 'lib/interval';
import QueryPluginKeys from 'components/data/query-plugin-keys';
import { getPluginKeys } from 'state/plugins/premium/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	requestJetpackProductInstallStatus,
	startJetpackProductInstall,
} from 'state/jetpack-product-install/actions';

/**
 * Module variables
 */
const NON_ERROR_STATES = [
	'not_active',
	'key_not_set',
	'installed',
	'option_name_not_in_whitelist',
];
const RETRYABLE_ERROR_STATES = [ 'vaultpress_error' ];
const PLUGINS = [ 'akismet', 'vaultpress' ];
const MAX_RETRIES = 5;

export class JetpackProductInstall extends Component {
	state = {
		startedInstallation: false,
	};

	retries = 0;

	componentDidMount() {
		this.requestStatus();
		this.maybeStartInstall();
	}

	componentDidUpdate() {
		this.maybeStartInstall();
	}

	maybeStartInstall() {
		const { pluginKeys, progressComplete, siteId } = this.props;

		// We're already installing
		if ( this.state.startedInstallation ) {
			return;
		}

		// We have installation errors
		if ( this.installationHasErrors() ) {
			return;
		}

		// We need to wait for installation status first
		if ( progressComplete === null ) {
			return;
		}

		// We should skip install if everything is already installed and configured
		if ( progressComplete === 100 ) {
			return;
		}

		if ( pluginKeys && pluginKeys.akismet && pluginKeys.vaultpress ) {
			this.setState( {
				startedInstallation: true,
			} );

			this.props.startJetpackProductInstall( siteId, pluginKeys.akismet, pluginKeys.vaultpress );
		}
	}

	installationHasErrors() {
		const { status } = this.props;

		if ( ! status ) {
			return false;
		}

		return some( PLUGINS, pluginSlug => {
			if (
				NON_ERROR_STATES.indexOf( status[ pluginSlug + '_status' ] ) < 0 &&
				RETRYABLE_ERROR_STATES.indexOf( status[ pluginSlug + '_status' ] ) < 0
			) {
				return true;
			}
			return false;
		} );
	}

	installationShouldRetry() {
		const { status } = this.props;

		if ( ! status ) {
			return false;
		}

		return (
			this.retries < MAX_RETRIES &&
			some( PLUGINS, pluginSlug => {
				if ( RETRYABLE_ERROR_STATES.indexOf( status[ pluginSlug + '_status' ] ) >= 0 ) {
					return true;
				}
				return false;
			} )
		);
	}

	requestStatus = () => {
		this.props.requestJetpackProductInstallStatus( this.props.siteId );

		if ( this.installationShouldRetry() ) {
			this.retries++;
		}
	};

	render() {
		const { progressComplete, siteId } = this.props;

		return (
			<Fragment>
				<QueryPluginKeys siteId={ siteId } />

				{ progressComplete !== 100 &&
					( ! this.installationHasErrors() || this.installationShouldRetry() ) && (
						<Interval period={ EVERY_SECOND } onTick={ this.requestStatus } />
					) }
			</Fragment>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			pluginKeys: getPluginKeys( state, siteId ),
			progressComplete: getJetpackProductInstallProgress( state, siteId ),
			status: getJetpackProductInstallStatus( state, siteId ),
		};
	},
	{
		requestJetpackProductInstallStatus,
		startJetpackProductInstall,
	}
)( JetpackProductInstall );
