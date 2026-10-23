import { Step } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { isPlaygroundWooIntent } from 'calypso/landing/stepper/utils/playground-woo-intent';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PlaygroundIframe } from './components/playground-iframe';
import { getBlueprintLabelForTracking } from './lib/blueprint';
import { DEFAULT_PLAN_INTENT } from './lib/constants';
import type { Step as StepType } from '../../types';
import type { PlaygroundClient } from './lib/types';
import './style.scss';

export const PlaygroundStep: StepType = ( { navigation, flow, stepName } ) => {
	const { submit } = navigation;
	const playgroundClientRef = useRef< PlaygroundClient | null >( null );
	const { __ } = useI18n();
	const [ query ] = useSearchParams();
	const readyForLaunch = query.has( 'playground' );

	// For preventing double click on launch button
	const [ isLaunching, setIsLaunching ] = useState( false );
	const [ isIntroShown, setIsIntroShown ] = useState( false );

	const isWooCommerceIntent = isPlaygroundWooIntent( flow, stepName, query.get( 'intent' ) );

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
				is_woocommerce_intent: isWooCommerceIntent,
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
					// The intro covers the top bar, so keep assistive tech out of it too.
					<div className="playground__top-bar" inert={ isIntroShown }>
						<Step.TopBar
							rightElement={
								<Step.PrimaryButton
									className={ isWooCommerceIntent ? 'playground__woo-launch-button' : undefined }
									onClick={ launchSite }
									disabled={ isLaunching || ! readyForLaunch }
								>
									{ isWooCommerceIntent ? __( 'Save my store' ) : __( 'Launch on WordPress.com' ) }
								</Step.PrimaryButton>
							}
						/>
					</div>
				}
			>
				<PlaygroundIframe
					className="playground__onboarding-iframe"
					hasPlaygroundClient={ Boolean( playgroundClientRef.current ) }
					setPlaygroundClient={ setPlaygroundClient }
					withIntro={ isWooCommerceIntent }
					onIntroChange={ setIsIntroShown }
				/>
			</Step.PlaygroundLayout>
		</>
	);
};

export default PlaygroundStep;
