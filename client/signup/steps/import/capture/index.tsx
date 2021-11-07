import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { analyzeUrl, resetError } from 'calypso/state/imports/url-analyzer/actions';
import { isAnalyzing, getAnalyzerError } from 'calypso/state/imports/url-analyzer/selectors';
import ScanningStep from '../scanning';
import { GoToStep, urlData } from '../types';
import './style.scss';
import type { ChangeEvent, KeyboardEvent } from 'react';

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
} ) => {
	const { __ } = useI18n();

	const [ urlValue, setUrlValue ] = React.useState( '' );
	const [ isValid, setIsValid ] = React.useState( true );
	const [ showError, setShowError ] = React.useState( false );

	const runProcess = (): void => {
		// Analyze the URL and when we receive the urlData, decide where to go next.
		analyzeUrl( urlValue ).then( ( response: urlData ) => {
			const stepSectionName = response.platform === 'unknown' ? 'not' : 'preview';
			goToStep( 'ready', stepSectionName );
		} );
	};

	const onInputChange = ( e: ChangeEvent< HTMLInputElement > ) => {
		resetError();
		setUrlValue( e.target.value );
		setIsValid( validateUrl( e.target.value ) );
	};

	const onKeyDown = ( e: KeyboardEvent< HTMLInputElement > ) => {
		if ( e.key === 'Enter' ) {
			setShowError( true );
			isValid && urlValue && runProcess();
		}
	};

	return (
		<>
			{ ! isAnalyzing && (
				<div className="import-layout__center">
					<div className="capture__content">
						<input
							className="capture__input"
							autoComplete="off"
							autoCorrect="off"
							spellCheck="false"
							placeholder={ __( 'Enter your site address' ) }
							onKeyDown={ onKeyDown }
							onChange={ onInputChange }
							value={ urlValue }
						/>
						{ ( ! isValid && showError ) ||
							( analyzerError && (
								<div className="capture__input-error-msg">
									{ __( 'The address you entered is not valid. Please try again.' ) }
								</div>
							) ) }
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
	}
);

export default connector( CaptureStep );
