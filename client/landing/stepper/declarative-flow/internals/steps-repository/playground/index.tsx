import { Step } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { PlaygroundClient } from '@wp-playground/client';
import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PlaygroundIframe } from './components/playground-iframe';
import { getBlueprintLabelForTracking } from './lib/blueprint';
import calculate_plan_intent_php_script from './lib/calculate-plan-intent-php-script';
import type { Step as StepType } from '../../types';
import './style.scss';
export const DEFAULT_PLAN_INTENT = 'plans-playground';

export const PlaygroundStep: StepType = ( { navigation, flow } ) => {
	const { submit } = navigation;
	const playgroundClientRef = useRef< PlaygroundClient | null >( null );
	const { __ } = useI18n();
	const [ query ] = useSearchParams();

	// For preventing double click on launch button
	const [ isLaunching, setIsLaunching ] = useState( false );

	// For calculating the intent, which would make launch wait for it as well
	const [ pgIntent, setPgIntent ] = useState< string | null >( DEFAULT_PLAN_INTENT );
	const [ calculatingIntent, setCalculatingIntent ] = useState( false );
	const intentPromiseRef = useRef< Promise< void > | null >( null );

	const setPlaygroundClient = ( client: PlaygroundClient ) => {
		playgroundClientRef.current = client;
	};

	const fetchIntent = () => {
		const pgc = playgroundClientRef.current;
		if ( ! pgc || calculatingIntent ) {
			return;
		}

		setCalculatingIntent( true );
		intentPromiseRef.current = pgc
			.run( {
				code: calculate_plan_intent_php_script,
			} )
			.then( ( res: { text: string } ) => {
				setPgIntent( res.text );
				const keyName = 'playground-plans-intent-' + query.get( 'playground' );
				window.localStorage.setItem( keyName, res.text || DEFAULT_PLAN_INTENT );
				window.localStorage.setItem( keyName + '-ts', String( Math.floor( Date.now() / 1000 ) ) );
			} )
			.finally( () => {
				setCalculatingIntent( false );
			} );
	};

	const launchSite = async () => {
		if ( ! submit || isLaunching ) {
			return;
		}

		setIsLaunching( true );

		try {
			// Wait for any existing intent fetch to complete
			if ( calculatingIntent && intentPromiseRef.current ) {
				await intentPromiseRef.current;
			}

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
								disabled={ isLaunching }
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
