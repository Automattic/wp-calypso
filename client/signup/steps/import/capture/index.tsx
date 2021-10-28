import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import { connect } from 'react-redux';
import { analyzeUrl } from 'calypso/state/imports/url-analyzer/actions';
import { isAnalyzing } from 'calypso/state/imports/url-analyzer/selectors';
import ScanningStep from '../scanning';
import { GoToStep } from '../types';
import './style.scss';
import type { ChangeEvent, KeyboardEvent } from 'react';

/* eslint-disable wpcalypso/jsx-classname-namespace */

const validateUrl = ( url: string ): boolean => {
	const urlRgx = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;

	return urlRgx.test( url );
};

interface Props {
	goToStep: GoToStep;
	analyzeUrl: ReturnType< Promise< any > >;
	isAnalyzing: boolean;
}

const CaptureStep: React.FunctionComponent< Props > = ( { goToStep, analyzeUrl, isAnalyzing } ) => {
	const { __ } = useI18n();

	const [ urlValue, setUrlValue ] = React.useState( '' );
	const [ isValid, setIsValid ] = React.useState( true );
	const [ showError, setShowError ] = React.useState( false );

	const runProcess = (): void => {
		analyzeUrl( urlValue ).then( () => {
			/**
			 * Temp piece of code
			 * goToStep is a function for redirecting users to
			 * the next step depending on the scanning result
			 *
			 * It can be:
			 * - goToStep( 'ready' );
			 * - goToStep( 'ready', 'not' );
			 * - goToStep( 'ready', 'preview' );
			 */
			goToStep( 'ready', 'preview' );
		} );
	};

	const onInputChange = ( e: ChangeEvent< HTMLInputElement > ) => {
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
						{ ! isValid && showError && (
							<div className="capture__input-error-msg">
								{ __( 'The address you entered is not valid. Please try again.' ) }
							</div>
						) }
					</div>
				</div>
			) }

			{ isAnalyzing && <ScanningStep /> }
		</>
	);
};

export default connect(
	( state ) => ( {
		isAnalyzing: isAnalyzing( state ),
	} ),
	{
		analyzeUrl,
	}
)( CaptureStep );
