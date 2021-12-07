import { NextButton } from '@automattic/onboarding';
import { Icon, chevronRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { analyzeUrl, resetError } from 'calypso/state/imports/url-analyzer/actions';
import { isAnalyzing, getAnalyzerError } from 'calypso/state/imports/url-analyzer/selectors';
import ScanningStep from '../scanning';
import { GoToStep, UrlData } from '../types';
import './style.scss';
import type { ChangeEvent, FormEvent } from 'react';

/* eslint-disable wpcalypso/jsx-classname-namespace */

const validateUrl = ( url: string ): boolean => {
	const urlRgx = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;

	return urlRgx.test( url );
};

type Props = ConnectedProps< typeof connector > & {
	goToStep: GoToStep;
};

const CaptureStep: React.FunctionComponent< Props > = ( {
	goToStep,
	analyzeUrl,
	resetError,
	isAnalyzing,
	analyzerError,
	recordTracksEvent,
} ) => {
	const { __ } = useI18n();

	/**
	 ↓ Fields
	 */
	const [ urlValue, setUrlValue ] = React.useState( '' );
	const [ isValid, setIsValid ] = React.useState( true );
	const [ showError, setShowError ] = React.useState( false );
	const showSubmitButton = isValid && urlValue && ! analyzerError;

	/**
	 ↓ Methods
	 */
	const runProcess = (): void => {
		// Analyze the URL and when we receive the urlData, decide where to go next.
		analyzeUrl( urlValue ).then( ( response: UrlData ) => {
			let stepSectionName = response.platform === 'unknown' ? 'not' : 'preview';

			if ( response.platform === 'wordpress' && response.platform_data?.is_wpcom ) {
				stepSectionName = 'wpcom';
			}
			goToStep( 'ready', stepSectionName );
		} );
	};

	const recordScanningEvent = () => {
		if ( ! isAnalyzing ) return;

		recordTracksEvent( 'calypso_signup_step_start', {
			flow: 'importer',
			step: 'capture',
			action: 'scanning',
		} );
	};

	const recordScanningErrorEvent = () => {
		if ( ! analyzerError ) return;

		recordTracksEvent( 'calypso_signup_step_start', {
			flow: 'importer',
			step: 'capture',
			action: 'scanning-error',
			error: analyzerError,
		} );
	};

	const onInputChange = ( e: ChangeEvent< HTMLInputElement > ) => {
		resetError();
		setUrlValue( e.target.value );
		setIsValid( validateUrl( e.target.value ) );
	};

	const onFormSubmit = ( e: FormEvent< HTMLFormElement > ) => {
		e.preventDefault();

		setShowError( true );
		isValid && urlValue && runProcess();
	};

	/**
	 ↓ Effects
	 */
	useEffect( recordScanningEvent, [ isAnalyzing ] );
	useEffect( recordScanningErrorEvent, [ analyzerError ] );

	return (
		<>
			{ ! isAnalyzing && (
				<div className="import-layout__center">
					<div className="capture__content">
						<form
							className={ classnames( 'capture__input-wrapper', {
								'capture__input-wrapper-padding': showSubmitButton,
							} ) }
							onSubmit={ onFormSubmit.bind( this ) }
						>
							<input
								className="capture__input"
								// eslint-disable-next-line jsx-a11y/no-autofocus
								autoFocus
								autoComplete="off"
								autoCorrect="off"
								spellCheck="false"
								placeholder={ __( 'Enter your site address' ) }
								onChange={ onInputChange }
								value={ urlValue }
							/>
							{ showSubmitButton && (
								<NextButton type={ 'submit' }>
									<Icon icon={ chevronRight } />
								</NextButton>
							) }
							{ ( ! isValid && showError ) ||
								( analyzerError && (
									<div className="capture__input-error-msg">
										{ __( 'The address you entered is not valid. Please try again.' ) }
									</div>
								) ) }
						</form>
					</div>
				</div>
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
