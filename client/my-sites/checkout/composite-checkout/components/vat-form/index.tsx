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
	countryCode: string | undefined;
} ) {
	const translate = useTranslate();
	const vatDetails: VatDetails = useSelect( ( select ) =>
		select( 'wpcom-checkout' ).getVatDetails()
	);
	const wpcomStoreActions = useDispatch( 'wpcom-checkout' );
	const setVatDetails = wpcomStoreActions.setVatDetails as ( vat: VatDetails ) => void;
	const { vatDetails: savedVatDetails, isLoading: isLoadingVatDetails } = useVatDetails();
	const [ isFormActive, setIsFormActive ] = useState< boolean >( false );

	// Pre-populate the fields based on the VAT details endpoint. The cached
	// contact details endpoint _does_ store organization, but does not store
	// vatId, and anyway we have a different endpoint for VAT details which is
	// what this form should use.
	const didPreFill = useRef( false );
	useEffect( () => {
		if ( isLoadingVatDetails ) {
			return;
		}
		if ( didPreFill.current ) {
			return;
		}
		didPreFill.current = true;
		setVatDetails( savedVatDetails );
		setIsFormActive( Boolean( savedVatDetails.id ) );
	}, [ setVatDetails, savedVatDetails, isLoadingVatDetails ] );

	const reduxDispatch = useReduxDispatch();

	if ( isLoadingVatDetails ) {
		return null;
	}

	const toggleVatForm = ( isChecked: boolean ) => {
		if ( ! isChecked ) {
			// Clear the VAT form when the checkbox is unchecked so that the VAT
			// details are not sent to the server.
			setVatDetails( {} );
		} else {
			// Pre-fill the VAT form when the checkbox is checked.
			setVatDetails( savedVatDetails );
		}
		setIsFormActive( isChecked );
	};

	// Northern Ireland is technically in GB but its VAT details need to be
	// registered with the special (non-ISO) 'XI' country code.
	const toggleNorthernIreland = ( isChecked: boolean ) => {
		if ( ! isChecked ) {
			setVatDetails( {
				...vatDetails,
				country: countryCode,
			} );
		} else {
			setVatDetails( {
				...vatDetails,
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
						checked={ vatDetails.country === 'XI' }
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
					value={ vatDetails.name ?? '' }
					autoComplete="organization"
					disabled={ isDisabled }
					onChange={ ( newValue: string ) => {
						setVatDetails( {
							...vatDetails,
							country: vatDetails.country || countryCode,
							name: newValue,
						} );
					} }
				/>
				<Field
					id={ section + '-vat-id' }
					type="text"
					label={ String( translate( 'VAT Number' ) ) }
					value={ vatDetails.id ?? '' }
					disabled={ isDisabled || Boolean( savedVatDetails.id ) }
					onChange={ ( newValue: string ) => {
						setVatDetails( {
							...vatDetails,
							country: vatDetails.country || countryCode,
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
