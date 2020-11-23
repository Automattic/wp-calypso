/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useI18n } from '@automattic/react-i18n';
import { Title } from '@automattic/onboarding';
import { Button, Modal, TextControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { validateImportUrl } from 'calypso/lib/importer/url-validation';
import url from 'url'; // eslint-disable-line no-restricted-imports

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';

/**
 * Style dependencies
 */
import './style.scss';

const ImportStep: React.FunctionComponent = () => {
	const { __ } = useI18n();

	const history = useHistory();
	const { resetOnboardStore, setImportUrl } = useDispatch( STORE_KEY );
	const { importUrl } = useSelect( ( select ) => select( STORE_KEY ).getState() );

	const [ validationError, setValidationError ] = useState( '' );

	const goBack = () => {
		resetOnboardStore();
		history.goBack();
	};

	const validateUrl = () => {
		setValidationError( '' );

		const siteUrl = importUrl.trim();

		if ( ! siteUrl ) {
			setValidationError( 'lol' );
			return;
		}

		const { hostname, pathname } = url.parse(
			siteUrl.startsWith( 'http' ) ? siteUrl : 'https://' + siteUrl
		);

		if ( ! hostname ) {
			setValidationError( 'lol' );
			return;
		}

		const errorMessage = validateImportUrl( siteUrl );

		if ( errorMessage ) {
			setValidationError( String( errorMessage ) );
			return;
		}

		// normalized URL
		const urlForImport = hostname + pathname;

		// @TODO: Need to call validateSiteIsImportable() with these args.
		// (return is just to avoid dealing with lint complaints about unused vars.)

		return {
			params: {
				site_url: urlForImport,
			},
			site: importUrl,
			targetSiteUrl: urlForImport,
		};
	};

	return (
		<Modal title="" className="import" onRequestClose={ goBack }>
			<div className="import__wrapper">
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
				{ validationError }
				<Button className="import__start-import" isPrimary onClick={ validateUrl }>
					{ __( 'Import site' ) }
				</Button>
			</div>
		</Modal>
	);
};

export default ImportStep;
