import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import { SenseiStepContainer } from '../components/sensei-step-container';
import { Progress, SenseiStepProgress } from '../components/sensei-step-progress';
import {
	getSelectedPlugins,
	saveSelectedPurposesAsSenseiSiteSettings,
} from '../sensei-purpose/purposes';
import { useAtomicSiteChecklist } from './use-atomic-site-checklist';
import { useAtomicSitePlugins } from './use-atomic-site-plugins';
import { useSubSteps, wait } from './use-sub-steps';
import type { Step } from '../../types';

import './style.scss';

const SENSEI_PRO_PLUGIN_SLUG = 'sensei-pro';

const SenseiLaunch: Step = ( { navigation: { submit } } ) => {
	const siteId = useSite()?.ID as number;
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) as string;

	const { pollPlugins, isPluginInstalled, queuePlugin } = useAtomicSitePlugins();
	const { requestChecklist, isSenseiIncluded } = useAtomicSiteChecklist();
	const additionalPlugins = useMemo( () => getSelectedPlugins(), [] );

	const allPlugins = useMemo(
		() => [ SENSEI_PRO_PLUGIN_SLUG, ...additionalPlugins.map( ( p ) => p.slug ) ],
		[ additionalPlugins ]
	);
	const arePluginsInstalled = allPlugins.every( isPluginInstalled );

	const percentage = useSubSteps(
		[
			async function queueAdditionalPlugins() {
				additionalPlugins.forEach( queuePlugin );
				return true;
			},
			async function waitForAllPlugins() {
				pollPlugins();
				await wait( 3000 );
				return arePluginsInstalled;
			},
			async function waitForJetpackTransfer( retries ) {
				// Calling requestChecklist() below is causing Jetpack Identity Crisis (IDC) if used too early, so we wait
				// a bit to give more time jetpack sync to complete.
				await wait( 5000 );
				return retries >= 3;
			},
			async function savePurposeData() {
				await saveSelectedPurposesAsSenseiSiteSettings( siteSlug );
				return true;
			},
			async function waitForChecklist() {
				requestChecklist();
				await wait( 5000 );
				return isSenseiIncluded();
			},
			async function done() {
				setTimeout( () => submit?.(), 1000 );
				return true;
			},
		],
		{
			maxRetries: 25,
			onFail: () => submit?.(),
		}
	);

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
			<SenseiStepContainer stepName="sensei-setup" recordTracksEvent={ recordTracksEvent }>
				<SenseiStepProgress progress={ progress } />
			</SenseiStepContainer>
		</>
	);
};

export default SenseiLaunch;
