import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React, { ReactElement } from 'react';
import CaptureStep from 'calypso/blocks/import/capture';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { generateStepPath } from './helper';
import type { Step } from '../../types';
import type { ImporterPlatform } from 'calypso/lib/importer/types';
import './style.scss';

export const ImportWrapper: Step< {
	submits: {
		platform: ImporterPlatform;
		url: string;
	};
} > = function ( props ) {
	const { __ } = useI18n();
	const { navigation, children, stepName } = props;

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

const ImportStep: Step< {
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
