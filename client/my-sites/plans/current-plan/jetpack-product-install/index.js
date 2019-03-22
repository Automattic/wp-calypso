/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { get, some } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import getJetpackProductInstallStatus from 'state/selectors/get-jetpack-product-install-status';
import Interval, { EVERY_SECOND } from 'lib/interval';
import ProgressBar from 'components/progress-bar';
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
		const { progressComplete, siteId, translate } = this.props;
		return (
			<Fragment>
				<QueryPluginKeys siteId={ siteId } />

				{ ! this.installationHasErrors() && progressComplete !== 100 && (
					<Fragment>
						<Interval period={ EVERY_SECOND } onTick={ this.requestStatus } />

						<p>
							{ translate(
								'We’ve taken the liberty of starting the first two items, since they’re key to your site’s safety: we’re configuring spam filtering and backups for you now. Once that’s done, we can work through the rest of the checklist.'
							) }
						</p>

						<ProgressBar isPulsing total={ 100 } value={ progressComplete || 0 } />

						<p>
							<a href={ /* @TODO (sirreal) fix this */ document.location.pathname }>
								{ translate( 'Skip setup. I’ll do this later.' ) }
							</a>
						</p>
					</Fragment>
				) }

				{ progressComplete === 100 && (
					<Fragment>
						<p>
							{ translate( 'We’ve finished setting up spam filtering and backups for you.' ) }
							<br />
							{ translate( "You're now ready to finish the rest of the checklist." ) }
						</p>
					</Fragment>
				) }
			</Fragment>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const status = getJetpackProductInstallStatus( state, siteId );
		const progressComplete = get( status, 'progress', null );

		return {
			siteId,
			pluginKeys: getPluginKeys( state, siteId ),
			progressComplete,
			status,
		};
	},
	{
		requestJetpackProductInstallStatus,
		startJetpackProductInstall,
	}
)( localize( JetpackProductInstall ) );
