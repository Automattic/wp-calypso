import { useI18n } from '@wordpress/react-i18n';
import { PlaygroundClient } from '@wp-playground/client';
import { useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useIsPlaygroundEligible } from '../../../../../../hooks/use-is-playground-eligible';
import { PlaygroundIframe } from '../playground-iframe';
import type { Step } from '../../../../types';
import './style.scss';

export const PlaygroundSetupStep: Step = () => {
	const isPlaygroundEligible = useIsPlaygroundEligible();
	if ( ! isPlaygroundEligible ) {
		window.location.assign( '/start' );
	}
	const { __ } = useI18n();
	const [ importStatus, setImportStatus ] = useState< string >( __( 'Loading Playground' ) );
	const playgroundClientRef = useRef< PlaygroundClient | null >( null );

	const shouldHideBackButton = () => {
		return true;
	};

	const shouldHideSkip = () => {
		return true;
	};

	const startImport = ( client: PlaygroundClient ) => {
		if ( ! client ) {
			setImportStatus( __( 'Import failed, please reload this page to try again.' ) );
			return;
		}
		setImportStatus( 'Preparing Playground for import' );
		setTimeout( () => {
			setImportStatus( 'Importing...' );
			setTimeout( () => {
				setImportStatus( 'Import complete' );
			}, 1000 );
		}, 1000 );
	};

	const getStepContent = () => {
		return (
			<>
				<PlaygroundIframe
					className="playground__onboarding-iframe"
					playgroundClient={ playgroundClientRef.current }
					setPlaygroundClient={ startImport }
				/>
			</>
		);
	};

	return (
		<>
			<DocumentHead title={ __( 'Playground Setup' ) } />
			<StepWrapper
				hideBack={ shouldHideBackButton() }
				hideSkip={ shouldHideSkip() }
				stepContent={ getStepContent() }
				headerText={ __( 'Setting up your site' ) }
				fallbackHeaderText={ __( 'Setting up your site' ) }
				subHeaderText={ importStatus }
				fallbackSubHeaderText={ importStatus }
			/>
		</>
	);
};

export default PlaygroundSetupStep;
