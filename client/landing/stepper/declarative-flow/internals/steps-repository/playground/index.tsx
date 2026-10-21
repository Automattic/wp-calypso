import { Step } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PlaygroundIframe } from './components/playground-iframe';
import { getBlueprintLabelForTracking } from './lib/blueprint';
import { DEFAULT_PLAN_INTENT, SESSION_KEY_PLAYGROUND_WOO_INTENT } from './lib/constants';
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

	useEffect( () => {
		if ( query.get( 'intent' ) === 'woocommerce' ) {
			sessionStorage.setItem( SESSION_KEY_PLAYGROUND_WOO_INTENT, '1' );
		}
	}, [ query ] );

	const isWooCommerceIntent =
		query.get( 'intent' ) === 'woocommerce' ||
		sessionStorage.getItem( SESSION_KEY_PLAYGROUND_WOO_INTENT ) === '1';

	const setPlaygroundClient = ( client: PlaygroundClient ) => {
		playgroundClientRef.current = client;
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
				intent: DEFAULT_PLAN_INTENT,
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
								disabled={ isLaunching || ! readyForLaunch }
							>
								{ isWooCommerceIntent
									? __( 'Launch free trial' )
									: __( 'Launch on WordPress.com' ) }
							</Step.PrimaryButton>
						}
					/>
				}
			>
				<PlaygroundIframe
					className="playground__onboarding-iframe"
					hasPlaygroundClient={ Boolean( playgroundClientRef.current ) }
					setPlaygroundClient={ setPlaygroundClient }
				/>
			</Step.PlaygroundLayout>
		</>
	);
};

export default PlaygroundStep;
