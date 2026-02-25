import { Step } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PlaygroundIframe } from './components/playground-iframe';
import { getBlueprintLabelForTracking } from './lib/blueprint';
import { DEFAULT_PLAN_INTENT } from './lib/constants';
import type { Step as StepType } from '../../types';
import type { PlaygroundClient } from './lib/types';
import './style.scss';

export const PlaygroundStep: StepType = ( { navigation, flow } ) => {
	const { submit } = navigation;
	const playgroundClientRef = useRef< PlaygroundClient | null >( null );
	const { __ } = useI18n();
	const [ query ] = useSearchParams();
	const readyForLaunch = query.has( 'playground' );

	// For preventing double click on launch button
	const [ isLaunching, setIsLaunching ] = useState( false );

	const [ pgIntent, setPgIntent ] = useState< string >( DEFAULT_PLAN_INTENT );

	const setPlaygroundClient = ( client: PlaygroundClient ) => {
		playgroundClientRef.current = client;
	};

	const fetchIntent = () => {
		setPgIntent( DEFAULT_PLAN_INTENT ); // hardcode
		const playgroundId = query.get( 'playground' );
		if ( playgroundId ) {
			const keyName = 'playground-plans-intent-' + playgroundId;
			window.localStorage.setItem( keyName, DEFAULT_PLAN_INTENT );
			window.localStorage.setItem( keyName + '-ts', String( Math.floor( Date.now() / 1000 ) ) );
		}
	};

	const launchSite = async () => {
		if ( ! submit || isLaunching ) {
			return;
		}

		setIsLaunching( true );

		try {
			recordTracksEvent( 'calypso_playground_launch_site', {
				flow,
				step: 'playground',
				blueprint: getBlueprintLabelForTracking( query ),
				intent: pgIntent,
			} );

			submit();
		} catch ( error ) {
			setIsLaunching( false );
		}
	};

	return (
		<>
			<DocumentHead title={ __( 'Playground' ) } />
			<Step.PlaygroundLayout
				className="playground"
				topBar={
					<Step.TopBar
						rightElement={
							<Step.PrimaryButton
								onClick={ launchSite }
								onMouseEnter={ fetchIntent }
								disabled={ isLaunching || ! readyForLaunch }
							>
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
