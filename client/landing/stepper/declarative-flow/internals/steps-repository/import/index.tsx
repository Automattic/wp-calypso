import { StepContainer, IMPORT_FOCUSED_FLOW } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React, { ReactElement, useEffect } from 'react';
import CaptureStep from 'calypso/blocks/import/capture';
import DocumentHead from 'calypso/components/data/document-head';
import { useCurrentRoute } from 'calypso/landing/stepper/hooks/use-current-route';
import useMigrationConfirmation from 'calypso/landing/stepper/hooks/use-migration-confirmation';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { BASE_ROUTE } from './config';
import { generateStepPath } from './helper';
import type { Step } from '../../types';
import './style.scss';

export const ImportWrapper: Step = function ( props ) {
	const { __ } = useI18n();
	const { navigation, children, stepName, flow } = props;
	const currentRoute = useCurrentRoute();
	const [ , setMigrationConfirmed ] = useMigrationConfirmation();
	const shouldHideBackBtn = currentRoute === `${ IMPORT_FOCUSED_FLOW }/${ BASE_ROUTE }`;

	const getSkipLabelText = () => {
		switch ( flow ) {
			case IMPORT_FOCUSED_FLOW:
				return __( 'Skip to dashboard' );

			default:
				return __( "I don't have a site address" );
		}
	};

	const shouldHideSkipBtn = () => {
		switch ( flow ) {
			case IMPORT_FOCUSED_FLOW:
				return currentRoute !== `${ flow }/${ BASE_ROUTE }`;

			default:
				return true;
		}
	};

	useEffect( () => setMigrationConfirmed( false ), [] );

	return (
		<>
			<DocumentHead title={ __( 'Import your site content' ) } />

			<StepContainer
				stepName={ stepName || 'import-step' }
				flowName="importer"
				className="import__onboarding-page"
				hideSkip={ shouldHideSkipBtn() }
				hideBack={ shouldHideBackBtn }
				hideFormattedHeader
				goBack={ navigation.goBack }
				goNext={ navigation.goNext }
				skipLabelText={ getSkipLabelText() }
				isFullLayout
				stepContent={ children as ReactElement }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

const ImportStep: Step = function ImportStep( props ) {
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
