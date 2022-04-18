/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useCurrentRoute } from 'calypso/landing/stepper/hooks/use-current-route';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { Importer } from 'calypso/signup/steps/import-from/types';
import type { Step } from '../../types';
import './style.scss';

const ImporterStep: Step = function ImportStep( props ) {
	const { __ } = useI18n();
	const { navigation } = props;
	const currentRoute = useCurrentRoute();
	const importerSlug = currentRoute.split( '/' )[ 1 ];
	const importer = importerSlug && ( importerSlug.toLowerCase() as Importer );

	/**
	 ↓ Fields
	 */

	/**
	 ↓ Effects
	 */
	if ( ! importer ) {
		goToHomeStep();
		return null;
	}

	/**
	 ↓ Methods
	 */
	function goToHomeStep() {
		navigation.goToStep?.( 'import' );
	}

	/**
	 ↓ Renders
	 */
	function renderStepContent() {
		return <></>;
	}

	return (
		<>
			<DocumentHead title={ __( 'Import your site content' ) } />

			<StepContainer
				stepName={ 'importer-step' }
				hideSkip={ true }
				hideFormattedHeader={ true }
				goBack={ navigation.goBack }
				isFullLayout={ true }
				stepContent={ renderStepContent() }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default ImporterStep;
