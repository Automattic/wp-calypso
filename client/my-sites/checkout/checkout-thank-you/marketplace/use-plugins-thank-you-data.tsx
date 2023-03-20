import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ThankYouSectionProps } from 'calypso/components/thank-you/types';
import { useWPCOMPlugins } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import {
	getAutomatedTransferStatus,
	isFetchingAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/selectors';
import { pluginInstallationStateChange } from 'calypso/state/marketplace/purchase-flow/actions';
import { MARKETPLACE_ASYNC_PROCESS_STATUS } from 'calypso/state/marketplace/types';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import { getPluginsOnSite, isRequesting } from 'calypso/state/plugins/installed/selectors';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { areFetched, areFetching, getPlugins } from 'calypso/state/plugins/wporg/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { ThankYouPluginSection } from './marketplace-thank-you-plugin-section';

export function usePluginsThankYouData( pluginSlugs: string[] ): [ ThankYouSectionProps, boolean ] {
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

	// retrieve WPCom plugin data
	const wpComPluginsDataResults = useWPCOMPlugins( pluginSlugs );
	const wpComPluginsData: Array< any > = wpComPluginsDataResults.map(
		( wpComPluginData ) => wpComPluginData.data
	);
	const softwareSlugs = wpComPluginsData.map( ( wpComPluginData, i ) =>
		wpComPluginData ? wpComPluginData.software_slug || wpComPluginData.org_slug : pluginSlugs[ i ]
	);

	const isRequestingPlugins = useSelector( ( state ) => isRequesting( state, siteId ) );
	const pluginsOnSite: [] = useSelector( ( state ) =>
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
	const isFetchingTransferStatus = useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);

	const allPluginsFetched =
		!! pluginsOnSite.length && pluginsOnSite.every( ( pluginOnSite ) => !! pluginOnSite );

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

	// Site is transferring to Atomic.
	// Poll the transfer status.
	useEffect( () => {
		if (
			! siteId ||
			transferStatus === transferStates.COMPLETE ||
			isJetpackSelfHosted ||
			pluginSlugs.length === 0
		) {
			return;
		}
		if ( ! isFetchingTransferStatus ) {
			waitFor( 2 ).then( () => dispatch( fetchAutomatedTransferStatus( siteId ) ) );
		}
	}, [
		siteId,
		dispatch,
		transferStatus,
		isFetchingTransferStatus,
		isJetpackSelfHosted,
		pluginSlugs,
	] );

	// Site is already Atomic (or just transferred).
	// Poll the plugin installation status.
	useEffect( () => {
		if (
			! siteId ||
			( ! isJetpackSelfHosted && transferStatus !== transferStates.COMPLETE ) ||
			allPluginsFetched ||
			pluginSlugs.length === 0
		) {
			return;
		}

		if ( ! isRequestingPlugins ) {
			waitFor( 1 ).then( () => dispatch( fetchSitePlugins( siteId ) ) );
		}
	}, [
		isRequestingPlugins,
		dispatch,
		siteId,
		transferStatus,
		isJetpackSelfHosted,
		allPluginsFetched,
		pluginSlugs,
	] );

	const pluginsSection: ThankYouSectionProps = {
		sectionKey: 'plugin_information',
		nextSteps: pluginsInformationList.map( ( plugin: any ) => ( {
			stepKey: `plugin_information_${ plugin.slug }`,
			stepSection: <ThankYouPluginSection plugin={ plugin } />,
		} ) ),
	};

	return [ pluginsSection, allPluginsFetched ];
}

type Plugin = {
	slug: string;
	fetched: boolean;
	wporg: boolean;
	icon: string;
};
