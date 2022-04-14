/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import { useSelector } from 'react-redux';
import { StepPath } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository';
import { useCurrentRoute } from 'calypso/landing/stepper/hooks/use-current-route';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CaptureStep from 'calypso/signup/steps/import/capture';
import ListStep from 'calypso/signup/steps/import/list';
import {
	ReadyStep,
	ReadyNotStep,
	ReadyPreviewStep,
	ReadyAlreadyOnWPCOMStep,
} from 'calypso/signup/steps/import/ready';
import { GoToStep } from 'calypso/signup/types';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { removeTrailingSlash } from './utils';
import type { Step } from '../../types';

/**
 * The import step
 */
const ImportStep: Step = function ImportStep( props ) {
	const { __ } = useI18n();
	const BASE_ROUTE = 'import';
	const { navigation } = props;

	/**
	 * ↓ Fields
	 */
	const siteSlug = useSiteSlugParam();
	const currentRoute = useCurrentRoute();
	const urlData = useSelector( getUrlData );

	/**
	 * ↓ Effects
	 */
	if ( ! urlData && currentRoute !== 'import' && currentRoute !== 'import/list' ) {
		goToHomeStep();
		return null;
	}

	/**
	 * ↓ Methods
	 */
	const goToStep: GoToStep = function ( stepName, stepSectionName ) {
		const routes = [ BASE_ROUTE, stepName, stepSectionName ];
		const stepPath = ( '/' + removeTrailingSlash( routes.join( '/' ) ) ) as StepPath;

		navigation.goToStep?.( stepPath );
	};

	function goToHomeStep() {
		navigation.goToStep?.( `/${ BASE_ROUTE }` as StepPath );
	}

	function shouldHideNext() {
		switch ( currentRoute ) {
			case 'import':
				return false;

			default:
				return true;
		}
	}

	/**
	 * Renders
	 */
	return (
		<StepContainer
			stepName={ 'import-step' }
			hideSkip={ true }
			hideBack={ false }
			hideNext={ shouldHideNext() }
			goBack={ navigation.goBack }
			goNext={ navigation.goNext }
			nextLabelText={ __( "I don't have a site address" ) }
			isHorizontalLayout={ false }
			stepContent={
				<div className="import__onboarding-page">
					{ currentRoute === 'import' && <CaptureStep goToStep={ goToStep } /> }
					{ currentRoute === 'import/list' && <ListStep goToStep={ goToStep } /> }

					{ currentRoute === 'import/ready' && (
						<ReadyStep
							platform={ urlData?.platform }
							goToImporterPage={ () => {
								// console.log( 'gotToImporterPage' );
							} }
							recordTracksEvent={ recordTracksEvent }
						/>
					) }

					{ currentRoute === 'import/ready/preview' && (
						<ReadyPreviewStep
							urlData={ urlData }
							goToImporterPage={ () => {
								// console.log( 'goToImporterPage' );
							} }
							siteSlug={ siteSlug as string }
							recordTracksEvent={ recordTracksEvent }
						/>
					) }

					{ currentRoute === 'import/ready/not' && (
						<ReadyNotStep goToStep={ goToStep } recordTracksEvent={ recordTracksEvent } />
					) }

					{ currentRoute === 'import/ready/wpcom' && (
						<ReadyAlreadyOnWPCOMStep
							urlData={ urlData }
							goToStep={ goToStep }
							recordTracksEvent={ recordTracksEvent }
						/>
					) }
				</div>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default ImportStep;
