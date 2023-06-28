import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useEffect, useMemo } from 'react';
import { ThankYouData, ThankYouSectionProps } from 'calypso/components/thank-you/types';
import { useWPCOMPlugins } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { useSelector, useDispatch } from 'calypso/state';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { pluginInstallationStateChange } from 'calypso/state/marketplace/purchase-flow/actions';
import { MARKETPLACE_ASYNC_PROCESS_STATUS } from 'calypso/state/marketplace/types';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import { getPluginsOnSite, isRequesting } from 'calypso/state/plugins/installed/selectors';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { areFetched, areFetching, getPlugins } from 'calypso/state/plugins/wporg/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { ThankYouPluginSection } from './marketplace-thank-you-plugin-section';
import MasterbarStyled from './masterbar-styled';

export default function usePluginsThankYouData( pluginSlugs: string[] ): ThankYouData {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	// texts
	const title = translate( 'Your site, more powerful than ever' );
	const subtitle = translate(
		'All set! Time to put your new plugin to work and take your site further.',
		'All set! Time to put your new plugins to work and take your site further.',
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

	const allPluginsFetched = pluginsOnSite.every( ( pluginOnSite ) => !! pluginOnSite );

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

	const goBackSection = (
		<MasterbarStyled
			onClick={ () => page( `/plugins/${ siteSlug }` ) }
			backText={ translate( 'Back to plugins' ) }
			canGoBack={ allPluginsFetched }
			showContact={ allPluginsFetched }
		/>
	);

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
			} );
		},
		[ siteId ]
	);

	const ThankYouHeaderAction = styled.div`
		padding: 20px 24px 0 24px;
		@media ( max-width: 480px ) {
			text-align: left;
		}
	`;

	const ThankYouHeaderActionButton = styled( Button )`
		border-radius: 4px;
	`;

	const thankYouHeaderAction =
		pluginsInformationList.length > 1 ? (
			<>
				<ThankYouHeaderAction>
					<ThankYouHeaderActionButton
						primary
						href={ `https://${ siteSlug }/wp-admin/plugins.php` }
						onClick={ () => {
							sendTrackEvent( 'calypso_plugin_thank_you_setup_plugins_click' );
						} }
					>
						{ translate( 'Setup the plugins' ) }
					</ThankYouHeaderActionButton>
				</ThankYouHeaderAction>
			</>
		) : null;

	// Plugins are only installed in atomic sites
	// so atomic is always needed as long as we have plugins
	const isAtomicNeeded = pluginSlugs.length > 0;

	return [
		pluginsSection,
		allPluginsFetched,
		goBackSection,
		title,
		subtitle,
		thankyouSteps,
		isAtomicNeeded,
		thankYouHeaderAction,
	];
}

type Plugin = {
	slug: string;
	fetched: boolean;
	wporg: boolean;
	icon: string;
};
