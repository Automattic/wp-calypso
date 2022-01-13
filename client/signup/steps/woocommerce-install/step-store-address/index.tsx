import styled from '@emotion/styled';
import { TextControl, ComboboxControl } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import StepWrapper from 'calypso/signup/step-wrapper';
import { fetchWooCommerceCountries } from 'calypso/state/countries/actions';
import getCountries from 'calypso/state/selectors/get-countries';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SupportCard from '../components/support-card';
import { ActionSection, StyledNextButton } from '../confirm';
import {
	useSiteSettings,
	WOOCOMMERCE_STORE_ADDRESS_1,
	WOOCOMMERCE_STORE_ADDRESS_2,
	WOOCOMMERCE_STORE_CITY,
	WOOCOMMERCE_DEFAULT_COUNTRY,
	WOOCOMMERCE_STORE_POSTCODE,
	WOOCOMMERCE_ONBOARDING_PROFILE,
	optionNameType,
} from '../hooks/use-site-settings';
import useWooCommerceOnPlansEligibility from '../hooks/use-woop-handling';
import type { WooCommerceInstallProps } from '..';
import './style.scss';

const CityZipRow = styled.div`
	display: -ms-grid;
	display: grid;
	width: 100%;
	-ms-grid-columns: 48% 4% 48%;
	grid-template-columns: 48% 48%;
	grid-column-gap: 4%;
	justify-items: stretch;
`;

export default function StepStoreAddress( props: WooCommerceInstallProps ): ReactElement | null {
	const { goToStep, isReskinned, headerTitle, headerDescription } = props;
	const { __ } = useI18n();
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( fetchWooCommerceCountries() );
	}, [ dispatch ] );

	const siteId = useSelector( getSelectedSiteId ) as number;

	const countriesList = useSelector( ( state ) => getCountries( state, 'woocommerce' ) ) || [];
	const countriesAsOptions = Object.entries( countriesList ).map( ( [ key, value ] ) => {
		return { value: key, label: value };
	} );

	const { get, save, update } = useSiteSettings( siteId );

	const { wpcomDomain } = useWooCommerceOnPlansEligibility( siteId );

	const { validate, clearError, getError } = useAddressFormValidation( siteId );

	// @todo: Add a general hook to get and update multi-option data like the profile.
	function updateProfileEmail( email: string ) {
		const onboardingProfile = get( WOOCOMMERCE_ONBOARDING_PROFILE ) || {};

		const updatedOnboardingProfile = {
			...onboardingProfile,
			store_email: email,
		};

		update( WOOCOMMERCE_ONBOARDING_PROFILE, updatedOnboardingProfile );
	}

	function getProfileEmail() {
		const onboardingProfile = get( WOOCOMMERCE_ONBOARDING_PROFILE );

		return onboardingProfile[ 'store_email' ] || '';
	}

	// Form validation.
	const address1Error = getError( WOOCOMMERCE_STORE_ADDRESS_1 );
	const address2Error = getError( WOOCOMMERCE_STORE_ADDRESS_2 );
	const countryError = getError( WOOCOMMERCE_DEFAULT_COUNTRY );
	const cityError = getError( WOOCOMMERCE_STORE_CITY );
	const postcodeError = getError( WOOCOMMERCE_STORE_POSTCODE );
	const emailError = getError( WOOCOMMERCE_ONBOARDING_PROFILE );
	useEffect( () => {
		return;
	}, [ address1Error, address2Error, countryError, cityError, postcodeError, emailError ] );

	function getContent() {
		return (
			<>
				<div className="step-store-address__info-section" />
				<div className="step-store-address__instructions-container">
					<TextControl
						label={ __( 'Address line 1' ) }
						value={ get( WOOCOMMERCE_STORE_ADDRESS_1 ) }
						onChange={ ( value ) => {
							update( WOOCOMMERCE_STORE_ADDRESS_1, value );
							clearError( WOOCOMMERCE_STORE_ADDRESS_1 );
						} }
					/>
					<ControlError error={ address1Error } />

					<TextControl
						label={ __( 'Address line 2' ) }
						value={ get( WOOCOMMERCE_STORE_ADDRESS_2 ) }
						onChange={ ( value ) => {
							update( WOOCOMMERCE_STORE_ADDRESS_2, value );
							clearError( WOOCOMMERCE_STORE_ADDRESS_2 );
						} }
					/>
					<ControlError error={ address2Error } />

					<ComboboxControl
						label={ __( 'Country / Region' ) }
						value={ get( WOOCOMMERCE_DEFAULT_COUNTRY ) }
						allowReset={ false }
						onChange={ ( value: string | null ) => {
							update( WOOCOMMERCE_DEFAULT_COUNTRY, value || '' );
							clearError( WOOCOMMERCE_DEFAULT_COUNTRY );
						} }
						options={ countriesAsOptions }
					/>
					<ControlError error={ countryError } />

					<CityZipRow>
						<div>
							<TextControl
								label={ __( 'City' ) }
								value={ get( WOOCOMMERCE_STORE_CITY ) }
								onChange={ ( value ) => {
									update( WOOCOMMERCE_STORE_CITY, value );
									clearError( WOOCOMMERCE_STORE_CITY );
								} }
							/>
							<ControlError error={ cityError } />
						</div>

						<div>
							<TextControl
								label={ __( 'Postcode' ) }
								value={ get( WOOCOMMERCE_STORE_POSTCODE ) }
								onChange={ ( value ) => {
									update( WOOCOMMERCE_STORE_POSTCODE, value );
									clearError( WOOCOMMERCE_STORE_POSTCODE );
								} }
							/>
							<ControlError error={ postcodeError } />
						</div>
					</CityZipRow>

					<TextControl
						label={ __( 'Email address' ) }
						value={ getProfileEmail() }
						onChange={ ( value ) => {
							updateProfileEmail( value );
							clearError( WOOCOMMERCE_ONBOARDING_PROFILE );
						} }
					/>
					<ControlError error={ emailError } />

					<ActionSection>
						<SupportCard />
						<StyledNextButton
							onClick={ () => {
								if ( validate() ) {
									save();
									goToStep( 'confirm' );
								}
							} }
						>
							{ __( 'Continue' ) }
						</StyledNextButton>
					</ActionSection>
				</div>
			</>
		);
	}

	if ( ! siteId ) {
		return (
			<div className="step-store-address__info-section">
				<LoadingEllipsis />
			</div>
		);
	}

	return (
		<StepWrapper
			flowName="woocommerce-install"
			hideSkip={ true }
			nextLabelText={ __( 'Confirm' ) }
			allowBackFirstStep={ true }
			backUrl={ `/woocommerce-installation/${ wpcomDomain }` }
			headerText={ headerTitle }
			fallbackHeaderText={ headerTitle }
			subHeaderText={ headerDescription }
			fallbackSubHeaderText={ headerDescription }
			align={ isReskinned ? 'left' : 'center' }
			stepContent={ getContent() }
			isWideLayout={ isReskinned }
			{ ...props }
		/>
	);
}

function ControlError( props: { error: string } ): ReactElement | null {
	const { error } = props;
	if ( error ) {
		return <FormInputValidation isError={ true } isValid={ false } text={ error } />;
	}
	return null;
}

function useAddressFormValidation( siteId: number ) {
	const { get } = useSiteSettings( siteId );
	const { __ } = useI18n();

	const [ errors, setErrors ] = useState( {} as Record< optionNameType, string > );

	const validate = () => {
		errors[ WOOCOMMERCE_STORE_ADDRESS_1 ] = ! get( WOOCOMMERCE_STORE_ADDRESS_1 )
			? __( 'Please add an address' )
			: '';
		errors[ WOOCOMMERCE_STORE_ADDRESS_2 ] = ''; // Optional field
		errors[ WOOCOMMERCE_DEFAULT_COUNTRY ] = ! get( WOOCOMMERCE_DEFAULT_COUNTRY )
			? __( 'Please select a country / region' )
			: '';
		errors[ WOOCOMMERCE_STORE_CITY ] = ! get( WOOCOMMERCE_STORE_CITY )
			? __( 'Please add a city' )
			: '';
		errors[ WOOCOMMERCE_STORE_POSTCODE ] = ! get( WOOCOMMERCE_STORE_POSTCODE )
			? __( 'Please add a postcode' )
			: '';
		errors[ WOOCOMMERCE_ONBOARDING_PROFILE ] = ! get( WOOCOMMERCE_ONBOARDING_PROFILE )?.[
			'store_email'
		]
			? __( 'A valid email address is required' )
			: '';

		setErrors( errors );

		return Object.values( errors ).filter( Boolean ).length === 0;
	};

	const clearError = ( field: optionNameType ) => {
		errors[ field ] = '';
		setErrors( errors );
	};

	const getError = ( field: optionNameType ) => errors[ field ] || '';

	return {
		validate,
		clearError,
		getError,
	};
}
