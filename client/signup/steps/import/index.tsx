import { useI18n } from '@wordpress/react-i18n';
import page from 'page';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import { getUrlData, isAnalyzing } from '../../../state/imports/url-analyzer/selectors';
import CaptureStep from './capture';
import ListStep from './list';
import { ReadyPreviewStep, ReadyNotStep, ReadyStep } from './ready';
import { GoToNextStep, GoToStep, UrlData } from './types';
import { getImporterUrl } from './util';
import './style.scss';

type Props = ConnectedProps< typeof connector > & {
	goToStep: GoToStep;
	goToNextStep: GoToNextStep;
	stepName: string;
	stepSectionName: string;
	signupDependencies: {
		siteSlug: string;
	};
	urlData: UrlData;
};

const ImportOnboarding: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const {
		goToStep,
		goToNextStep,
		stepName,
		stepSectionName,
		isAnalyzing,
		signupDependencies,
		urlData,
	} = props;

	const shouldHideBackBtn = ( stepName: string ): boolean => {
		const STEPS_WITHOUT_BACK = [ 'scanning' ];
		return STEPS_WITHOUT_BACK.includes( stepName ) || isAnalyzing;
	};

	const shouldHideNextBtn = ( stepName: string ): boolean => {
		const STEPS_WITH_NEXT = [ 'capture' ];
		return ! STEPS_WITH_NEXT.includes( stepName ) || isAnalyzing;
	};

	const goToImporterPage = ( platform: string ): void => {
		const importerUrl = getImporterUrl( signupDependencies.siteSlug, platform );

		importerUrl.includes( 'wp-admin' )
			? ( window.location.href = importerUrl )
			: page.redirect( importerUrl );
	};

	return (
		<StepWrapper
			flowName={ 'importer' }
			hideSkip={ true }
			hideBack={ shouldHideBackBtn( stepName ) }
			hideNext={ shouldHideNextBtn( stepName ) }
			nextLabelText={ __( "I don't have a site address" ) }
			allowBackFirstStep={ true }
			backUrl={ stepName === 'capture' ? getStepUrl( 'setup-site', 'intent' ) : undefined }
			goToNextStep={ goToNextStep }
			hideFormattedHeader={ true }
			stepName={ stepName }
			stepContent={
				<div className="import__onboarding-page">
					{ stepName === 'capture' && <CaptureStep goToStep={ goToStep } /> }
					{ stepName === 'list' && <ListStep goToStep={ goToStep } /> }

					{ stepName === 'ready' && ! stepSectionName && (
						<ReadyStep goToImporterPage={ goToImporterPage } platform={ urlData.platform } />
					) }
					{ stepName === 'ready' && stepSectionName === 'not' && (
						<ReadyNotStep goToStep={ goToStep } />
					) }
					{ stepName === 'ready' && stepSectionName === 'preview' && (
						<ReadyPreviewStep
							urlData={ urlData }
							goToImporterPage={ goToImporterPage }
							siteSlug={ signupDependencies.siteSlug }
						/>
					) }
				</div>
			}
		/>
	);
};

const connector = connect(
	( state ) => ( {
		urlData: getUrlData( state ),
		isAnalyzing: isAnalyzing( state ),
	} ),
	{}
);

export default connector( ImportOnboarding );
