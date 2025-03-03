import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import DocumentHead from 'calypso/components/data/document-head';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useIsPlaygroundEligible } from '../../../../hooks/use-is-playground-eligible';
import type { Step } from '../../types';
import './style.scss';

export const PlaygroundStep: Step = () => {
	const isPlaygroundEligible = useIsPlaygroundEligible();

	if ( ! isPlaygroundEligible ) {
		window.location.assign( '/start' );
	}

	const { __ } = useI18n();

	const getBackLabelText = () => {
		// TODO: Implement this
		return __( 'Back' );
	};

	const shouldHideBackButton = () => {
		// TODO: Implement this
		return true;
	};

	const shouldHideSkip = () => {
		// TODO: Implement this
		return true;
	};

	// TODO: Implement this
	const renderContent = () => (
		<iframe title="Playground" src="https://playground.wordpress.net/"></iframe>
	);

	return (
		<>
			<DocumentHead title={ __( 'Playground' ) } />
			<StepContainer
				isFullLayout
				flowName="setup"
				stepName="playground"
				hideBack={ shouldHideBackButton() }
				backLabelText={ getBackLabelText() }
				hideSkip={ shouldHideSkip() }
				recordTracksEvent={ recordTracksEvent }
				stepContent={ <div className="playground__onboarding-page">{ renderContent() }</div> }
			/>
		</>
	);
};

export default PlaygroundStep;
