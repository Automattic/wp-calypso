/**
 * External dependencies
 */
import React, { ChangeEvent, FormEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import Spinner from 'calypso/components/spinner';
import CardHeading from 'calypso/components/card-heading';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormLabel from 'calypso/components/forms/form-label';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import { setInspectedLicenseKey } from 'calypso/state/jetpack-licensing/actions';

/**
 * Style dependencies
 */
import './style.scss';

const InspectLicenseForm: React.FC = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ licenseKey, setLicenseKey ] = useState( '' );
	const [ error, setError ] = useState( '' );
	const [ inProgress, setInProgress ] = useState( false );

	const submit = ( e: FormEvent< HTMLFormElement > ) => {
		e.preventDefault();

		if ( inProgress ) {
			return;
		}

		setInProgress( true );

		dispatch( setInspectedLicenseKey( licenseKey ) );
		/*dispatch( inspectLicense( domain ) );

		setTimeout( () => {
			setError( translate( 'TBD read error code' ) );
			setInProgress( false );
		}, 1000 );*/
	};

	return (
		<Card>
			<CardHeading>{ translate( 'Inspect a license' ) }</CardHeading>
			<form onSubmit={ submit }>
				<FormFieldset>
					<FormLabel required={ true } htmlFor="inspect_license_key">
						{ translate( 'License key' ) }
					</FormLabel>
					<FormTextInput
						id="inspect_license_key"
						name="license_key"
						placeholder="jetpack-backup-daily__WdeXxuAYbwwEau8maXA1cTj8I"
						isError={ !! error }
						value={ licenseKey }
						disabled={ inProgress }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) => setLicenseKey( e.target.value ) }
					/>
					{ error && <FormInputValidation isError text={ error } /> }
				</FormFieldset>
				<FormFieldset className="inspect-license-form__actions">
					<Button type="submit" disabled={ inProgress } primary>
						{ translate( 'Inspect' ) }
					</Button>
					{ inProgress && <Spinner /> }
				</FormFieldset>
			</form>
		</Card>
	);

	/*

		<>
			{ identity && <OlarkChat { ...{ identity } } /> }
			<JetpackComMasterbar />
			<div className={ classNames( 'header', iteration ) }>
				<FormattedHeader
					className="header__main-title"
					headerText={ preventWidows( title ) }
					align="center"
				/>
				{ tagline && <p>{ tagline }</p> }
			</div>
		</>
	 */
};

export default InspectLicenseForm;
