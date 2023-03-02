import { Field } from '@automattic/wpcom-checkout';
import { CheckboxControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import i18n, { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { useState, useEffect, useRef } from 'react';
import { useDispatch as useReduxDispatch } from 'react-redux';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import useVatDetails from 'calypso/me/purchases/vat-info/use-vat-details';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.css';

const countriesSupportingVat = [
	'AT',
	'BE',
	'BG',
	'CH',
	'CY',
	'CZ',
	'DE',
	'DK',
	'EE',
	'EL',
	'ES',
	'FI',
	'FR',
	'GB',
	'HR',
	'HU',
	'IE',
	'IT',
	'LT',
	'LU',
	'LV',
	'MT',
	'NL',
	'PL',
	'PT',
	'RO',
	'SE',
	'SI',
	'SK',
	'XI',
];

export function isVatSupportedFor( countryCode: string ): boolean {
	return Boolean( countriesSupportingVat.includes( countryCode ) );
}

export function VatForm( {
	section,
	isDisabled,
	countryCode,
}: {
	section: string;
	isDisabled?: boolean;

	/**
	 * This is the country code from the parent form, not necessarily from the
	 * VAT details. They may differ. See below for more details.
	 */
	countryCode: string | undefined;
} ) {
	const translate = useTranslate();
	const vatDetailsInForm = useSelect(
		( select ) => select( 'wpcom-checkout' )?.getVatDetails() ?? {}
	);
	const wpcomStoreActions = useDispatch( 'wpcom-checkout' );
	const setVatDetailsInForm = wpcomStoreActions?.setVatDetails;
	const { vatDetails: vatDetailsFromServer, isLoading: isLoadingVatDetails } = useVatDetails();
	const [ isFormActive, setIsFormActive ] = useState< boolean >( false );

	// When the form loads or the country code changes, take one of the following
	// actions.
	const previousCountryCode = useRef< string >( '' );
	useEffect( () => {
		if (
			! vatDetailsInForm ||
			! setVatDetailsInForm ||
			! countryCode ||
			isLoadingVatDetails ||
			countryCode === previousCountryCode.current
		) {
			return;
		}

		if ( ! isVatSupportedFor( previousCountryCode.current ) && isVatSupportedFor( countryCode ) ) {
			previousCountryCode.current = countryCode;
			// When the form first loads with a supported country code, pre-fill the
			// form with data from the VAT details endpoint, if any.
			//
			// The exception is the country code because that is not part of this
			// form and is instead part of the parent's form. Even though there is
			// only one field, we must store two values: one for the domain contact
			// info (used by the parent's form and passed in as `countryCode` here)
			// and one for the VAT info. This is because the VAT info sometimes needs
			// a special country code (like `XI` if the Northern Ireland checkbox is
			// checked).
			setVatDetailsInForm( {
				...vatDetailsFromServer,
				// Initialize the VAT country in this form data to match the country in
				// the parent form, which may differ from the country in the saved VAT
				// details.
				country: countryCode,
			} );
			// Pre-check the checkbox to show the form when the country is supported
			// if there are saved VAT details.
			setIsFormActive( Boolean( vatDetailsFromServer.id ) );
			return;
		}

		previousCountryCode.current = countryCode;

		if ( isVatSupportedFor( countryCode ) ) {
			// If the country code in the parent form changes from one supported VAT
			// country to another supported VAT country, set the VAT country code in
			// this form data to match the new country.
			setVatDetailsInForm( {
				...vatDetailsInForm,
				country: countryCode,
			} );
			return;
		}

		// Clear the VAT form and uncheck the checkbox when the country is not
		// supported so that the VAT details are not sent to the server.
		setVatDetailsInForm( {} );
		setIsFormActive( false );
	}, [
		countryCode,
		vatDetailsInForm,
		setVatDetailsInForm,
		vatDetailsFromServer,
		isLoadingVatDetails,
	] );

	const reduxDispatch = useReduxDispatch();

	if (
		! setVatDetailsInForm ||
		! countryCode ||
		isLoadingVatDetails ||
		! isVatSupportedFor( countryCode )
	) {
		return null;
	}

	const toggleVatForm = ( isChecked: boolean ) => {
		if ( ! isChecked ) {
			// Clear the VAT form when the checkbox is unchecked so that the VAT
			// details are not sent to the server.
			setVatDetailsInForm( {} );
		} else {
			// Pre-fill the VAT form when the checkbox is checked.
			setVatDetailsInForm( {
				...vatDetailsFromServer,
				// Initialize the VAT country to match the country in the form, which may
				// differ from the country in the saved VAT details.
				country: countryCode,
			} );
		}
		setIsFormActive( isChecked );
	};

	// Northern Ireland is technically in GB but its VAT details need to be
	// registered with the special (non-ISO) 'XI' country code.
	const toggleNorthernIreland = ( isChecked: boolean ) => {
		if ( ! isChecked ) {
			setVatDetailsInForm( {
				...vatDetailsInForm,
				country: countryCode,
			} );
		} else {
			setVatDetailsInForm( {
				...vatDetailsInForm,
				country: 'XI',
			} );
		}
	};

	const clickSupport = () => {
		reduxDispatch( recordTracksEvent( 'calypso_vat_details_support_click' ) );
	};

	let vatButtonText = translate( 'Add Business Tax ID details' );
	if (
		getLocaleSlug() !== 'en' &&
		getLocaleSlug() !== 'en-gb' &&
		! i18n.hasTranslation( 'Add Business Tax ID details' )
	) {
		vatButtonText = translate( 'Add VAT details' );
	}

	let northernIrelandText = translate( 'Is the tax ID for Northern Ireland?' );
	if (
		getLocaleSlug() !== 'en' &&
		getLocaleSlug() !== 'en-gb' &&
		! i18n.hasTranslation( 'Is the tax ID for Northern Ireland?' )
	) {
		northernIrelandText = translate( 'Is the VAT for Northern Ireland?' );
	}

	let vatOrgLabel = translate( 'Organization for tax ID' );
	if (
		getLocaleSlug() !== 'en' &&
		getLocaleSlug() !== 'en-gb' &&
		! i18n.hasTranslation( 'Organization for tax ID' )
	) {
		vatOrgLabel = translate( 'Organization for VAT' );
	}

	let vatNumberHeader = translate( 'Business Tax ID Number' );
	if (
		getLocaleSlug() !== 'en' &&
		getLocaleSlug() !== 'en-gb' &&
		! i18n.hasTranslation( 'Business Tax ID Number' )
	) {
		vatNumberHeader = translate( 'VAT Number' );
	}
	let vatAddressLabel = translate( 'Address for tax ID' );
	if (
		getLocaleSlug() !== 'en' &&
		getLocaleSlug() !== 'en-gb' &&
		! i18n.hasTranslation( 'Address for tax ID' )
	) {
		vatAddressLabel = translate( 'Address for VAT' );
	}

	let vatNumberWarning = translate(
		'To change your Business Tax ID number, {{contactSupportLink}}please contact support{{/contactSupportLink}}.',
		{
			components: {
				contactSupportLink: (
					<a target="_blank" href={ CALYPSO_CONTACT } rel="noreferrer" onClick={ clickSupport } />
				),
			},
		}
	);
	if (
		getLocaleSlug() !== 'en' &&
		getLocaleSlug() !== 'en-gb' &&
		! i18n.hasTranslation(
			'To change your Business Tax ID number, {{contactSupportLink}}please contact support{{/contactSupportLink}}.'
		)
	) {
		vatNumberWarning = translate(
			'To change your VAT number, {{contactSupportLink}}please contact support{{/contactSupportLink}}.',
			{
				components: {
					contactSupportLink: (
						<a target="_blank" href={ CALYPSO_CONTACT } rel="noreferrer" onClick={ clickSupport } />
					),
				},
			}
		);
	}

	if ( ! isFormActive ) {
		return (
			<div className="vat-form__row">
				<CheckboxControl
					className="vat-form__expand-button"
					checked={ isFormActive }
					onChange={ toggleVatForm }
					label={ vatButtonText }
					disabled={ isDisabled }
				/>
			</div>
		);
	}

	return (
		<>
			<div className="vat-form__row">
				<CheckboxControl
					className="vat-form__expand-button"
					checked={ isFormActive }
					onChange={ toggleVatForm }
					label={ vatButtonText }
					disabled={ isDisabled || Boolean( vatDetailsFromServer.id ) }
				/>
				{ countryCode === 'GB' && (
					<CheckboxControl
						className="vat-form__expand-button"
						checked={ vatDetailsInForm.country === 'XI' }
						onChange={ toggleNorthernIreland }
						label={ northernIrelandText }
						disabled={ isDisabled }
					/>
				) }
			</div>
			<div className="vat-form__row">
				<Field
					id={ section + '-vat-organization' }
					type="text"
					label={ String( vatOrgLabel ) }
					value={ vatDetailsInForm.name ?? '' }
					disabled={ isDisabled }
					onChange={ ( newValue: string ) => {
						setVatDetailsInForm( {
							...vatDetailsInForm,
							name: newValue,
						} );
					} }
				/>
				<Field
					id={ section + '-vat-id' }
					type="text"
					label={ String( vatNumberHeader ) }
					value={ vatDetailsInForm.id ?? '' }
					disabled={ isDisabled || Boolean( vatDetailsFromServer.id ) }
					onChange={ ( newValue: string ) => {
						setVatDetailsInForm( {
							...vatDetailsInForm,
							id: newValue,
						} );
					} }
				/>
			</div>
			<div className="vat-form__row vat-form__row--full-width">
				<Field
					id={ section + '-vat-address' }
					type="text"
					label={ String( vatAddressLabel ) }
					value={ vatDetailsInForm.address ?? '' }
					autoComplete="address"
					disabled={ isDisabled }
					onChange={ ( newValue: string ) => {
						setVatDetailsInForm( {
							...vatDetailsInForm,
							address: newValue,
						} );
					} }
				/>
			</div>
			{ vatDetailsFromServer.id && (
				<div>
					<FormSettingExplanation>{ vatNumberWarning }</FormSettingExplanation>
				</div>
			) }
		</>
	);
}
