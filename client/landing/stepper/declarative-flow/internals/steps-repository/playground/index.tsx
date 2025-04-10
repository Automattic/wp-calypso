import { Step } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { PlaygroundClient } from '@wp-playground/client';
import { useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useIsPlaygroundEligible } from '../../../../hooks/use-is-playground-eligible';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import { PlaygroundIframe } from './components/playground-iframe';
import type { Step as StepType } from '../../types';
import './style.scss';

export const PlaygroundStep: StepType = ( { navigation, flow } ) => {
	const { submit } = navigation;
	const isPlaygroundEligible = useIsPlaygroundEligible();
	const playgroundClientRef = useRef< PlaygroundClient | null >( null );
	const { __ } = useI18n();

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
		submit();
	};

	if ( shouldUseStepContainerV2( flow ) ) {
		return (
			<>
				<DocumentHead title={ __( 'Playground' ) } />
				<Step.PlaygroundLayout
					className="playground-v2"
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
	}

	return (
		<>
			<DocumentHead title={ __( 'Playground' ) } />
			<StepWrapper
				hideBack
				hideSkip
				hideFormattedHeader
				customizedActionButtons={
					<Button
						variant="primary"
						className="step-wrapper__navigation-link forward"
						onClick={ launchSite }
					>
						{ __( 'Launch on WordPress.com' ) }
					</Button>
				}
				stepContent={
					<div className="playground__onboarding-page">
						<PlaygroundIframe
							className="playground__onboarding-iframe"
							playgroundClient={ playgroundClientRef.current }
							setPlaygroundClient={ setPlaygroundClient }
						/>
					</div>
				}
			/>
		</>
	);
};

export default PlaygroundStep;
