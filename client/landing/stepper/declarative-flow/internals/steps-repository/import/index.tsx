/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from '@automattic/onboarding';
import React from 'react';
import { useSelector } from 'react-redux';
import { StepPath } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository';
import { useCurrentRoute } from 'calypso/landing/stepper/hooks/use-current-route';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CaptureStep from 'calypso/signup/steps/import/capture';
import { ReadyPreviewStep, ReadyNotStep } from 'calypso/signup/steps/import/ready';
import { GoToStep } from 'calypso/signup/types';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { removeTrailingSlash } from './utils';
import type { Step } from '../../types';

/**
 * The import step
 */
const ImportStep: Step = function ImportStep( props ) {
	const BASE_ROUTE = 'import';
	const { navigation } = props;

	const siteSlug = useSiteSlugParam();
	const currentRoute = useCurrentRoute();
	const urlData = useSelector( getUrlData );

	const goToStep: GoToStep = function ( stepName, stepSectionName ) {
		const routes = [ BASE_ROUTE, stepName, stepSectionName, undefined, undefined ];
		const stepPath = removeTrailingSlash( routes.join( '/' ) ) as StepPath;

		navigation.goToStep?.( stepPath );
	};

	return (
		<StepContainer
			stepName={ 'import-step' }
			hideSkip={ false }
			hideBack={ false }
			hideNext={ false }
			isHorizontalLayout={ false }
			stepContent={
				<div className="import__onboarding-page">
					{ currentRoute === 'import' && <CaptureStep goToStep={ goToStep } /> }

					{ currentRoute === 'import/ready/preview' && (
						<ReadyPreviewStep
							urlData={ urlData }
							goToImporterPage={ () => {
								// console.log( 'goToImporterPage' )
							} }
							siteSlug={ siteSlug as string }
							recordTracksEvent={ recordTracksEvent }
						/>
					) }

					{ currentRoute === 'import/ready/not' && (
						<ReadyNotStep goToStep={ goToStep } recordTracksEvent={ recordTracksEvent } />
					) }
				</div>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default ImportStep;
