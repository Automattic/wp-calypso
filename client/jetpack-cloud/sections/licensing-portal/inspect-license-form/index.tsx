/**
 * External dependencies
 */
import React, { ChangeEvent, FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import CardHeading from 'calypso/components/card-heading';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormLabel from 'calypso/components/forms/form-label';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import { setInspectedLicenseKey } from 'calypso/state/licensing-portal/actions';
import { isInspecting as isInspectingSelector } from 'calypso/state/licensing-portal/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const InspectLicenseForm: React.FC = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isInspecting = useSelector( isInspectingSelector );
	const [ licenseKey, setLicenseKey ] = useState( '' );
	const [ authToken, setAuthToken ] = useState( '' );

	const submit = ( e: FormEvent< HTMLFormElement > ) => {
		e.preventDefault();

		if ( isInspecting ) {
			return;
		}

		dispatch( setInspectedLicenseKey( licenseKey, authToken ) );
	};

	return (
		<Card>
			<CardHeading>{ translate( 'Inspect a license' ) }</CardHeading>
			<form onSubmit={ submit }>
				<FormFieldset>
					<FormLabel required={ true } htmlFor="inspect_license_auth_token">
						{ translate( 'oAuth Token for Licensing' ) }
					</FormLabel>
					<FormTextInput
						id="inspect_license_auth_token"
						name="auth_token"
						placeholder=""
						value={ authToken }
						disabled={ isInspecting }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) => setAuthToken( e.target.value ) }
					/>
					<FormSettingExplanation>
						{ translate(
							'This is a temporary field until we get a Licensing API endpoint to fetch the token behind the scenes.'
						) }
					</FormSettingExplanation>
				</FormFieldset>

				<FormFieldset>
					<FormLabel required={ true } htmlFor="inspect_license_key">
						{ translate( 'License key' ) }
					</FormLabel>
					<FormTextInput
						id="inspect_license_key"
						name="license_key"
						placeholder="jetpack-backup-daily__WdeXxuAYbwwEau8maXA1cTj8I"
						value={ licenseKey }
						disabled={ isInspecting }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) => setLicenseKey( e.target.value ) }
					/>
				</FormFieldset>
				<FormFieldset className="inspect-license-form__actions">
					<Button type="submit" disabled={ isInspecting } primary>
						{ translate( 'Inspect' ) }
					</Button>
				</FormFieldset>
			</form>
		</Card>
	);
};

export default InspectLicenseForm;
