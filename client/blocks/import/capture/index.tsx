import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useRef, useState } from 'react';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { triggerMigrationStartingEvent } from 'calypso/my-sites/migrate/helpers';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import ScanningStep from '../scanning';
import { GoToStep } from '../types';
import CaptureInput from './capture-input';
import type { OnInputEnter, OnInputChange } from './types';
import type { FunctionComponent } from 'react';

import './style.scss';

interface Props {
	hasError?: boolean;
	onInputEnter: OnInputEnter;
	onInputChange?: OnInputChange;
	onDontHaveSiteAddressClick?: () => void;
}
export const Capture: FunctionComponent< Props > = ( props ) => {
	const translate = useTranslate();
	const { onInputEnter, onInputChange, onDontHaveSiteAddressClick, hasError } = props;

	return (
		<>
			<div className="import__heading import__heading-center">
				<Title>{ translate( 'Where will you import from?' ) }</Title>
			</div>
			<div className="import__capture-container">
				<CaptureInput
					onInputEnter={ onInputEnter }
					onInputChange={ onInputChange }
					onDontHaveSiteAddressClick={ onDontHaveSiteAddressClick }
					hasError={ hasError }
				/>
			</div>
		</>
	);
};

type StepProps = {
	goToStep: GoToStep;
	disableImportListStep?: boolean;
};

const trackEventName = 'calypso_signup_step_start';
const trackEventParams = {
	flow: 'importer',
	step: 'capture',
};

export const CaptureStep: React.FunctionComponent< StepProps > = ( {
	goToStep,
	disableImportListStep,
} ) => {
	const currentUser = useSelector( getCurrentUser );
	const isStartingPointEventTriggeredRef = useRef( false );
	const [ url, setUrl ] = useState( '' );
	const {
		data: urlData,
		isFetching: isAnalyzing,
		error: analyzerError,
	} = useAnalyzeUrlQuery( url );

	const decideStepRedirect = () => {
		if ( ! urlData ) {
			return;
		}

		const stepName = 'ready';
		let stepSectionName;

		switch ( urlData.platform ) {
			case 'unknown':
				stepSectionName = 'not';
				break;

			case 'wordpress':
				stepSectionName = urlData.platform_data?.is_wpcom ? 'wpcom' : 'preview';
				break;

			default:
				stepSectionName = 'preview';
				break;
		}

		goToStep( stepName, stepSectionName, { fromUrl: url } );
	};

	const recordScanningEvent = () => {
		if ( ! isAnalyzing ) {
			return;
		}

		recordTracksEvent( trackEventName, {
			...trackEventParams,
			action: 'scanning',
		} );
	};

	const recordScanningErrorEvent = () => {
		if ( ! analyzerError ) {
			return;
		}

		recordTracksEvent( trackEventName, {
			...trackEventParams,
			action: 'scanning-error',
			error: JSON.stringify( analyzerError ),
		} );
	};

	const recordCaptureScreen = () => {
		recordTracksEvent( trackEventName, trackEventParams );
	};

	const recordMigrationStartingPointEvent = () => {
		if ( currentUser && currentUser.ID && ! isStartingPointEventTriggeredRef.current ) {
			isStartingPointEventTriggeredRef.current = true;
			triggerMigrationStartingEvent( currentUser );
		}
	};

	const onDontHaveSiteAddressClick = disableImportListStep ? undefined : () => goToStep( 'list' );

	/**
	 ↓ Effects
	 */
	useEffect( recordScanningEvent, [ isAnalyzing ] );
	useEffect( recordScanningErrorEvent, [ analyzerError ] );
	useEffect( recordMigrationStartingPointEvent, [ currentUser ] );
	useEffect( recordCaptureScreen, [] );
	useEffect( () => decideStepRedirect(), [ urlData ] );

	return (
		<>
			{ ! isAnalyzing && (
				<Capture
					onInputEnter={ setUrl }
					onDontHaveSiteAddressClick={ onDontHaveSiteAddressClick }
					hasError={ !! analyzerError }
					onInputChange={ () => {
						// resets the error when the user starts typing again
						setUrl( '' );
					} }
				/>
			) }
			{ isAnalyzing && <ScanningStep /> }
		</>
	);
};

export default CaptureStep;
