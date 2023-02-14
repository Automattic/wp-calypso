import { __ } from '@wordpress/i18n';
import { useEffect, useState, useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useAtomicSitePlugins } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/sensei-launch/use-atomic-site-plugins';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { SenseiStepContainer } from '../components/sensei-step-container';
import { Progress, SenseiStepProgress } from '../components/sensei-step-progress';
import { getSelectedPlugins } from '../sensei-purpose/purposes';
import type { Step } from '../../types';

import './style.scss';

const SENSEI_PRO_PLUGIN_SLUG = 'sensei-pro';

const useRetriesProgress = (
	retries: number,
	maxRetries: number,
	expectedRetries: number
): Progress => {
	const progress: Progress = {
		percentage: ( retries * 100 ) / expectedRetries,
		title: __( 'Installing Sensei' ),
		subtitle: __( 'Our flexible LMS to power your online courses' ),
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
	return progress;
};

const SenseiLaunch: Step = ( { navigation: { submit } } ) => {
	const [ retries, setRetries ] = useState< number >( 0 );
	const maxRetries = 40;
	const progress = useRetriesProgress( retries, maxRetries, 15 );

	const { pollPlugins, isPluginInstalled, queuePlugin } = useAtomicSitePlugins();
	const additionalPlugins = useMemo( () => getSelectedPlugins(), [] );

	useEffect( () => {
		additionalPlugins.forEach( queuePlugin );
	}, [ additionalPlugins, queuePlugin ] );

	const allPlugins = [ SENSEI_PRO_PLUGIN_SLUG, ...additionalPlugins.map( ( p ) => p.slug ) ];
	const arePluginsInstalled = allPlugins.every( isPluginInstalled );
	const isComplete = retries >= maxRetries || arePluginsInstalled;

	useEffect(
		function pollSitePlugins() {
			function poll() {
				pollPlugins();
				setRetries( ( retries ) => retries + 1 );
			}

			if ( retries < maxRetries ) {
				setTimeout( poll, 3000 );
			}
		},
		// Do not trigger when pollPlugins changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ retries ]
	);

	useEffect(
		function submitWhenComplete() {
			if ( isComplete ) {
				setRetries( maxRetries );
				submit?.();
			}
		},
		[ isComplete, submit ]
	);

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
