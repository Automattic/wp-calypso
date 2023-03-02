import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { SenseiStepContainer } from '../components/sensei-step-container';
import { Progress, SenseiStepProgress } from '../components/sensei-step-progress';
import {
	getSelectedPlugins,
	saveSelectedPurposesAsSenseiSiteSettings,
} from '../sensei-purpose/purposes';
import { useAtomicSitePlugins } from './use-atomic-site-plugins';
import { useSubSteps, wait } from './use-sub-steps';
import type { Step } from '../../types';

import './style.scss';

const SENSEI_PRO_PLUGIN_SLUG = 'sensei-pro';

const SenseiLaunch: Step = ( { navigation: { submit } } ) => {
	const siteId = useSite()?.ID as number;

	const { pollPlugins, isPluginInstalled, queuePlugin } = useAtomicSitePlugins();
	const additionalPlugins = useMemo( () => getSelectedPlugins(), [] );

	const allPlugins = useMemo(
		() => [ SENSEI_PRO_PLUGIN_SLUG, ...additionalPlugins.map( ( p ) => p.slug ) ],
		[ additionalPlugins ]
	);
	const arePluginsInstalled = allPlugins.every( isPluginInstalled );

	const percentage = useSubSteps( [
		async function queueAdditionalPlugins() {
			additionalPlugins.forEach( queuePlugin );
			return true;
		},
		async function waitForAllPlugins() {
			pollPlugins();
			await wait( 3000 );
			return arePluginsInstalled;
		},
		async function savePurposeData() {
			await saveSelectedPurposesAsSenseiSiteSettings( siteId );
			return true;
		},
		async function done() {
			setTimeout( () => submit?.(), 1000 );
			return true;
		},
	] );

	const progress: Progress = {
		percentage,
		title: __( 'Installing Sensei' ),
		subtitle: __( 'Our flexible LMS to power your online courses' ),
	};

	if ( percentage > 50 ) {
		Object.assign( progress, {
			title: __( 'Setting up your new Sensei Home' ),
			subtitle: null,
		} );
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
