import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo } from 'react';
import { useWPCOMPlugins } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { useInterval } from 'calypso/lib/interval';
import { useSelector, useDispatch } from 'calypso/state';
import { transferCompleteStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { pluginInstallationStateChange } from 'calypso/state/marketplace/purchase-flow/actions';
import { MARKETPLACE_ASYNC_PROCESS_STATUS } from 'calypso/state/marketplace/types';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import { getPluginsOnSite } from 'calypso/state/plugins/installed/selectors';
import { isPluginActive } from 'calypso/state/plugins/installed/selectors-ts';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { areFetched, areFetching, getPlugins } from 'calypso/state/plugins/wporg/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { ThankYouPluginSection } from './marketplace-thank-you-plugin-section';
import { THANK_YOU_RECOVERY_INTERVAL_MS } from './use-thank-you-deadline';

type ThankYouData = {
	pluginsSection: React.ReactElement[];
	allPluginsFetched: boolean;
	allPluginsActivated: boolean;
	pluginTitle: string;
	pluginSubtitle: string;
	pluginsProgressbarSteps: string[];
	isAtomicNeeded: boolean;
	thankYouHeaderAction: React.ReactElement | null;
	isLoaded: boolean;
	retry: () => void;
};

const PLUGIN_POLL_INTERVAL_MS = 3000;

export default function usePluginsThankYouData(
	pluginSlugs: string[],
	isRecoveryMode: boolean
): ThankYouData {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	// texts
	const title = translate( 'Your site, more powerful than ever' );
	const subtitle = translate(
		'All set! Time to put your new plugin to work.',
		'All set! Time to put your new plugins to work.',
		{
			count: pluginSlugs.length,
		}
	).toString();

	// retrieve WPCom plugin data
	const wpComPluginsDataResults = useWPCOMPlugins( pluginSlugs );
	const wpComPluginsData: Array< any > = wpComPluginsDataResults.map(
		( wpComPluginData ) => wpComPluginData.data
	);
	const softwareSlugs = wpComPluginsData.map( ( wpComPluginData, i ) =>
		wpComPluginData ? wpComPluginData.software_slug || wpComPluginData.org_slug : pluginSlugs[ i ]
	);

	const pluginsOnSite: Plugin[] = useSelector( ( state ) =>
		getPluginsOnSite( state, siteId, softwareSlugs )
	);
	const wporgPlugins = useSelector(
		( state ) => getPlugins( state, pluginSlugs ),
		( newPluginsValue: Array< Plugin >, oldPluginsValue: Array< Plugin > ) =>
			oldPluginsValue.length === newPluginsValue.length &&
			oldPluginsValue.every( ( oldPluginValue, i ) => {
				return (
					oldPluginValue?.slug === newPluginsValue[ i ]?.slug &&
					Boolean( oldPluginValue ) === Boolean( newPluginsValue[ i ] )
				);
			} )
	);
	const areWporgPluginsFetched: Array< boolean > = useSelector(
		( state ) => areFetched( state, pluginSlugs ),
		( newValues: Array< boolean >, oldValues: Array< boolean > ) =>
			newValues.every( ( newValue, i ) => newValue === oldValues[ i ] )
	);
	const areWporgPluginsFetching: Array< boolean > = useSelector( ( state ) =>
		areFetching( state, pluginSlugs )
	);
	const areAllWporgPluginsFetched = areWporgPluginsFetched.every( Boolean );

	const allPluginsFetched = pluginsOnSite.every( ( pluginOnSite ) => !! pluginOnSite );
	const allPluginsActivated = useSelector( ( state ) => {
		return pluginsOnSite.every( ( pluginOnSite ) => {
			return isPluginActive( state, siteId as number, pluginOnSite?.slug );
		} );
	} );

	const transferStatus = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isJetpackSelfHosted = isJetpack && ! isAtomic;

	// Consolidate the plugin information from the .org and .com sources in a single list
	const pluginsInformationList = useMemo( () => {
		return pluginsOnSite.reduce(
			( pluginsList: Array< any >, pluginOnSite: Plugin, index: number ) => {
				pluginsList.push( {
					...pluginOnSite,
					...wpComPluginsData[ index ],
					...wporgPlugins[ index ],
				} );

				return pluginsList;
			},
			[]
		);
	}, [ pluginsOnSite, wpComPluginsData, wporgPlugins ] );

	useEffect( () => {
		dispatch(
			pluginInstallationStateChange(
				MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED,
				'deauthorize plugin installation URL'
			)
		);
	}, [ dispatch ] );

	// retrieve wporg plugin data if not available
	useEffect( () => {
		if ( ! areAllWporgPluginsFetched ) {
			areWporgPluginsFetched.forEach( ( isPluginFetched, index ) => {
				const isPluginFeching = areWporgPluginsFetching[ index ];
				if ( ! isPluginFetched && ! isPluginFeching ) {
					dispatch( wporgFetchPluginData( pluginSlugs[ index ] ) );
				}
			} );
		}

		// We don't want it to run at every change of areWporgPluginsFetching,
		// we only rerun when areWporgPluginsFetched changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ areAllWporgPluginsFetched, areWporgPluginsFetched, pluginSlugs, dispatch, wporgPlugins ] );

	const isPluginPollActive =
		!! siteId &&
		pluginSlugs.length > 0 &&
		( isJetpackSelfHosted || transferCompleteStates.includes( transferStatus ) ) &&
		! ( allPluginsFetched && allPluginsActivated );

	useEffect( () => {
		if ( ! isPluginPollActive || ! siteId ) {
			return;
		}

		dispatch( fetchSitePlugins( siteId ) );
	}, [ dispatch, isPluginPollActive, siteId ] );
	let pluginPollInterval: number | null = null;
	if ( isPluginPollActive ) {
		pluginPollInterval = isRecoveryMode ? THANK_YOU_RECOVERY_INTERVAL_MS : PLUGIN_POLL_INTERVAL_MS;
	}

	useInterval( () => {
		if ( siteId ) {
			dispatch( fetchSitePlugins( siteId ) );
		}
	}, pluginPollInterval );

	const retry = useCallback( () => {
		if ( siteId && pluginSlugs.length > 0 ) {
			dispatch( fetchSitePlugins( siteId ) );
		}
	}, [ dispatch, pluginSlugs.length, siteId ] );

	const pluginsSection = pluginsInformationList.map( ( plugin: any ) => {
		return <ThankYouPluginSection plugin={ plugin } key={ `plugin_${ plugin.slug }` } />;
	} );

	const thankyouSteps = useMemo(
		() =>
			isJetpack
				? [ translate( 'Installing plugin' ) ]
				: [
						translate( 'Activating the plugin feature' ), // Transferring to Atomic
						translate( 'Setting up plugin installation' ), // Transferring to Atomic
						translate( 'Installing plugin' ), // Transferring to Atomic
						translate( 'Activating plugin' ),
				  ],
		// We intentionally don't set `isJetpack` as dependency to keep the same steps after the Atomic transfer.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ translate ]
	);

	const sendTrackEvent = useCallback(
		( name: string ) => {
			recordTracksEvent( name, {
				site_id: siteId,
				plugins: pluginSlugs.join(),
			} );
		},
		[ siteId, pluginSlugs ]
	);

	const thankYouHeaderAction =
		pluginsInformationList.length > 1 ? (
			<Button
				primary
				href={ `https://${ siteSlug }/wp-admin/plugins.php` }
				onClick={ () => {
					sendTrackEvent( 'calypso_plugin_thank_you_setup_plugins_click' );
				} }
			>
				{ translate( 'Setup the plugins' ) }
			</Button>
		) : null;

	// Plugins are only installed in atomic sites
	// so atomic is always needed as long as we have plugins
	const isAtomicNeeded = pluginSlugs.length > 0;

	return {
		pluginsSection,
		allPluginsFetched,
		allPluginsActivated,
		pluginTitle: title,
		pluginSubtitle: subtitle,
		pluginsProgressbarSteps: thankyouSteps,
		isAtomicNeeded,
		thankYouHeaderAction,
		isLoaded: true,
		retry,
	};
}

type Plugin = {
	slug: string;
	fetched: boolean;
	wporg: boolean;
	icon: string;
};
