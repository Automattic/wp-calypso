/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import getJetpackProductInstallProgress from 'state/selectors/get-jetpack-product-install-progress';
import getJetpackProductInstallStatus from 'state/selectors/get-jetpack-product-install-status';
import Interval, { EVERY_SECOND, EVERY_FIVE_SECONDS } from 'lib/interval';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import QueryPluginKeys from 'components/data/query-plugin-keys';
import { JETPACK_CONTACT_SUPPORT } from 'lib/url/support';
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
const MAX_RETRIES = 3;

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

		// We have non-recoverable installation errors
		if ( this.installationHasErrors() && ! this.installationHasRetryableErrors() ) {
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

	arePluginsInState( pluginStates ) {
		const { status } = this.props;

		if ( ! status ) {
			return false;
		}

		return some( PLUGINS, pluginSlug => {
			if ( pluginStates.indexOf( status[ pluginSlug + '_status' ] ) >= 0 ) {
				return true;
			}
			return false;
		} );
	}

	installationHasErrors() {
		if ( this.installationHasRetryableErrors() ) {
			return true;
		}

		return ! this.arePluginsInState( NON_ERROR_STATES );
	}

	installationHasRetryableErrors() {
		return this.arePluginsInState( RETRYABLE_ERROR_STATES );
	}

	installationShouldRetry() {
		return this.retries < MAX_RETRIES && this.installationHasRetryableErrors();
	}

	refreshPage = () => window.location.reload();

	requestStatus = () => {
		this.props.requestJetpackProductInstallStatus( this.props.siteId );

		if ( this.installationShouldRetry() ) {
			this.retries++;
		}
	};

	render() {
		const { progressComplete, siteId, translate } = this.props;
		const period = this.installationShouldRetry() ? EVERY_FIVE_SECONDS : EVERY_SECOND;

		return (
			<Fragment>
				<QueryPluginKeys siteId={ siteId } />

				{ ! this.installationShouldRetry() && this.installationHasRetryableErrors() && (
					<Notice
						status="is-error"
						text={ translate( 'Oops! An error has occurred while setting up your plan.' ) }
					>
						<NoticeAction onClick={ this.refreshPage }>{ translate( 'Try again' ) }</NoticeAction>
						<NoticeAction href={ JETPACK_CONTACT_SUPPORT } external>
							{ translate( 'Contact support' ) }
						</NoticeAction>
					</Notice>
				) }

				{ progressComplete !== 100 &&
					( ! this.installationHasErrors() || this.installationShouldRetry() ) && (
						<Interval period={ period } onTick={ this.requestStatus } />
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
)( localize( JetpackProductInstall ) );
