import { Step, StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React, { ReactElement } from 'react';
import CaptureStep from 'calypso/blocks/import/capture';
import DocumentHead from 'calypso/components/data/document-head';
import { shouldUseStepContainerV2ImportFlow } from 'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2';
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
	accepts: {
		text?: string;
		subText?: string;
	};
} > = function ( props ) {
	const { __ } = useI18n();
	const { navigation, children, flow, stepName, text, subText } = props;
	const useContainerV2 = shouldUseStepContainerV2ImportFlow( flow ) && stepName === 'importList';
	const documentTitle = __( 'Import your site content' );
	const showHeading = text && subText;

	if ( useContainerV2 ) {
		return (
			<>
				<DocumentHead title={ documentTitle } />
				<Step.CenteredColumnLayout
					className="importv2__onboarding-page"
					columnWidth={ 4 }
					topBar={
						<Step.TopBar leftElement={ <Step.BackButton onClick={ navigation.goBack } /> } />
					}
					heading={ showHeading ? <Step.Heading text={ text } subText={ subText } /> : undefined }
				>
					{ children as ReactElement }
				</Step.CenteredColumnLayout>
			</>
		);
	}

	return (
		<>
			<DocumentHead title={ documentTitle } />

			<StepContainer
				stepName={ stepName || 'import-step' }
				flowName="importer"
				className="import__onboarding-page"
				hideFormattedHeader
				goBack={ navigation.goBack }
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
