import { FormInputValidation, FormLabel } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { ComboboxControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import emailValidator from 'email-validator';
import { FormEvent, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInput from 'calypso/components/forms/form-text-input';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE, SITE_STORE, USER_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ActionSection, StyledNextButton } from 'calypso/signup/steps/woocommerce-install';
import { useComingFromThemeActivationParam } from '../../../../hooks/use-coming-from-theme-activation';
import { useCountries } from '../../../../hooks/use-countries';
import SupportCard from './support-card';
import type { Step } from '../../types';
import type { OnboardSelect, SiteSelect, UserSelect } from '@automattic/data-stores';
import './style.scss';

type FormFields =
	| 'store_address_1'
	| 'store_address_2'
	| 'store_city'
	| 'store_postcode'
	| 'store_country'
	| 'store_email';

type WooAddressSettings = {
	woocommerce_store_address?: string;
	woocommerce_store_address_2?: string;
	woocommerce_store_city?: string;
	woocommerce_store_postcode?: string;
	woocommerce_default_country?: string;
	woocommerce_onboarding_profile?: { store_email: string };
};

const CityZipRow = styled.div`
	display: -ms-grid;
	display: grid;
	width: 100%;
	-ms-grid-columns: 48% 4% 48%;
	grid-template-columns: 48% 48%;
	grid-column-gap: 4%;
	justify-items: stretch;
`;

const StoreAddress: Step = function StoreAddress( { navigation } ) {
	const { goBack, submit } = navigation;
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);
	const site = useSite();
	const settings = useSelect(
		( select ) =>
			( site?.ID && ( select( SITE_STORE ) as SiteSelect ).getSiteSettings( site.ID ) ) || {},
		[ site ]
	);
	const currentUser = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser() || null,
		[]
	);
	const { data: countries } = useCountries();
	const { __ } = useI18n();
	const [ errors, setErrors ] = useState( {} as Record< FormFields, string > );
	const { saveSiteSettings } = useDispatch( SITE_STORE );

	const comingFromThemeActivation = useComingFromThemeActivationParam();

	const [ settingChanges, setSettingChanges ] = useState< {
		[ key: string ]: string;
	} >( {} );

	if ( ! countries ) {
		return null;
	}

	const headerText = __( 'Add an address to accept payments' );
	const countriesAsOptions = Object.entries( countries ).map( ( [ key, value ] ) => {
		return { value: key, label: value };
	} );

	function getSettingsValue( key: FormFields ) {
		if ( key in settingChanges ) {
			return settingChanges[ key ];
		}

		switch ( key ) {
			case 'store_email':
				return settings?.[ 'woocommerce_onboarding_profile' ]?.[ 'store_email' ] || '';

			case 'store_address_1':
				return settings?.[ 'woocommerce_store_address' ] || '';

			case 'store_country':
				return settings?.[ 'woocommerce_default_country' ] || '';

			default:
				return settings?.[ 'woocommerce_' + key ] || '';
		}
	}

	function updateSettingsValue( key: FormFields, value: string ) {
		setSettingChanges( {
			...settingChanges,
			[ key ]: value,
		} );
	}

	const onChange = ( key: FormFields, value: string ) => {
		if ( site ) {
			updateSettingsValue( key, value );
			setErrors( {
				...errors,
				[ key ]: '',
			} );
		}
	};

	const elementChange = ( event: React.FormEvent< HTMLInputElement > ) => {
		onChange( event.currentTarget.name as FormFields, event.currentTarget.value );
	};

	const validate = (): boolean => {
		const errors = {} as Record< FormFields, string >;

		errors[ 'store_address_1' ] = ! getSettingsValue( 'store_address_1' )
			? __( 'Please add an address' )
			: '';
		errors[ 'store_city' ] = ! getSettingsValue( 'store_city' ) ? __( 'Please add a city' ) : '';
		errors[ 'store_country' ] = ! getSettingsValue( 'store_country' )
			? __( 'Please select a country / region' )
			: '';

		// Only validate the store email if a value has been provided.
		const storeEmail = getSettingsValue( 'store_email' );
		if ( storeEmail ) {
			errors[ 'store_email' ] = ! emailValidator.validate( storeEmail )
				? __( 'Please add a valid email address' )
				: '';
		}

		setErrors( errors );

		return Object.values( errors ).filter( Boolean ).length === 0;
	};

	const onSubmit = async ( event: FormEvent ) => {
		event.preventDefault();

		if ( site ) {
			if ( ! validate() ) {
				return;
			}

			if ( site?.ID ) {
				const changes: WooAddressSettings = {};

				if ( 'store_address_1' in settingChanges ) {
					changes[ 'woocommerce_store_address' ] = settingChanges[ 'store_address_1' ];
				}

				if ( 'store_address_2' in settingChanges ) {
					changes[ 'woocommerce_store_address_2' ] = settingChanges[ 'store_address_2' ];
				}

				if ( 'store_city' in settingChanges ) {
					changes[ 'woocommerce_store_city' ] = settingChanges[ 'store_city' ];
				}

				if ( 'store_postcode' in settingChanges ) {
					changes[ 'woocommerce_store_postcode' ] = settingChanges[ 'store_postcode' ];
				}

				if ( 'store_country' in settingChanges ) {
					changes[ 'woocommerce_default_country' ] = settingChanges[ 'store_country' ];
				}

				if ( 'store_email' in settingChanges ) {
					changes[ 'woocommerce_onboarding_profile' ] = {
						...settings?.woocommerce_onboarding_profile,
						store_email: settingChanges.store_email,
					};
				}

				saveSiteSettings( site.ID, changes );
			}

			submit?.();
		}
	};

	const getContent = () => {
		return (
			<>
				<form onSubmit={ onSubmit }>
					<FormFieldset>
						<FormLabel htmlFor="store_address_1">{ __( 'Address line 1' ) }</FormLabel>
						<FormInput
							value={ getSettingsValue( 'store_address_1' ) }
							name="store_address_1"
							id="store_address_1"
							onChange={ elementChange }
							className={ errors[ 'store_address_1' ] ? 'is-error' : '' }
						/>
						<ControlError error={ errors[ 'store_address_1' ] || '' } />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="store_address_2">{ __( 'Address line 2 (optional)' ) }</FormLabel>
						<FormInput
							value={ getSettingsValue( 'store_address_2' ) }
							name="store_address_2"
							id="store_address_2"
							onChange={ elementChange }
							className={ errors[ 'store_address_2' ] ? 'is-error' : '' }
						/>
						<ControlError error={ errors[ 'store_address_2' ] || '' } />
					</FormFieldset>

					<CityZipRow>
						<div>
							<FormFieldset>
								<FormLabel htmlFor="store_city">{ __( 'City' ) }</FormLabel>
								<FormInput
									value={ getSettingsValue( 'store_city' ) }
									name="store_city"
									id="store_city"
									onChange={ elementChange }
									className={ errors[ 'store_city' ] ? 'is-error' : '' }
								/>
								<ControlError error={ errors[ 'store_city' ] || '' } />
							</FormFieldset>
						</div>

						<div>
							<FormFieldset>
								<FormLabel htmlFor="store_postcode">{ __( 'Postcode' ) }</FormLabel>
								<FormInput
									value={ getSettingsValue( 'store_postcode' ) }
									name="store_postcode"
									id="store_postcode"
									onChange={ elementChange }
									className={ errors[ 'store_postcode' ] ? 'is-error' : '' }
								/>
								<ControlError error={ errors[ 'store_postcode' ] || '' } />
							</FormFieldset>
						</div>
					</CityZipRow>

					<FormFieldset>
						<FormLabel htmlFor="store_postcode">{ __( 'Country / State' ) }</FormLabel>
						<ComboboxControl
							value={ getSettingsValue( 'store_country' ) }
							onChange={ ( value?: string | null ) => {
								onChange( 'store_country', value || '' );
							} }
							options={ countriesAsOptions }
							className={ errors[ 'store_country' ] ? 'is-error' : '' }
							__next40pxDefaultSize
						/>
						<ControlError error={ errors[ 'store_country' ] || '' } />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="store_email">
							{ __( 'Get WooCommerce tips straight to your inbox (optional)' ) }
							<br />
						</FormLabel>
						<FormInput
							value={ getSettingsValue( 'store_email' ) }
							name="store_email"
							id="store_email"
							onChange={ elementChange }
							className={ errors[ 'store_email' ] ? 'is-error' : '' }
						/>
						{ currentUser && (
							<button
								onClick={ ( e ) => {
									e.preventDefault();

									onChange( 'store_email', currentUser.email );
								} }
								className="store-address__set-store-email"
							>
								({ __( 'Use my WordPress.com email' ) } )
							</button>
						) }
						<ControlError error={ errors[ 'store_email' ] } />
					</FormFieldset>

					<ActionSection>
						<SupportCard domain={ site?.URL || '' } />
						<StyledNextButton
							type="submit"
							disabled={ Object.values( errors ).filter( Boolean ).length > 0 }
						>
							{ __( 'Continue' ) }
						</StyledNextButton>
					</ActionSection>
				</form>
			</>
		);
	};

	return (
		<StepContainer
			stepName="store-address"
			className={ `is-step-${ intent }` }
			goBack={ goBack }
			isHorizontalLayout
			formattedHeader={
				<FormattedHeader
					id="site-options-header"
					headerText={ headerText }
					subHeaderText={ __(
						'This will be used as your default business address. You can change it later if you need to.'
					) }
					align="left"
				/>
			}
			intent={ intent }
			stepContent={ getContent() }
			recordTracksEvent={ recordTracksEvent }
			hideBack={ ! comingFromThemeActivation }
		/>
	);
};

function ControlError( { error }: { error: string } ) {
	if ( error ) {
		return <FormInputValidation isError isValid={ false } text={ error } />;
	}
	return null;
}

export default StoreAddress;
