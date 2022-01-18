import { isEnabled } from '@automattic/calypso-config';
import { useI18n } from '@wordpress/react-i18n';
import page from 'page';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isAnalyzing, getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import CaptureStep from './capture';
import ListStep from './list';
import { ReadyPreviewStep, ReadyNotStep, ReadyStep, ReadyAlreadyOnWPCOMStep } from './ready';
import { GoToStep, GoToNextStep, UrlData, RecordTracksEvent, ImporterPlatform } from './types';
import { getImporterUrl, getWpComOnboardingUrl } from './util';
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
	recordTracksEvent: RecordTracksEvent;
};

const ImportOnboarding: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const {
		goToNextStep,
		stepName,
		stepSectionName,
		isAnalyzing,
		signupDependencies,
		urlData,
		recordTracksEvent,
	} = props;

	const shouldHideBackBtn = ( stepName: string ): boolean => {
		const STEPS_WITHOUT_BACK = [ 'scanning' ];
		return STEPS_WITHOUT_BACK.includes( stepName ) || isAnalyzing;
	};

	const shouldHideNextBtn = ( stepName: string ): boolean => {
		const STEPS_WITH_NEXT = [ 'capture' ];
		return ! STEPS_WITH_NEXT.includes( stepName ) || isAnalyzing;
	};

	const getStepWithQueryParamUrl = (
		stepName: string,
		stepSectionName?: string,
		flowName = 'importer',
		dependency = signupDependencies
	): string => {
		const queryParams = dependency && dependency.siteSlug ? { siteSlug: dependency.siteSlug } : {};
		return getStepUrl( flowName, stepName, stepSectionName, '', queryParams );
	};

	const goToStepWithDependencies: GoToStep = function (
		stepName,
		stepSectionName,
		flowName = 'importer',
		dependency = signupDependencies
	): void {
		page( getStepWithQueryParamUrl( stepName, stepSectionName, flowName, dependency ) );
	};

	const goToImporterPage = ( platform: ImporterPlatform ): void => {
		let importerUrl;
		if (
			( platform === 'blogger' && isEnabled( 'gutenboarding/import-from-blogger' ) ) ||
			( platform === 'medium' && isEnabled( 'gutenboarding/import-from-medium' ) ) ||
			( platform === 'squarespace' && isEnabled( 'gutenboarding/import-from-squarespace' ) ) ||
			( platform === 'wix' && isEnabled( 'gutenboarding/import-from-wix' ) ) ||
			( platform === 'wordpress' && isEnabled( 'gutenboarding/import-from-wordpress' ) )
		) {
			importerUrl = getWpComOnboardingUrl( signupDependencies.siteSlug, platform, urlData.url );
		} else {
			importerUrl = getImporterUrl( signupDependencies.siteSlug, platform, urlData.url );
		}

		importerUrl.includes( 'wp-admin' )
			? ( window.location.href = importerUrl )
			: page.redirect( importerUrl );
	};

	const getBackUrl = ( stepName: string, stepSectionName: string ) => {
		if ( stepName === 'capture' )
			return getStepWithQueryParamUrl( 'intent', undefined, 'setup-site' );
		if ( stepName === 'list' ) return getStepWithQueryParamUrl( 'capture' );
		else if ( stepName === 'ready' && ! stepSectionName ) return getStepWithQueryParamUrl( 'list' );

		return getStepWithQueryParamUrl( 'capture' );
	};

	const getForwardUrl = () => {
		return getStepWithQueryParamUrl( 'list' );
	};

	return (
		<StepWrapper
			flowName={ 'importer' }
			hideSkip={ true }
			hideBack={ shouldHideBackBtn( stepName ) }
			hideNext={ shouldHideNextBtn( stepName ) }
			nextLabelText={ __( "I don't have a site address" ) }
			allowBackFirstStep={ true }
			backUrl={ getBackUrl( stepName, stepSectionName ) }
			forwardUrl={ getForwardUrl() }
			goToNextStep={ goToNextStep }
			hideFormattedHeader={ true }
			stepName={ stepName }
			stepContent={
				<div className="import__onboarding-page">
					{ stepName === 'capture' && <CaptureStep goToStep={ goToStepWithDependencies } /> }
					{ stepName === 'list' && <ListStep goToStep={ goToStepWithDependencies } /> }

					{ stepName === 'ready' && ! stepSectionName && (
						<ReadyStep
							platform={ urlData.platform }
							goToImporterPage={ goToImporterPage }
							recordTracksEvent={ recordTracksEvent }
						/>
					) }
					{ stepName === 'ready' && stepSectionName === 'not' && (
						<ReadyNotStep
							goToStep={ goToStepWithDependencies }
							recordTracksEvent={ recordTracksEvent }
						/>
					) }
					{ stepName === 'ready' && stepSectionName === 'preview' && (
						<ReadyPreviewStep
							urlData={ urlData }
							goToImporterPage={ goToImporterPage }
							siteSlug={ signupDependencies.siteSlug }
							recordTracksEvent={ recordTracksEvent }
						/>
					) }
					{ stepName === 'ready' && stepSectionName === 'wpcom' && (
						<ReadyAlreadyOnWPCOMStep
							urlData={ urlData }
							goToStep={ goToStepWithDependencies }
							recordTracksEvent={ recordTracksEvent }
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
	{
		recordTracksEvent,
	}
);

export default connector( ImportOnboarding );
