import {
	StepContainer,
	IMPORT_FOCUSED_FLOW,
	IMPORT_HOSTED_SITE_FLOW,
} from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React, { ReactElement, useEffect } from 'react';
import CaptureStep from 'calypso/blocks/import/capture';
import DocumentHead from 'calypso/components/data/document-head';
import { useCurrentRoute } from 'calypso/landing/stepper/hooks/use-current-route';
import useMigrationConfirmation from 'calypso/landing/stepper/hooks/use-migration-confirmation';
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
			case IMPORT_HOSTED_SITE_FLOW:
				return __( 'Create a site' );

			case IMPORT_FOCUSED_FLOW:
				return __( 'Skip to dashboard' );

			default:
				return __( "I don't have a site address" );
		}
	};

	const getGoNext = () => {
		switch ( flow ) {
			case IMPORT_HOSTED_SITE_FLOW:
				return () => window.location.assign( '/setup/new-hosted-site' );

			default:
				return navigation.goNext;
		}
	};

	const shouldHideSkipBtn = () => {
		switch ( flow ) {
			case IMPORT_FOCUSED_FLOW:
			case IMPORT_HOSTED_SITE_FLOW:
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
				hideFormattedHeader={ true }
				goBack={ navigation.goBack }
				goNext={ getGoNext() }
				skipLabelText={ getSkipLabelText() }
				isFullLayout={ true }
				stepContent={ children as ReactElement }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

const ImportStep: Step = function ImportStep( props ) {
	const { navigation, flow } = props;
	const siteSlug = useSiteSlug();

	return (
		<ImportWrapper { ...props }>
			<CaptureStep
				disableImportListStep={ IMPORT_HOSTED_SITE_FLOW === flow }
				goToStep={ ( step, section, params ) => {
					const stepPath = generateStepPath( step, section );
					const from = encodeURIComponent( params?.fromUrl || '' );

					navigation.goToStep?.( `${ stepPath }?siteSlug=${ siteSlug }&from=${ from }` );
				} }
			/>
		</ImportWrapper>
	);
};

export default ImportStep;
