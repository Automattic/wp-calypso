import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { PlaygroundClient } from '@wp-playground/client';
import { useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useIsPlaygroundEligible } from '../../../../hooks/use-is-playground-eligible';
import { PlaygroundIframe } from './components/playground-iframe';
import type { Step } from '../../types';
import './style.scss';

export const PlaygroundStep: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const isPlaygroundEligible = useIsPlaygroundEligible();
	if ( ! isPlaygroundEligible ) {
		window.location.assign( '/start' );
	}
	const playgroundClientRef = useRef< PlaygroundClient | null >( null );
	const { __ } = useI18n();

	const shouldHideBackButton = () => {
		return true;
	};

	const shouldHideSkip = () => {
		return true;
	};

	const setPlaygroundClient = ( client: PlaygroundClient ) => {
		playgroundClientRef.current = client;
	};

	const launchSite = () => {
		if ( ! submit ) {
			return;
		}
		submit();
	};

	return (
		<>
			<DocumentHead title={ __( 'Playground' ) } />
			<StepWrapper
				hideBack={ shouldHideBackButton() }
				hideSkip={ shouldHideSkip() }
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
