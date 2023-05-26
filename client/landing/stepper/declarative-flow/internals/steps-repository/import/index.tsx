/* eslint-disable wpcalypso/jsx-classname-namespace */
import { isEnabled } from '@automattic/calypso-config';
import { StepContainer, IMPORT_FOCUSED_FLOW } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React, { ReactElement } from 'react';
import CaptureStep from 'calypso/blocks/import/capture';
import CaptureStepRetired from 'calypso/blocks/import/capture-retired';
import DocumentHead from 'calypso/components/data/document-head';
import { useCurrentRoute } from 'calypso/landing/stepper/hooks/use-current-route';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { BASE_ROUTE } from './config';
import { generateStepPath } from './helper';
import type { Step } from '../../types';
import './style.scss';

const isEnabledImportLight = isEnabled( 'onboarding/import-light-url-screen' );

export const ImportWrapper: Step = function ( props ) {
	const { __ } = useI18n();
	const { navigation, children, stepName, flow } = props;
	const currentRoute = useCurrentRoute();
	const source = useQuery().get( 'source' );
	const shouldHideBackBtn = source
		? false
		: currentRoute === `${ IMPORT_FOCUSED_FLOW }/${ BASE_ROUTE }`;
	const skipLabelText =
		flow === IMPORT_FOCUSED_FLOW ? __( 'Skip to dashboard' ) : __( "I don't have a site address" );

	const shouldHideSkipBtn = () => {
		switch ( flow ) {
			case IMPORT_FOCUSED_FLOW:
				return currentRoute !== `${ flow }/${ BASE_ROUTE }`;

			default:
				return currentRoute !== `${ flow }/${ BASE_ROUTE }` || isEnabledImportLight;
		}
	};

	return (
		<>
			<DocumentHead title={ __( 'Import your site content' ) } />

			<StepContainer
				stepName={ stepName || 'import-step' }
				flowName="importer"
				className="import__onboarding-page"
				hideSkip={ !! source || shouldHideSkipBtn() }
				hideBack={ shouldHideBackBtn }
				hideFormattedHeader={ true }
				goBack={ navigation.goBack }
				goNext={ navigation.goNext }
				skipLabelText={ skipLabelText }
				isFullLayout={ true }
				stepContent={ children as ReactElement }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

const ImportStep: Step = function ImportStep( props ) {
	const { navigation } = props;

	return (
		<ImportWrapper { ...props }>
			{ isEnabledImportLight ? (
				<CaptureStep
					goToStep={ ( step, section ) =>
						navigation.goToStep?.( generateStepPath( step, section ) )
					}
				/>
			) : (
				<CaptureStepRetired
					goToStep={ ( step, section ) =>
						navigation.goToStep?.( generateStepPath( step, section ) )
					}
				/>
			) }
		</ImportWrapper>
	);
};

export default ImportStep;
