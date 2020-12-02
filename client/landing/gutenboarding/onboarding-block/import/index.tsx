/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useI18n } from '@automattic/react-i18n';
import { Title } from '@automattic/onboarding';
import { Button, Modal, TextControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { IMPORT_STORE } from '../../stores/import';

/**
 * Style dependencies
 */
import './style.scss';

const ImportStep: React.FunctionComponent = () => {
	const { __ } = useI18n();

	const history = useHistory();
	const { cancelImportFlow } = useDispatch( STORE_KEY );

	const { validateSiteIsImportable } = useSelect( ( select ) => select( IMPORT_STORE ) );
	const { importUrl, importableSiteError } = useSelect( ( select ) =>
		select( IMPORT_STORE ).getState()
	);
	const { setImportUrl } = useDispatch( IMPORT_STORE );

	const goBack = () => {
		cancelImportFlow();
		history.goBack();
	};

	const checkSite = ( e: React.FormEvent ) => {
		e.preventDefault();
		validateSiteIsImportable( importUrl );
	};

	return (
		<Modal title="" className="import" onRequestClose={ goBack }>
			<form className="import__wrapper" onSubmit={ checkSite }>
				<Title>{ __( 'Import your site' ) }</Title>
				<label htmlFor="import__url-input" className="import__url-label">
					{ __( 'Enter your site address (URL) below' ) }
				</label>
				<TextControl
					id="import__url-input"
					className="import__url-input"
					onChange={ setImportUrl }
					value={ importUrl }
					spellCheck={ false }
					autoComplete="off"
					placeholder={ __( 'Enter site address' ) }
					autoCorrect="off"
				/>
				{ importableSiteError?.message }
				<Button className="import__start-import" isPrimary onClick={ checkSite }>
					{ __( 'Import site' ) }
				</Button>
			</form>
		</Modal>
	);
};

export default ImportStep;
