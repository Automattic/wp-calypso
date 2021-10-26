import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
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
	isScanning: boolean;
	setIsScanning: ( inProgress: boolean ) => void;
}

const CaptureStep: React.FunctionComponent< Props > = ( {
	goToStep,
	isScanning,
	setIsScanning,
} ) => {
	const { __ } = useI18n();

	const [ urlValue, setUrlValue ] = React.useState( '' );
	const [ isValid, setIsValid ] = React.useState( true );

	const runProcess = (): void => {
		setIsScanning( true );

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
		setTimeout( () => {
			goToStep( 'ready', 'preview' );
		}, 3000 );
	};

	const onInputChange = ( e: ChangeEvent< HTMLInputElement > ) => {
		setUrlValue( e.target.value );
		setIsValid( validateUrl( e.target.value ) );
	};

	const onKeyDown = ( e: KeyboardEvent< HTMLInputElement > ) => {
		if ( e.key === 'Enter' ) {
			isValid && urlValue && runProcess();
		}
	};

	return (
		<>
			{ ! isScanning && (
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
						{ ! isValid && (
							<div className="capture__input-error-msg">
								{ __( 'The address you entered is not valid. Please try again.' ) }
							</div>
						) }
					</div>
				</div>
			) }

			{ isScanning && <ScanningStep /> }
		</>
	);
};

export default CaptureStep;
