import { useCallback, useEffect, useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import React, { useMemo } from 'react';
import { useSelector, useDispatch as useRootDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	fetchSitePlugins,
	installPlugin as installPluginAction,
} from 'calypso/state/plugins/installed/actions';
import { getPlugins } from 'calypso/state/plugins/installed/selectors';
import { SenseiStepContainer } from '../components/sensei-step-container';
import { Progress, SenseiStepProgress } from '../components/sensei-step-progress';
import { getSelectedPlugins, getSelectedPurposes, Plugin } from '../sensei-purpose/purposes';
import type { Step } from '../../types';

import './style.scss';

interface InstalledPlugin {
	id: string;
	slug: string;
	active: boolean;
}

function useAtomicSitePlugins() {
	const dispatch = useRootDispatch();

	const [ pluginQueue, setPluginQueue ] = useState< Plugin[] >( [] );

	const siteId = useSite()?.ID;

	const selectSitePlugins = useCallback(
		( state ) => {
			return siteId ? getPlugins( state, [ siteId ] ) : [];
		},
		[ siteId ]
	);

	const plugins: InstalledPlugin[] = useSelector( selectSitePlugins );

	const pollPlugins = useCallback(
		() => dispatch( fetchSitePlugins( siteId ) ),
		[ dispatch, siteId ]
	);

	const isPluginInstalled = useCallback(
		( slug: string ) => plugins.find( ( plugin ) => plugin.slug === slug )?.active,
		[ plugins ]
	);

	useEffect( () => {
		if ( pluginQueue.length && plugins?.length ) {
			for ( const plugin of pluginQueue ) {
				dispatch( installPluginAction( siteId, plugin, true ) );
			}
			setPluginQueue( [] );
		}
	}, [ dispatch, plugins?.length, pluginQueue, siteId ] );

	const queuePlugin = useCallback(
		( plugin: Plugin ) => setPluginQueue( ( queue ) => [ ...queue, plugin ] ),
		[]
	);

	return { pollPlugins, isPluginInstalled, queuePlugin };
}

const SENSEI_PRO_PLUGIN_SLUG = 'woothemes-sensei';

const SenseiLaunch: Step = ( { navigation: { submit } } ) => {
	const { __ } = useI18n();
	const [ retries, setRetries ] = useState< number >( 0 );

	const expectedRetries = 15;
	const maxRetries = 40;

	const { pollPlugins, isPluginInstalled, queuePlugin } = useAtomicSitePlugins();

	const additionalPlugins = useMemo( () => getSelectedPlugins( getSelectedPurposes() ), [] );

	useEffect( () => {
		additionalPlugins.forEach( queuePlugin );
	}, [ additionalPlugins, queuePlugin ] );

	useEffect( () => {
		const intervalId = setInterval( () => {
			if ( ! [ SENSEI_PRO_PLUGIN_SLUG ].every( isPluginInstalled ) && retries < maxRetries ) {
				setRetries( retries + 1 );
				pollPlugins();
				return;
			}

			clearInterval( intervalId );
			setRetries( maxRetries );

			setTimeout( () => submit?.(), 800 );
		}, 3000 );

		return () => clearInterval( intervalId );
	}, [ retries, isPluginInstalled, submit, pollPlugins ] );

	const progress: Progress = {
		percentage: ( retries * 100 ) / expectedRetries,
		title: __( 'Installing Sensei' ),
	};

	if ( retries > expectedRetries / 2 || maxRetries === retries ) {
		progress.title = __( 'Setting up your new Sensei Home' );
	}

	// Slow down progress bar increase during the last steps.
	if ( retries > ( expectedRetries * 2 ) / 3 ) {
		const slowPercentage = 66.6 + ( retries * 15 ) / expectedRetries;
		progress.percentage = slowPercentage > 90 ? 90 : slowPercentage;
	} else if ( retries < 0 ) {
		progress.percentage = 100;
	}

	return (
		<>
			<DocumentHead title={ progress.title } />
			<SenseiStepContainer stepName="senseiSetup" recordTracksEvent={ recordTracksEvent }>
				<SenseiStepProgress progress={ progress } />
			</SenseiStepContainer>
		</>
	);
};

export default SenseiLaunch;
