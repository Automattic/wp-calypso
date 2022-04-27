/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import { StepPath } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository';
import { useCurrentRoute } from 'calypso/landing/stepper/hooks/use-current-route';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
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
import { BASE_ROUTE } from './config';
import { generateStepPath, getFinalImporterUrl } from './helper';
import { redirect } from './util';
import type { Step } from '../../types';
import './style.scss';

export const ImportWrapper: Step = function ( props ) {
	const { __ } = useI18n();
	const { navigation, children } = props;
	const currentRoute = useCurrentRoute();
	const shouldHideSkipBtn = currentRoute !== BASE_ROUTE;

	return (
		<>
			<DocumentHead title={ __( 'Import your site content' ) } />

			<StepContainer
				stepName={ 'import-step' }
				className={ 'import__onboarding-page' }
				hideSkip={ shouldHideSkipBtn }
				hideFormattedHeader={ true }
				goBack={ navigation.goBack }
				goNext={ navigation.goNext }
				skipLabelText={ __( "I don't have a site address" ) }
				isFullLayout={ true }
				stepContent={ children as ReactElement }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

const ImportStep: Step = function ImportStep( props ) {
	const { navigation } = props;

	/**
	 ↓ Fields
	 */
	const siteSlug = useSiteSlugParam();
	const site = useSite();
	const currentRoute = useCurrentRoute();
	const isAtomicSite = !! site?.options?.is_automated_transfer;
	const urlData = useSelector( getUrlData );

	/**
	 ↓ Effects
	 */
	if ( ! urlData && currentRoute !== BASE_ROUTE && currentRoute !== 'import/list' ) {
		goToHomeStep();
		return null;
	}

	/**
	 ↓ Methods
	 */
	const goToStep: GoToStep = function ( stepName, stepSectionName ) {
		navigation.goToStep?.( generateStepPath( stepName, stepSectionName ) );
	};

	function goToHomeStep() {
		navigation.goToStep?.( BASE_ROUTE );
	}

	function goToImporterPage() {
		const url = getFinalImporterUrl(
			siteSlug as string,
			urlData.url,
			urlData.platform,
			isAtomicSite
		);

		redirect( url );
	}

	/**
	 ↓ Renders
	 */
	function renderStepContent() {
		return (
			<>
				{ currentRoute === 'import' && <CaptureStep goToStep={ goToStep } /> }
				{ currentRoute === 'import/list' && <ListStep goToStep={ goToStep } /> }

				{ currentRoute === 'import/ready' && (
					<ReadyStep
						platform={ urlData?.platform }
						goToImporterPage={ goToImporterPage }
						recordTracksEvent={ recordTracksEvent }
					/>
				) }

				{ currentRoute === 'import/ready/preview' && (
					<ReadyPreviewStep
						urlData={ urlData }
						goToImporterPage={ goToImporterPage }
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
			</>
		);
	}

	return <ImportWrapper { ...props }>{ renderStepContent() }</ImportWrapper>;
};

export default ImportStep;
