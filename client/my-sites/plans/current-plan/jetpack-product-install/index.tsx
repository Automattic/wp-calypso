/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize, LocalizeProps } from 'i18n-calypso';
import { includes, some } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
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
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';

type PluginStateDescriptor = string;
type PluginSlug = 'akismet' | 'vaultpress';

/**
 * These are plugin states in the installation lifecycle we consider "non-error" states.
 */
const NON_ERROR_STATES: PluginStateDescriptor[] = [
	'not_active', // Plugin is not installed
	'option_name_not_in_whitelist', // Plugin is installed but not activated
	'key_not_set', // Plugin is installed and activated, but not configured
	'installed', // Plugin is installed, activated and configured
	'skipped', // Plugin installation is skipped as unnecessary
];

/**
 * Those errors are any of the following:
 * - Temporary, occurring if we request installation status while plugin is being set up.
 * - Permanent, occurring if there is a failure we can't fix by waiting.
 * We attempt to recover from these errors by retrying status requests.
 */
const RECOVERABLE_ERROR_STATES: PluginStateDescriptor[] = [ 'vaultpress_error' ];

/**
 * The plugins this product installer installs, activates and configures.
 */
const PLUGINS: PluginSlug[] = [ 'akismet', 'vaultpress' ];

/**
 * Maximum number of attempts to refetch installation status in the event of a recoverable error.
 */
const MAX_RETRIES = 3;

type Props = ReturnType< typeof mapStateToProps > & ConnectedDispatchProps & LocalizeProps;

interface State {
	startedInstallation: boolean;
}

export class JetpackProductInstall extends Component< Props, State > {
	state = {
		startedInstallation: false,
	};

	retries = 0;
	tracksEventSent = false;

	componentDidMount() {
		this.requestInstallationStatus();
		this.maybeStartInstall();
	}

	componentDidUpdate() {
		this.maybeStartInstall();
	}

	/**
	 * Start the plugin installation if all conditions are matched:
	 * - Installation hasn't started yet.
	 * - We don't have any non-recoverable installation errors.
	 * - We have already fetched the plugin installation status.
	 * - Installation has not finished.
	 * - We already have the plugin keys.
	 */
	maybeStartInstall(): void {
		const { pluginKeys, progressComplete, siteId } = this.props;

		// We're already installing
		if ( this.state.startedInstallation ) {
			return;
		}

		// We have non-recoverable installation errors
		if ( this.installationHasErrors() && ! this.installationHasRecoverableErrors() ) {
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

		// Installation can be started only if we have the Akismet and VaultPress keys
		if ( pluginKeys && pluginKeys.akismet && pluginKeys.vaultpress ) {
			this.setState( {
				startedInstallation: true,
			} );

			this.props.startJetpackProductInstall( siteId, pluginKeys.akismet, pluginKeys.vaultpress );
		}
	}

	/**
	 * Used to determine if at least one plugin is in at least one of the provided plugin states.
	 *
	 * @param  pluginStates States to check against.
	 * @return              True if at least one plugin is in at least one of the given states, false otherwise.
	 */
	arePluginsInState( pluginStates: PluginStateDescriptor[] ): boolean {
		const { status } = this.props;

		if ( ! status ) {
			return false;
		}

		return some( PLUGINS, pluginSlug =>
			includes( pluginStates, status[ pluginSlug + '_status' ] )
		);
	}

	/**
	 * Used to determine if at least one plugin is in an error state.
	 * Potential errors we consider here could be recoverable or not.
	 * What we don't consider errors are the `NON_ERROR_STATES` above.
	 *
	 * @return Whether there are currently any installation errors.
	 */
	installationHasErrors(): boolean {
		if ( this.installationHasRecoverableErrors() ) {
			return true;
		}

		return ! this.arePluginsInState( NON_ERROR_STATES );
	}

	/**
	 * Used to determine if at least one plugin is in an error state
	 * that we could potentially recover from by just waiting.
	 *
	 * @return Whether there are currently any recoverable errors.
	 */
	installationHasRecoverableErrors(): boolean {
		return this.arePluginsInState( RECOVERABLE_ERROR_STATES );
	}

	/**
	 * Whether we should trigger a request to fetch the installation status again.
	 * Also considered a "retry", as it is triggered when we have recoverable errors.
	 * Will be true if both conditions are matched:
	 * - We haven't retried too many times (limit is `MAX_RETRIES`).
	 * - We currently have recoverable errors.
	 *
	 * @return Whether to trigger a request to refetch installation status.
	 */
	shouldRefetchInstallationStatus(): boolean {
		return this.retries < MAX_RETRIES && this.installationHasRecoverableErrors();
	}

	/**
	 * A helper to refresh the page, which essentially will restart the installation process.
	 */
	refreshPage = (): void => void window.location.reload();

	/**
	 * Request the current installation status.
	 * Could be triggered by a timeout as we're waiting for installation to finish,
	 * or by a retry if we discover we have a recoverable error.
	 */
	requestInstallationStatus = (): void => {
		this.props.requestJetpackProductInstallStatus( this.props.siteId );

		if ( this.shouldRefetchInstallationStatus() ) {
			this.retries++;
		}
	};

	render() {
		const { progressComplete, siteId, translate } = this.props;
		/**
		 * Usually, we'll wait for 1 second before requesting a new installation status,
		 * but if we're retrying in the case of a recoverable error, we're increasing the timeout
		 * to 5 seconds, in order to allow more time for the server to complete the setup.
		 */
		const period = this.shouldRefetchInstallationStatus() ? EVERY_FIVE_SECONDS : EVERY_SECOND;

		const hasErrorInstalling =
			! this.shouldRefetchInstallationStatus() && this.installationHasRecoverableErrors();

		if ( hasErrorInstalling && ! this.tracksEventSent ) {
			this.tracksEventSent = true;
			this.props.recordTracksEvent( 'calypso_plans_autoconfig_error', {
				checklist_name: 'jetpack',
				error: 'installation_error',
				location: 'JetpackChecklist',
			} );
		}

		return (
			<Fragment>
				<QueryPluginKeys siteId={ siteId } />

				{ hasErrorInstalling && (
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
					( ! this.installationHasErrors() || this.shouldRefetchInstallationStatus() ) && (
						<Interval period={ period } onTick={ this.requestInstallationStatus } />
					) }
			</Fragment>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const queryArgs = getCurrentQueryArguments( state );

	const installQuery: string[] =
		typeof queryArgs === 'object' && 'install' in queryArgs
			? Array.isArray( queryArgs.install )
				? queryArgs.install
				: [ queryArgs.install ]
			: [];

	const requestedInstalls: PluginSlug[] = installQuery.includes( 'all' )
		? /* If we want 'all', clone our known plugins */ [ ...PLUGINS ]
		: PLUGINS.filter( slug => installQuery.includes( slug ) );

	return {
		siteId,
		pluginKeys: getPluginKeys( state, siteId ),
		progressComplete: getJetpackProductInstallProgress( state, siteId ),
		requestedInstalls,
		status: getJetpackProductInstallStatus( state, siteId ),
	};
};

interface ConnectedDispatchProps {
	recordTracksEvent: typeof recordTracksEvent;
	requestJetpackProductInstallStatus: typeof requestJetpackProductInstallStatus;
	startJetpackProductInstall: typeof startJetpackProductInstall;
}

const mapDispatchToProps: ConnectedDispatchProps = {
	recordTracksEvent,
	requestJetpackProductInstallStatus,
	startJetpackProductInstall,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( JetpackProductInstall ) );
