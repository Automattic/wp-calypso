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
const nonErrorStates = [ 'not_active', 'key_not_set', 'installed', 'option_name_not_in_whitelist' ];
const plugins = [ 'akismet', 'vaultpress' ];

export class JetpackProductInstall extends Component {
	state = {
		startedInstallation: false,
	};

	componentDidMount() {
		this.requestStatus();
		this.startInstall();
	}

	componentDidUpdate() {
		this.startInstall();
	}

	startInstall() {
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

		return some( plugins, pluginSlug => {
			if (
				! status[ pluginSlug + '_status' ] ||
				nonErrorStates.indexOf( status[ pluginSlug + '_status' ] ) < 0
			) {
				return true;
			}
			return false;
		} );
	}

	requestStatus = () => {
		this.props.requestJetpackProductInstallStatus( this.props.siteId );
	};

	render() {
		const { progressComplete, siteId } = this.props;

		return (
			<Fragment>
				<QueryPluginKeys siteId={ siteId } />

				{ progressComplete !== 100 && ! this.installationHasErrors() && (
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
