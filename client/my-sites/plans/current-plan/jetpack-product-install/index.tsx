import { localizeUrl } from '@automattic/i18n-utils';
import { JETPACK_CONTACT_SUPPORT } from '@automattic/urls';
import { localize, LocalizeProps } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { Interval, EVERY_SECOND, EVERY_FIVE_SECONDS } from 'calypso/lib/interval';
import { logToLogstash } from 'calypso/lib/logstash';
import wpcom from 'calypso/lib/wp';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	requestJetpackProductInstallStatus,
	startJetpackProductInstall,
} from 'calypso/state/jetpack-product-install/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getJetpackProductInstallProgress from 'calypso/state/selectors/get-jetpack-product-install-progress';
import getJetpackProductInstallStatus from 'calypso/state/selectors/get-jetpack-product-install-status';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type {
	JetpackProductInstallStatus,
	PluginStatusSlug,
} from 'calypso/state/selectors/get-jetpack-product-install-status';
import type { AppState, SiteId, TimeoutMS } from 'calypso/types';

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
const MAX_RETRIES = 6;

const PLUGIN_KEY_REFETCH_INTERVAL: TimeoutMS = 300;

interface KeysResponse {
	keys: Record< PluginSlug, string >;
}

type Props = ConnectedProps & ConnectedDispatchProps & LocalizeProps;

interface State {
	initiatedInstalls: Set< PluginSlug >;
	pluginKeys: Record< PluginSlug, string > | null;
}

export class JetpackProductInstall extends Component< Props, State > {
	state: State = {
		initiatedInstalls: new Set< PluginSlug >(),
		pluginKeys: null,
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

	fetchPluginKeys = (): void => {
		if ( this.shouldRequestKeys() ) {
			wpcom.req
				.get( `/jetpack-blogs/${ this.props.siteId }/keys` )
				.then( ( response: KeysResponse ) => {
					this.setState( { pluginKeys: response.keys } );
				} );
		}
	};

	/**
	 * Start the plugin installation if all conditions are matched:
	 * - Installation hasn't started yet.
	 * - We don't have any non-recoverable installation errors.
	 * - We have already fetched the plugin installation status.
	 * - Installation has not finished.
	 * - We already have the plugin keys.
	 */
	maybeStartInstall(): void {
		const { progressComplete, requestedInstalls, siteId } = this.props;
		const { pluginKeys } = this.state;

		// We need a valid siteId
		if ( ! siteId ) {
			return;
		}

		// We're already installing
		if (
			this.props.requestedInstalls.every( ( slug ) => this.state.initiatedInstalls.has( slug ) )
		) {
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

		// We need plugin keys to attempt install.
		if ( ! pluginKeys ) {
			return;
		}

		const installerPositionalArguments: PluginSlug[] = [ 'akismet', 'vaultpress' ];
		const startJetpackProductInstallArgs = installerPositionalArguments.map( ( slug ) =>
			// Installation hasn't been initiated for the plugin
			! this.state.initiatedInstalls.has( slug ) &&
			// The plugin install was requested
			requestedInstalls.includes( slug ) &&
			// A key is available for the plugin
			pluginKeys[ slug ]
				? pluginKeys[ slug ]
				: null
		);

		const [ akismetKeyIfRequestedAndPresent, vaultpressKeyIfRequestedAndPresent ] =
			startJetpackProductInstallArgs;

		// Start installation if we requested a plugin and have its key
		if ( akismetKeyIfRequestedAndPresent || vaultpressKeyIfRequestedAndPresent ) {
			this.setState( ( { initiatedInstalls } ) => {
				const next = new Set( initiatedInstalls );
				if ( akismetKeyIfRequestedAndPresent ) {
					next.add( 'akismet' );
				}
				if ( vaultpressKeyIfRequestedAndPresent ) {
					next.add( 'vaultpress' );
				}
				return { initiatedInstalls: next };
			} );
			this.props.startJetpackProductInstall(
				siteId,
				.../* We know this array will include exactly 2 items */
				( startJetpackProductInstallArgs as [ string | null, string | null ] )
			);
		}
	}

	/**
	 * Used to determine if at least one plugin is in at least one of the provided plugin states.
	 * @param  pluginStates States to check against.
	 * @returns              True if at least one plugin is in at least one of the given states, false otherwise.
	 */
	arePluginsInState( pluginStates: PluginStateDescriptor[] ): boolean {
		const { status } = this.props;

		if ( ! status ) {
			return false;
		}

		return PLUGINS.some( ( pluginSlug ) =>
			pluginStates.includes( status[ ( pluginSlug + '_status' ) as PluginStatusSlug ] )
		);
	}

	/**
	 * Used to determine if at least one plugin is in an error state.
	 * Potential errors we consider here could be recoverable or not.
	 * What we don't consider errors are the `NON_ERROR_STATES` above.
	 * @returns Whether there are currently any installation errors.
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
	 * @returns Whether there are currently any recoverable errors.
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
	 * @returns Whether to trigger a request to refetch installation status.
	 */
	shouldRefetchInstallationStatus(): boolean {
		return this.retries < MAX_RETRIES && this.installationHasRecoverableErrors();
	}

	/**
	 * A helper to refresh the page, which essentially will restart the installation process.
	 * @returns {undefined} Eslint requires this silly return tag. @TODO get rid of this.
	 */
	refreshPage = (): void => void window.location.reload();

	/**
	 * Request the current installation status.
	 * Could be triggered by a timeout as we're waiting for installation to finish,
	 * or by a retry if we discover we have a recoverable error.
	 */
	requestInstallationStatus = (): void => {
		const { requestedInstalls, siteId } = this.props;

		// We require a siteId to get install status
		if ( ! siteId ) {
			return;
		}

		// Don't do anything if we haven't requested any installs
		if ( ! requestedInstalls.length ) {
			return;
		}

		this.props.requestJetpackProductInstallStatus( siteId );

		if ( this.shouldRefetchInstallationStatus() ) {
			this.retries++;
		}
	};

	shouldRequestKeys(): boolean {
		const { siteId, requestedInstalls } = this.props;
		const { pluginKeys } = this.state;

		if ( ! siteId ) {
			return false;
		}

		if ( ! requestedInstalls.length ) {
			return false;
		}

		if ( ! pluginKeys ) {
			return true;
		}

		return requestedInstalls.some( ( slug ) => ! pluginKeys.hasOwnProperty( slug ) );
	}

	render() {
		const { progressComplete, translate } = this.props;
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
			const { status } = this.props;

			this.props.recordTracksEvent( 'calypso_plans_autoconfig_error', {
				checklist_name: 'jetpack',
				error: 'installation_error',
				location: 'JetpackChecklist',
				status_akismet: status ? status.akismet_status : '(unknown)',
				status_vaultpress: status ? status.vaultpress_status : '(unknown)',
			} );

			logToLogstash( {
				feature: 'calypso_client',
				message: 'Jetpack plugin installer error',
				...( this.props.siteId && { site_id: this.props.siteId } ),
				extra: {
					pluginStatus: this.props.status,
					knownPluginKeys: {
						// Clean plugin keys for logging
						akismet: !! this.state.pluginKeys?.akismet,
						vaultpress: !! this.state.pluginKeys?.vaultpress,
					},
				},
			} );
		}

		return (
			<>
				{ progressComplete !== 100 && (
					<Interval period={ PLUGIN_KEY_REFETCH_INTERVAL } onTick={ this.fetchPluginKeys } />
				) }
				{ hasErrorInstalling && (
					<Notice
						status="is-error"
						text={ translate( 'Oops! An error has occurred while setting up your plan.' ) }
					>
						<NoticeAction onClick={ this.refreshPage }>{ translate( 'Try again' ) }</NoticeAction>
						<NoticeAction href={ localizeUrl( JETPACK_CONTACT_SUPPORT ) } external>
							{ translate( 'Contact support' ) }
						</NoticeAction>
					</Notice>
				) }
				{ progressComplete !== 100 &&
					( ! this.installationHasErrors() || this.shouldRefetchInstallationStatus() ) && (
						<Interval period={ period } onTick={ this.requestInstallationStatus } />
					) }
			</>
		);
	}
}

interface ConnectedProps {
	siteId: SiteId | null;
	progressComplete: number | null;
	requestedInstalls: PluginSlug[];
	status: JetpackProductInstallStatus | null;
}

function mapStateToProps( state: AppState ): ConnectedProps {
	const siteId = getSelectedSiteId( state );
	const queryArgs = getCurrentQueryArguments( state );

	let installQuery: string[] = [];
	if ( queryArgs?.install ) {
		installQuery = Array.isArray( queryArgs.install ) ? queryArgs.install : [ queryArgs.install ];
	}

	const requestedInstalls: PluginSlug[] = installQuery.includes( 'all' )
		? /* If we want 'all', clone our known plugins */ [ ...PLUGINS ]
		: PLUGINS.filter( ( slug ) => installQuery.includes( slug ) );

	return {
		siteId,
		progressComplete: getJetpackProductInstallProgress( state, siteId ?? 0 ),
		requestedInstalls,
		status: getJetpackProductInstallStatus( state, siteId ?? 0 ),
	};
}

const mapDispatchToProps = {
	recordTracksEvent,
	requestJetpackProductInstallStatus,
	startJetpackProductInstall,
};

type ConnectedDispatchProps = typeof mapDispatchToProps;

export default connect( mapStateToProps, mapDispatchToProps )( localize( JetpackProductInstall ) );
