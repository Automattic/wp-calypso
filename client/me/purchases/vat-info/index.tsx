import { CompactCard, Button, Card, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, useRef, useMemo } from 'react';
import CardHeading from 'calypso/components/card-heading';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import useCountryList, {
	isVatSupported,
	useTaxName,
} from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice, removeNotice } from 'calypso/state/notices/actions';
import useVatDetails from './use-vat-details';
import type { UpdateError, FetchError } from './use-vat-details';
import type { CountryListItem, VatDetails } from '@automattic/wpcom-checkout';

import './style.scss';

export default function VatInfoPage() {
	const translate = useTranslate();
	const { data: geoData } = useGeoLocationQuery();
	const { isLoading, fetchError, vatDetails } = useVatDetails();
	const [ currentVatDetails, setCurrentVatDetails ] = useState< VatDetails >( {} );
	const taxName = useTaxName(
		currentVatDetails.country ?? vatDetails.country ?? geoData?.country_short ?? 'GB'
	);

	const reduxDispatch = useDispatch();

	const clickSupport = () => {
		reduxDispatch( recordTracksEvent( 'calypso_vat_details_support_click' ) );
	};

	/* This is a call to action for contacting support */
	const contactSupportLinkTitle = translate( 'Contact Happiness Engineers' );

	const taxSupportPageURL = localizeUrl( 'https://wordpress.com/support/vat-gst-other-taxes/' );

	/* This is the title of the support page from https://wordpress.com/support/vat-gst-other-taxes/ */
	const taxSupportPageLinkTitle = translate( 'VAT, GST, and other taxes' );

	useRecordVatEvents( { fetchError } );

	if ( fetchError ) {
		return (
			<div className="vat-info">
				<CompactCard>
					{
						/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
						translate( 'An error occurred while fetching %s details.', {
							textOnly: true,
							args: [ taxName ?? translate( 'VAT', { textOnly: true } ) ],
						} )
					}
				</CompactCard>
			</div>
		);
	}

	const genericTaxName =
		/* translators: This is a generic name for taxes to use when we do not know the user's country. */
		translate( 'tax (VAT/GST/CT)' );
	const fallbackTaxName = genericTaxName;
	/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
	const title = translate( 'Add %s details', {
		textOnly: true,
		args: [ taxName ?? fallbackTaxName ],
	} );

	return (
		<Layout className={ isLoading ? 'vat-info is-loading' : 'vat-info' }>
			<Column type="main">
				<CompactCard className="vat-info__form">
					{ isLoading && <LoadingPlaceholder /> }
					{ ! isLoading && (
						<VatForm
							currentVatDetails={ currentVatDetails }
							setCurrentVatDetails={ setCurrentVatDetails }
						/>
					) }
				</CompactCard>
			</Column>
			<Column type="sidebar">
				<Card className="vat-info__sidebar-card">
					<CardHeading tagName="h1" size={ 16 } isBold className="vat-info__sidebar-title">
						{ title }
					</CardHeading>
					<p className="vat-info__sidebar-paragraph">
						{ translate(
							/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST") or a generic fallback string of tax names */
							'The %(taxName)s details saved on this page will be applied to all receipts in your account.',
							{
								args: { taxName: taxName ?? fallbackTaxName },
							}
						) }
						<br />
						<br />
						{ translate(
							/* translators: This is a list of tax-related reasons a customer might need to contact support */
							'If you:' +
								'{{ul}}' +
								/* translators: %(taxName)s is the name of taxes in the country (eg: "VAT" or "GST") or a generic fallback string of tax names */
								'{{li}}Need to update existing %(taxName)s details{{/li}}' +
								'{{li}}Have been charged taxes as a business subject to reverse charges{{/li}}' +
								'{{li}}Do not see your country listed in this form{{/li}}' +
								'{{/ul}}' +
								'{{contactSupportLink}}Contact our Happiness Engineers{{/contactSupportLink}}. Include your %(taxName)s number and country code when you contact us.',
							{
								args: { taxName: taxName ?? fallbackTaxName },
								components: {
									ul: <ul />,
									li: <li />,
									contactSupportLink: (
										<a
											target="_blank"
											href={ CALYPSO_CONTACT }
											rel="noreferrer"
											onClick={ clickSupport }
											title={ contactSupportLinkTitle }
										/>
									),
								},
							}
						) }
						<br />
						<br />
						{ translate(
							'For more information about taxes, {{learnMoreLink}}click here{{/learnMoreLink}}.',
							{
								components: {
									learnMoreLink: (
										<InlineSupportLink
											supportLink={ taxSupportPageURL }
											showText
											showIcon={ false }
											supportPostId={ 234670 } //This is what makes the document appear in a dialogue
											linkTitle={ taxSupportPageLinkTitle }
										/>
									),
								},
							}
						) }
					</p>
				</Card>
			</Column>
		</Layout>
	);
}

function VatForm( {
	currentVatDetails,
	setCurrentVatDetails,
}: {
	currentVatDetails: VatDetails;
	setCurrentVatDetails: ( details: VatDetails ) => void;
} ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const { data: geoData } = useGeoLocationQuery();
	const { vatDetails, isUpdating, isUpdateSuccessful, setVatDetails, updateError } =
		useVatDetails();
	const taxName = useTaxName(
		currentVatDetails.country ?? vatDetails.country ?? geoData?.country_short ?? 'GB'
	);

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
				<FormLabel htmlFor="vat">
					{
						/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
						translate( '%s ID', {
							textOnly: true,
							args: [ taxName ?? translate( 'VAT', { textOnly: true } ) ],
						} )
					}
				</FormLabel>
				<InputWrapper>
					{ currentVatDetails?.country && (
						<span className="vat-field__overlay-prefix">{ currentVatDetails.country }</span>
					) }
					<FormTextInput
						name="vat"
						disabled={ isUpdating || isVatAlreadySet }
						value={ currentVatDetails.id ?? vatDetails.id ?? '' }
						onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
							setCurrentVatDetails( { ...currentVatDetails, id: event.target.value } )
						}
					/>
				</InputWrapper>
				{ isVatAlreadySet && (
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

function getUniqueCountries< C extends CountryListItem >( countries: C[] ): C[] {
	const unique: C[] = [];
	countries.forEach( ( country ) => {
		if ( unique.map( ( x ) => x.code ).includes( country.code ) ) {
			return;
		}
		unique.push( country );
	} );
	return unique;
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
	const translate = useTranslate();

	// Some historical country codes were set to 'UK', but that is not a valid
	// country code. It should read 'GB'.
	if ( value === 'UK' ) {
		value = 'GB';
	}

	const vatCountries = useMemo(
		() => getUniqueCountries( countries.filter( isVatSupported ) ),
		[ countries ]
	);
	return (
		<FormSelect
			name={ name }
			disabled={ disabled }
			value={ value }
			onChange={ onChange }
			className="vat-info__country-select"
		>
			<option value="">--</option>
			{ vatCountries.map( ( country ) => {
				return country.tax_country_codes.map( ( countryCode ) => {
					const name = countryCode === 'XI' ? translate( 'Northern Ireland' ) : country.name;
					return (
						<option key={ countryCode } value={ countryCode }>
							{ countryCode } - { name }
						</option>
					);
				} );
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
	const { data: geoData } = useGeoLocationQuery();
	const { vatDetails } = useVatDetails();
	const taxName = useTaxName( vatDetails.country ?? geoData?.country_short ?? 'GB' );

	useEffect( () => {
		if ( error ) {
			reduxDispatch( removeNotice( 'vat_info_notice' ) );
			reduxDispatch( errorNotice( error.message, { id: 'vat_info_notice' } ) );
			return;
		}

		if ( success ) {
			reduxDispatch( removeNotice( 'vat_info_notice' ) );
			reduxDispatch(
				successNotice(
					/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
					translate( 'Your %s details have been updated!', {
						textOnly: true,
						args: [ taxName ?? translate( 'VAT', { textOnly: true } ) ],
					} ),
					{
						id: 'vat_info_notice',
					}
				)
			);
			return;
		}
	}, [ error, success, reduxDispatch, translate, taxName ] );
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

// TODO - We'll need to fix the error handling for touch fields and pass the error to this component
function InputWrapper( { children }: { children: React.ReactNode } ) {
	return <div className="vat-form__field-wrapper">{ children }</div>;
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
