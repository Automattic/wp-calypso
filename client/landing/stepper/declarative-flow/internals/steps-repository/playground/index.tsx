import { Step } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { PlaygroundClient } from '@wp-playground/client';
import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useIsPlaygroundEligible } from '../../../../hooks/use-is-playground-eligible';
import { PlaygroundIframe } from './components/playground-iframe';
import { getBlueprintName } from './lib/blueprint';
import type { Step as StepType } from '../../types';
import './style.scss';

export const PlaygroundStep: StepType = ( { navigation, flow } ) => {
	const { submit } = navigation;
	const isPlaygroundEligible = useIsPlaygroundEligible();
	const playgroundClientRef = useRef< PlaygroundClient | null >( null );
	const { __ } = useI18n();
	const [ query ] = useSearchParams();
	if ( ! isPlaygroundEligible ) {
		window.location.assign( '/start' );

		return;
	}

	const setPlaygroundClient = ( client: PlaygroundClient ) => {
		playgroundClientRef.current = client;
	};

	const launchSite = () => {
		if ( ! submit ) {
			return;
		}

		const blueprintName = getBlueprintName( query.get( 'blueprint' ) );

		recordTracksEvent( 'calypso_playground_launch_site', {
			flow,
			step: 'playground',
			blueprint: blueprintName ?? 'unknown',
		} );

		submit();
	};

	return (
		<>
			<DocumentHead title={ __( 'Playground' ) } />
			<Step.PlaygroundLayout
				className="playground"
				topBar={
					<Step.TopBar
						rightElement={
							<Step.PrimaryButton onClick={ launchSite }>
								{ __( 'Launch on WordPress.com' ) }
							</Step.PrimaryButton>
						}
					/>
				}
			>
				<PlaygroundIframe
					className="playground__onboarding-iframe"
					playgroundClient={ playgroundClientRef.current }
					setPlaygroundClient={ setPlaygroundClient }
				/>
			</Step.PlaygroundLayout>
		</>
	);
};

export default PlaygroundStep;
