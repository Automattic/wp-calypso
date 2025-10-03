import { CALYPSO_CONTACT } from '@automattic/urls';
import { Field } from '@automattic/wpcom-checkout';
import { CheckboxControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useRef, useCallback } from 'react';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import useVatDetails from 'calypso/me/purchases/vat-info/use-vat-details';
import { useTaxName } from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useCountryList, { isVatSupported } from '../../hooks/use-country-list';
import { CHECKOUT_STORE } from '../../lib/wpcom-store';

import './style.scss';

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
	const countries = useCountryList();
	const translate = useTranslate();
	const vatDetailsInForm = useSelect( ( select ) => select( CHECKOUT_STORE ).getVatDetails(), [] );
	const wpcomStoreActions = useDispatch( CHECKOUT_STORE );
	const taxName = useTaxName( countryCode ?? 'GB' );
	const setVatDetailsInForm = wpcomStoreActions?.setVatDetails;
	const { vatDetails: vatDetailsFromServer, isLoading: isLoadingVatDetails } = useVatDetails();
	const [ isFormActive, setIsFormActive ] = useState< boolean >( false );

	const isVatSupportedFor = useCallback(
		( code: string ) =>
			countries
				.filter( isVatSupported )
				.some( ( country ) => country.code === code || country.tax_country_codes.includes( code ) ),
		[ countries ]
	);

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
				// details unless Northern Ireland is saved.
				country: vatDetailsFromServer.country === 'XI' ? vatDetailsFromServer.country : countryCode,
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
		isVatSupportedFor,
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

	const genericTaxName =
		/* translators: This is a generic name for taxes to use when we do not know the user's country. */
		translate( 'tax (VAT/GST/CT)' );
	const fallbackTaxName = genericTaxName;
	/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
	const addVatText = translate( 'Add %s details', {
		textOnly: true,
		args: [ taxName ?? fallbackTaxName ],
	} );

	if ( ! isFormActive ) {
		return (
			<div className="vat-form__row">
				<CheckboxControl
					className="vat-form__expand-button"
					checked={ isFormActive }
					onChange={ toggleVatForm }
					label={ addVatText }
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
					label={ addVatText }
					disabled={ isDisabled || Boolean( vatDetailsFromServer.id ) }
				/>
				{ countryCode === 'GB' && (
					<CheckboxControl
						className="vat-form__expand-button"
						checked={ vatDetailsInForm.country === 'XI' }
						onChange={ toggleNorthernIreland }
						label={
							/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
							translate( 'Is %s for Northern Ireland?', {
								textOnly: true,
								args: [ taxName ?? translate( 'VAT', { textOnly: true } ) ],
							} )
						}
						disabled={ isDisabled }
					/>
				) }
			</div>
			<div className="vat-form__row">
				<Field
					id={ section + '-vat-organization' }
					type="text"
					label={
						/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
						translate( 'Organization for %s', {
							textOnly: true,
							args: [ taxName ?? translate( 'VAT', { textOnly: true } ) ],
						} )
					}
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
					label={
						/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
						translate( '%s ID', {
							textOnly: true,
							args: [ taxName ?? translate( 'VAT', { textOnly: true } ) ],
						} )
					}
					value={ vatDetailsInForm.id ?? '' }
					disabled={ isDisabled || Boolean( vatDetailsFromServer.id ) }
					onChange={ ( newValue: string ) => {
						setVatDetailsInForm( {
							...vatDetailsInForm,
							id: newValue,
						} );
					} }
					prefix={ vatDetailsInForm?.country ? vatDetailsInForm.country : '' }
				/>
			</div>
			<div className="vat-form__row vat-form__row--full-width">
				<Field
					id={ section + '-vat-address' }
					type="text"
					label={
						/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
						translate( 'Address for %s', {
							textOnly: true,
							args: [ taxName ?? translate( 'VAT', { textOnly: true } ) ],
						} )
					}
					value={ vatDetailsInForm.address ?? '' }
					autoComplete={ `section-${ section } street-address` }
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
					<FormSettingExplanation>
						{ translate(
							/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
							'To change your %(taxName)s ID, {{contactSupportLink}}please contact support{{/contactSupportLink}}.',
							{
								args: { taxName: taxName ?? translate( 'VAT', { textOnly: true } ) },
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
