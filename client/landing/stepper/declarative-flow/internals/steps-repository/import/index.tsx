import { Step, StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React, { ReactElement, useEffect } from 'react';
import CaptureStep from 'calypso/blocks/import/capture';
import DocumentHead from 'calypso/components/data/document-head';
import { shouldUseStepContainerV2 } from 'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2';
import useMigrationConfirmation from 'calypso/landing/stepper/hooks/use-migration-confirmation';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { generateStepPath } from './helper';
import type { Step as StepType } from '../../types';
import type { ImporterPlatform } from 'calypso/lib/importer/types';
import './style.scss';

export const ImportWrapper: StepType< {
	submits: {
		platform: ImporterPlatform;
		url: string;
	};
} > = function ( props ) {
	const { __ } = useI18n();
	const { navigation, children, stepName } = props;
	const [ , setMigrationConfirmed ] = useMigrationConfirmation();

	useEffect(
		() => setMigrationConfirmed( false ),
		// setMigrationConfirmed should be a stable function,
		// since it's part of the return value of `useState` call
		// (see useMigrationConfirmation's implementation)
		[ setMigrationConfirmed ]
	);

	const isUsingStepContainerV2 = shouldUseStepContainerV2( props.flow );

	if ( isUsingStepContainerV2 ) {
		return (
			<>
				<DocumentHead title={ __( 'Import your site content' ) } />
				<Step.CenteredColumnLayout
					className="step-container-v2--import__onboarding-page"
					columnWidth={ 6 }
					topBar={
						<Step.TopBar
							backButton={ <Step.BackButton onClick={ navigation.goBack } /> }
							skipButton={
								<Step.SkipButton
									onClick={ navigation.goNext }
									label={ __( 'Skip to dashboard' ) }
								/>
							}
						/>
					}
					heading={ <Step.Heading text={ props.title } subText={ props.subTitle } /> }
				>
					{ children }
				</Step.CenteredColumnLayout>
			</>
		);
	}

	return (
		<>
			<DocumentHead title={ __( 'Import your site content' ) } />

			<StepContainer
				stepName={ stepName || 'import-step' }
				flowName="importer"
				className="import__onboarding-page"
				hideSkip
				hideFormattedHeader
				goBack={ navigation.goBack }
				goNext={ navigation.goNext }
				skipLabelText={ __( "I don't have a site address" ) }
				isFullLayout
				stepContent={ children as ReactElement }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

const ImportStep: StepType< {
	submits: {
		platform: ImporterPlatform;
		url: string;
	};
} > = function ImportStep( props ) {
	const { navigation } = props;
	const siteSlug = useSiteSlug();
	const fromUrl = useQuery().get( 'from' ) || '';

	return (
		<ImportWrapper { ...props }>
			<CaptureStep
				initialUrl={ fromUrl }
				goToStep={ ( step, section, params ) => {
					const stepPath = generateStepPath( step, section );
					const from = encodeURIComponent( params?.fromUrl || '' );
					const path = siteSlug
						? `${ stepPath }?siteSlug=${ siteSlug }&from=${ from }`
						: `${ stepPath }?from=${ from }`;

					navigation.goToStep?.( path );
				} }
			/>
		</ImportWrapper>
	);
};

export default ImportStep;
