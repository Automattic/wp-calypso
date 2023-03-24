import { CompactCard, Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import useCountryList from 'calypso/my-sites/checkout/composite-checkout/hooks/use-country-list';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice, removeNotice } from 'calypso/state/notices/actions';
import useVatDetails from './use-vat-details';
import type { UpdateError, FetchError } from './use-vat-details';
import type { VatDetails } from '@automattic/wpcom-checkout';

import './style.scss';

export default function VatInfoPage() {
	const translate = useTranslate();
	const { isLoading, fetchError } = useVatDetails();

	useRecordVatEvents( { fetchError } );

	if ( fetchError ) {
		return (
			<div className="vat-info">
				<CompactCard>
					{ translate( 'An error occurred while fetching Business Tax ID details.' ) }
				</CompactCard>
			</div>
		);
	}

	return (
		<Layout className={ isLoading ? 'vat-info is-loading' : 'vat-info' }>
			<Column type="main">
				<CompactCard className="vat-info__form">
					{ isLoading && <LoadingPlaceholder /> }
					{ ! isLoading && <VatForm /> }
				</CompactCard>
			</Column>
			<Column type="sidebar">
				<Card className="vat-info__sidebar-card">
					<CardHeading tagName="h1" size={ 16 } isBold={ true } className="vat-info__sidebar-title">
						{ translate( 'Business Tax ID details' ) }
					</CardHeading>
					<p className="vat-info__sidebar-paragraph">
						{ translate(
							"We currently only provide Business Tax ID invoices to users who are properly registered. Business Tax ID information saved on this page will be applied to all of your account's receipts."
						) }
					</p>
				</Card>
			</Column>
		</Layout>
	);
}

function VatForm() {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const [ currentVatDetails, setCurrentVatDetails ] = useState< VatDetails >( {} );
	const { vatDetails, isUpdating, isUpdateSuccessful, setVatDetails, updateError } =
		useVatDetails();

	const saveDetails = () => {
		reduxDispatch( recordTracksEvent( 'calypso_vat_details_update' ) );
		setVatDetails( { ...vatDetails, ...currentVatDetails } );
	};

	useDisplayVatNotices( { error: updateError, success: isUpdateSuccessful } );
	useRecordVatEvents( { updateError, isUpdateSuccessful } );

	const clickSupport = () => {
		reduxDispatch( recordTracksEvent( 'calypso_vat_details_support_click' ) );
	};

	const isVatAlreadySet = !! vatDetails.id;

	return (
		<>
			<FormFieldset className="vat-info__country-field">
				<FormLabel htmlFor="country">{ translate( 'Country' ) }</FormLabel>
				<CountryCodeInput
					name="country"
					disabled={ isUpdating || isVatAlreadySet }
					value={ currentVatDetails.country ?? vatDetails.country ?? '' }
					onChange={ ( event: React.ChangeEvent< HTMLSelectElement > ) =>
						setCurrentVatDetails( { ...currentVatDetails, country: event.target.value } )
					}
				/>
			</FormFieldset>
			<FormFieldset className="vat-info__vat-field">
				<FormLabel htmlFor="vat">{ translate( 'Business Tax ID Number' ) }</FormLabel>
				<FormTextInput
					name="vat"
					disabled={ isUpdating || isVatAlreadySet }
					value={ currentVatDetails.id ?? vatDetails.id ?? '' }
					onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
						setCurrentVatDetails( { ...currentVatDetails, id: event.target.value } )
					}
				/>
				{ isVatAlreadySet && (
					<FormSettingExplanation>
						{ translate(
							'To change your Business Tax ID number, {{contactSupportLink}}please contact support{{/contactSupportLink}}.',
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
				) }
			</FormFieldset>
			<FormFieldset className="vat-info__name-field">
				<FormLabel htmlFor="name">{ translate( 'Name' ) }</FormLabel>
				<FormTextInput
					name="name"
					disabled={ isUpdating }
					value={ currentVatDetails.name ?? vatDetails.name ?? '' }
					onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
						setCurrentVatDetails( { ...currentVatDetails, name: event.target.value } )
					}
				/>
			</FormFieldset>
			<FormFieldset className="vat-info__address-field">
				<FormLabel htmlFor="address">{ translate( 'Address' ) }</FormLabel>
				<FormTextInput
					name="address"
					disabled={ isUpdating }
					value={ currentVatDetails.address ?? vatDetails.address ?? '' }
					onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
						setCurrentVatDetails( { ...currentVatDetails, address: event.target.value } )
					}
				/>
			</FormFieldset>

			<Button primary busy={ isUpdating } disabled={ isUpdating } onClick={ saveDetails }>
				{ translate( 'Validate and save' ) }
			</Button>
		</>
	);
}

function CountryCodeInput( {
	name,
	disabled,
	value,
	onChange,
}: {
	name: string;
	disabled?: boolean;
	value: string;
	onChange: ( event: React.ChangeEvent< HTMLSelectElement > ) => void;
} ) {
	const countries = useCountryList();

	// Some historical country codes were set to 'UK', but that is not a valid
	// country code. It should read 'GB'.
	if ( value === 'UK' ) {
		value = 'GB';
	}

	return (
		<FormSelect
			name={ name }
			disabled={ disabled }
			value={ value }
			onChange={ onChange }
			className="vat-info__country-select"
		>
			<option value="">--</option>
			{ countries
				.filter( ( country ) => country.vat_supported )
				.map( ( country ) => {
					return country.tax_country_codes.map( ( countryCode ) => (
						<option key={ countryCode } value={ countryCode }>
							{ countryCode }
						</option>
					) );
				} ) }
		</FormSelect>
	);
}

function useDisplayVatNotices( {
	error,
	success,
}: {
	error: UpdateError | null;
	success: boolean;
} ) {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		if ( error ) {
			reduxDispatch( removeNotice( 'vat_info_notice' ) );
			reduxDispatch( errorNotice( error.message, { id: 'vat_info_notice' } ) );
			return;
		}

		if ( success ) {
			reduxDispatch( removeNotice( 'vat_info_notice' ) );
			reduxDispatch(
				successNotice( translate( 'Your Business Tax ID details have been updated!' ), {
					id: 'vat_info_notice',
				} )
			);
			return;
		}
	}, [ error, success, reduxDispatch, translate ] );
}

function useRecordVatEvents( {
	updateError,
	fetchError,
	isUpdateSuccessful,
}: {
	updateError?: UpdateError | null;
	fetchError?: FetchError | null;
	isUpdateSuccessful?: boolean;
} ) {
	const reduxDispatch = useDispatch();
	const lastFetchError = useRef< FetchError >();
	const lastUpdateError = useRef< UpdateError >();

	useEffect( () => {
		if ( fetchError && lastFetchError.current !== fetchError ) {
			reduxDispatch(
				recordTracksEvent( 'calypso_vat_details_fetch_failure', {
					error: fetchError.error,
					message: fetchError.message,
				} )
			);
			lastFetchError.current = fetchError;
			return;
		}

		if ( updateError && lastUpdateError.current !== updateError ) {
			reduxDispatch(
				recordTracksEvent( 'calypso_vat_details_validation_failure', { error: updateError.error } )
			);
			lastUpdateError.current = updateError;
			return;
		}

		if ( isUpdateSuccessful ) {
			reduxDispatch( recordTracksEvent( 'calypso_vat_details_validation_success' ) );
			return;
		}
	}, [ fetchError, updateError, isUpdateSuccessful, reduxDispatch ] );
}

function LoadingPlaceholder() {
	return (
		<>
			<div className="vat-info__form-placeholder"></div>
			<div className="vat-info__form-placeholder"></div>
			<div className="vat-info__form-placeholder"></div>
			<div className="vat-info__form-placeholder"></div>
		</>
	);
}
