import { FormInputValidation } from '@automattic/components';
import styled from '@emotion/styled';
import { TextControl, ComboboxControl } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import emailValidator from 'email-validator';
import { useEffect, useState } from 'react';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchWooCommerceCountries } from 'calypso/state/countries/actions';
import getCountries from 'calypso/state/selectors/get-countries';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { ActionSection, StyledNextButton } from '..';
import SupportCard from '../components/support-card';
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
import type { WooCommerceStoreAddressProps } from '..';
import type { IAppState } from 'calypso/state/types';
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

export default function StepStoreAddress( props: WooCommerceStoreAddressProps ) {
	const { goToNextStep, signupDependencies } = props;
	const { __ } = useI18n();
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( fetchWooCommerceCountries() );
	}, [ dispatch ] );

	const siteId = useSelector( getSelectedSiteId ) as number;

	const countriesList =
		useSelector( ( state: IAppState ) => getCountries( state, 'woocommerce' ) ) || {};
	const countriesAsOptions = Object.entries( countriesList ).map( ( [ key, value ] ) => {
		return { value: key, label: value };
	} );

	const { get, save, update } = useSiteSettings( siteId );

	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const backPath = signupDependencies?.back_to;
	// Check for a valid back path, otherwise go back to the WooCommerce install landing page.
	const backUrl =
		backPath && backPath.match( /^\/(?!\/)/ ) ? backPath : `/woocommerce-installation/${ domain }`;

	const { validate, clearError, getError, errors } = useAddressFormValidation( siteId );

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

	const [ submitted, setSubmitted ] = useState( 0 );
	useEffect( () => {
		return;
	}, [ submitted ] );

	function getContent() {
		return (
			<>
				<div className="step-store-address__info-section" />
				<div className="step-store-address__instructions-container">
					<form
						onSubmit={ ( e ) => {
							e.preventDefault();
							setSubmitted( submitted + 1 );
							if ( validate() ) {
								save();
								dispatch( submitSignupStep( { stepName: 'store-address' } ) );
								goToNextStep();
							}
							return false;
						} }
					>
						<TextControl
							label={ __( 'Address line 1' ) }
							value={ get( WOOCOMMERCE_STORE_ADDRESS_1 ) }
							onChange={ ( value ) => {
								update( WOOCOMMERCE_STORE_ADDRESS_1, value );
								clearError( WOOCOMMERCE_STORE_ADDRESS_1 );
							} }
							className={ address1Error ? 'is-error' : '' }
						/>
						<ControlError error={ address1Error } />

						<TextControl
							label={ __( 'Address line 2 (optional)' ) }
							value={ get( WOOCOMMERCE_STORE_ADDRESS_2 ) }
							onChange={ ( value ) => {
								update( WOOCOMMERCE_STORE_ADDRESS_2, value );
								clearError( WOOCOMMERCE_STORE_ADDRESS_2 );
							} }
							className={ address2Error ? 'is-error' : '' }
						/>
						<ControlError error={ address2Error } />

						<CityZipRow>
							<div>
								<TextControl
									label={ __( 'City' ) }
									value={ get( WOOCOMMERCE_STORE_CITY ) }
									onChange={ ( value ) => {
										update( WOOCOMMERCE_STORE_CITY, value );
										clearError( WOOCOMMERCE_STORE_CITY );
									} }
									className={ cityError ? 'is-error' : '' }
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
									className={ postcodeError ? 'is-error' : '' }
								/>
								<ControlError error={ postcodeError } />
							</div>
						</CityZipRow>

						<ComboboxControl
							label={ __( 'Country / State' ) }
							value={ get( WOOCOMMERCE_DEFAULT_COUNTRY ) }
							onChange={ ( value ) => {
								update( WOOCOMMERCE_DEFAULT_COUNTRY, value ?? '' );
								clearError( WOOCOMMERCE_DEFAULT_COUNTRY );
							} }
							options={ countriesAsOptions }
							className={ countryError ? 'is-error' : '' }
						/>
						<ControlError error={ countryError } />

						<TextControl
							label={ __( 'Email address' ) }
							value={ getProfileEmail() }
							onChange={ ( value ) => {
								updateProfileEmail( value );
								clearError( WOOCOMMERCE_ONBOARDING_PROFILE );
							} }
							className={ emailError ? 'is-error' : '' }
						/>
						<ControlError error={ emailError } />

						<ActionSection>
							<SupportCard />
							<StyledNextButton
								type="submit"
								disabled={ Object.values( errors ).filter( Boolean ).length > 0 }
							>
								{ __( 'Continue' ) }
							</StyledNextButton>
						</ActionSection>
					</form>
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
			hideSkip
			allowBackFirstStep
			backUrl={ backUrl }
			headerText={ __( 'Add an address to accept payments' ) }
			fallbackHeaderText={ __( 'Add an address to accept payments' ) }
			subHeaderText={ __(
				'This will be used as your default business address. You can change it later if you need to.'
			) }
			fallbackSubHeaderText={ __(
				'This will be used as your default business address. You can change it later if you need to.'
			) }
			align="left"
			stepContent={ getContent() }
			isWideLayout
			{ ...props }
		/>
	);
}

function ControlError( props: { error: string } ) {
	const { error } = props;
	if ( error ) {
		return <FormInputValidation isError isValid={ false } text={ error } />;
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
		errors[ WOOCOMMERCE_STORE_ADDRESS_2 ] = ''; // Optional field.
		errors[ WOOCOMMERCE_DEFAULT_COUNTRY ] = ! get( WOOCOMMERCE_DEFAULT_COUNTRY )
			? __( 'Please select a country / region' )
			: '';
		errors[ WOOCOMMERCE_STORE_CITY ] = ! get( WOOCOMMERCE_STORE_CITY )
			? __( 'Please add a city' )
			: '';
		errors[ WOOCOMMERCE_STORE_POSTCODE ] = ''; // Optional field.
		errors[ WOOCOMMERCE_ONBOARDING_PROFILE ] = ! emailValidator.validate(
			get( WOOCOMMERCE_ONBOARDING_PROFILE )?.[ 'store_email' ]
		)
			? __( 'Please add a valid email address' )
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
		errors,
	};
}
