import { localize, translate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import illustrationImg from 'calypso/assets/images/onboarding/import-1.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { analyzeUrl, resetError } from 'calypso/state/imports/url-analyzer/actions';
import { isAnalyzing, getAnalyzerError } from 'calypso/state/imports/url-analyzer/selectors';
import ScanningStep from '../scanning';
import { GoToStep, UrlData } from '../types';
import CaptureInput from './capture-input';
import type { OnInputEnter, OnInputChange } from './types';
import type { FunctionComponent } from 'react';

import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	translate: typeof translate;
	onInputEnter: OnInputEnter;
	onInputChange?: OnInputChange;
	hasError?: boolean;
	onDontHaveSiteAddressClick?: () => void;
}
const Capture: FunctionComponent< Props > = ( props ) => {
	const { translate, onInputEnter, onInputChange, onDontHaveSiteAddressClick, hasError } = props;

	return (
		<div className={ 'import-layout__center' }>
			<div className={ 'import-layout' }>
				<div className={ 'import-layout__column' }>
					<div className="import__heading">
						<FormattedHeader
							align={ 'left' }
							headerText={ translate( 'Where will you import from?' ) }
							subHeaderText={ translate(
								'After a brief scan, we’ll prompt with what we can import from your website.'
							) }
						/>
						<div className={ 'step-wrapper__header-image' }>
							<img alt="Light import" src={ illustrationImg } aria-hidden="true" />
						</div>
					</div>
				</div>
				<div className={ 'import-layout__column' }>
					<CaptureInput
						onInputEnter={ onInputEnter }
						onInputChange={ onInputChange }
						onDontHaveSiteAddressClick={ onDontHaveSiteAddressClick }
						hasError={ hasError }
					/>
				</div>
			</div>
		</div>
	);
};

const LocalizedCapture = localize( Capture );

export { LocalizedCapture as Capture };

type StepProps = ConnectedProps< typeof connector > & {
	goToStep: GoToStep;
};

const trackEventName = 'calypso_signup_step_start';
const trackEventParams = {
	flow: 'importer',
	step: 'capture',
};

const CaptureStep: React.FunctionComponent< StepProps > = ( {
	goToStep,
	analyzeUrl,
	resetError,
	isAnalyzing,
	analyzerError,
	recordTracksEvent,
} ) => {
	/**
	 ↓ Methods
	 */

	const runProcess = ( url: string ): void => {
		// Analyze the URL and when we receive the urlData, decide where to go next.
		analyzeUrl( url ).then( ( response: UrlData ) => {
			let stepSectionName = response.platform === 'unknown' ? 'not' : 'preview';

			if ( response.platform === 'wordpress' && response.platform_data?.is_wpcom ) {
				stepSectionName = 'wpcom';
			}
			goToStep( 'ready', stepSectionName );
		} );
	};

	const recordScanningEvent = () => {
		if ( ! isAnalyzing ) return;

		recordTracksEvent( trackEventName, {
			...trackEventParams,
			action: 'scanning',
		} );
	};

	const recordScanningErrorEvent = () => {
		if ( ! analyzerError ) return;

		recordTracksEvent( trackEventName, {
			...trackEventParams,
			action: 'scanning-error',
			error: JSON.stringify( analyzerError ),
		} );
	};

	const recordCaptureScreen = () => {
		recordTracksEvent( trackEventName, trackEventParams );
	};

	/**
	 ↓ Effects
	 */
	useEffect( recordScanningEvent, [ isAnalyzing ] );
	useEffect( recordScanningErrorEvent, [ analyzerError ] );
	useEffect( recordCaptureScreen, [] );

	return (
		<>
			{ ! isAnalyzing && (
				<LocalizedCapture
					onInputEnter={ runProcess }
					onDontHaveSiteAddressClick={ () => goToStep( 'list' ) }
					hasError={ !! analyzerError }
					onInputChange={ () => resetError() }
				/>
			) }
			{ isAnalyzing && <ScanningStep /> }
		</>
	);
};

const connector = connect(
	( state ) => ( {
		isAnalyzing: isAnalyzing( state ),
		analyzerError: getAnalyzerError( state ),
	} ),
	{
		analyzeUrl,
		resetError,
		recordTracksEvent,
	}
);

export default connector( CaptureStep );
