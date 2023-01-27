import { Field, VatDetails } from '@automattic/wpcom-checkout';
import { CheckboxControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
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
	'CY',
	'CZ',
	'DE',
	'DK',
	'EE',
	'EL',
	'ES',
	'FI',
	'FR',
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
	'GB',
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
	const vatDetailsInForm: VatDetails = useSelect( ( select ) =>
		select( 'wpcom-checkout' ).getVatDetails()
	);
	const wpcomStoreActions = useDispatch( 'wpcom-checkout' );
	const setVatDetailsInForm = wpcomStoreActions.setVatDetails as ( vat: VatDetails ) => void;
	const { vatDetails: savedVatDetails, isLoading: isLoadingVatDetails } = useVatDetails();
	const [ isFormActive, setIsFormActive ] = useState< boolean >( false );

	// Pre-populate the fields based on the VAT details endpoint.
	//
	// The cached contact details endpoint _does_ store organization, but does not
	// store vatId, and anyway we have a different endpoint for VAT details which
	// is what this form should use.
	//
	// The exception is the country code because that is not part of this form
	// and is instead part of the parent's form. Even though there is only one
	// field, we must store two values: one for the domain contact info and one
	// for the VAT info. This is because the VAT info sometimes needs a special
	// country code like `XI` if the Northern Ireland checkbox is checked.
	//
	// We therefore must modify the VAT version of the value to match the domain
	// contact info value any time that changes, and also modify it when the
	// Northern Ireland checkbox is checked.
	const didPreFill = useRef( false );
	useEffect( () => {
		if ( isLoadingVatDetails || ! countryCode ) {
			return;
		}
		if ( didPreFill.current ) {
			return;
		}
		didPreFill.current = true;

		setVatDetailsInForm( {
			...savedVatDetails,
			// Initialize the VAT country to match the country in the form, which may
			// differ from the country in the saved VAT details.
			country: countryCode,
		} );
		setIsFormActive( Boolean( savedVatDetails.id ) );
	}, [ setVatDetailsInForm, savedVatDetails, isLoadingVatDetails, countryCode ] );

	// Make sure that if the parent form's country code changes, we also change
	// the (hidden) VAT form country code to keep them in sync. This is a one-way
	// sync though because the Northern Ireland checkbox may change the hidden
	// VAT form country code.
	const previousCountryCode = useRef( countryCode );
	useEffect( () => {
		if ( ! countryCode || countryCode === previousCountryCode.current ) {
			return;
		}
		previousCountryCode.current = countryCode;
		setVatDetailsInForm( {
			...vatDetailsInForm,
			country: countryCode,
		} );
	}, [ countryCode, vatDetailsInForm, setVatDetailsInForm ] );

	const reduxDispatch = useReduxDispatch();

	if ( isLoadingVatDetails ) {
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
				...savedVatDetails,
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

	if ( ! isFormActive ) {
		return (
			<div className="vat-form__row">
				<CheckboxControl
					className="vat-form__expand-button"
					checked={ isFormActive }
					onChange={ toggleVatForm }
					label={ translate( 'Add VAT details' ) }
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
					label={ translate( 'Add VAT details' ) }
				/>
				{ countryCode === 'GB' && (
					<CheckboxControl
						className="vat-form__expand-button"
						checked={ vatDetailsInForm.country === 'XI' }
						onChange={ toggleNorthernIreland }
						label={ translate( 'Is the VAT for Northern Ireland?' ) }
						disabled={ isDisabled }
					/>
				) }
			</div>
			<div className="vat-form__row">
				<Field
					id={ section + '-organization' }
					type="text"
					label={ String( translate( 'Organization for VAT' ) ) }
					value={ vatDetailsInForm.name ?? '' }
					autoComplete="organization"
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
					label={ String( translate( 'VAT Number' ) ) }
					value={ vatDetailsInForm.id ?? '' }
					disabled={ isDisabled || Boolean( savedVatDetails.id ) }
					onChange={ ( newValue: string ) => {
						setVatDetailsInForm( {
							...vatDetailsInForm,
							id: newValue,
						} );
					} }
				/>
			</div>
			{ savedVatDetails.id && (
				<div>
					<FormSettingExplanation>
						{ translate(
							'To change your VAT number, {{contactSupportLink}}please contact support{{/contactSupportLink}}.',
							{
								components: {
									contactSupportLink: (
										<a
											target="_blank"
											href={ CALYPSO_CONTACT }
											rel="noreferrer"
											onClick={ clickSupport }
										/>
									),
								},
							}
						) }
					</FormSettingExplanation>
				</div>
			) }
		</>
	);
}
