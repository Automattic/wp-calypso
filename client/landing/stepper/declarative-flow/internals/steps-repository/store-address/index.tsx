import { StepContainer } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { ComboboxControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { FormEvent, ReactElement, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormInput from 'calypso/components/forms/form-text-input';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ActionSection, StyledNextButton } from 'calypso/signup/steps/woocommerce-install';
import { useCountries } from '../../../../hooks/use-countries';
import SupportCard from './support-card';
import type { Step } from '../../types';
import './style.scss';

type FormFields =
	| 'store_address_1'
	| 'store_address_2'
	| 'store_city'
	| 'store_postcode'
	| 'store_country';

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
	const { goBack, goNext, submit } = navigation;
	const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
	const storeAddress = useSelect( ( select ) => select( ONBOARD_STORE ).getStoreAddress() );
	const site = useSite();
	const { data: countries } = useCountries();
	const { __ } = useI18n();
	const [ errors, setErrors ] = useState( {} as Record< FormFields, string > );
	const [ storeAddress1, setStoreAddress1 ] = useState( storeAddress.store_address_1 );
	const [ storeAddress2, setStoreAddress2 ] = useState( storeAddress.store_address_2 );
	const [ storeCity, setStoreCity ] = useState( storeAddress.store_city );
	const [ storePostcode, setStorePostcode ] = useState( storeAddress.store_postcode );
	const [ storeCountry, setStoreCountry ] = useState( storeAddress.store_country );
	const { setStoreAddressValue } = useDispatch( ONBOARD_STORE );

	if ( ! countries ) {
		return null;
	}

	const headerText = __( 'Add an address to accept payments' );
	const countriesAsOptions = Object.entries( countries ).map( ( [ key, value ] ) => {
		return { value: key, label: value };
	} );

	const onChange = ( event: React.FormEvent< HTMLInputElement > ) => {
		if ( site ) {
			const errors = {} as Record< FormFields, string >;

			switch ( event.currentTarget.name ) {
				case 'store_address_1':
					setStoreAddress1( event.currentTarget.value );
					errors[ 'store_address_1' ] = '';
					break;
				case 'store_address_2':
					setStoreAddress2( event.currentTarget.value );
					break;
				case 'store_city':
					setStoreCity( event.currentTarget.value );
					errors[ 'store_city' ] = '';
					break;
				case 'store_postcode':
					setStorePostcode( event.currentTarget.value );
					errors[ 'store_postcode' ] = '';
					break;
			}

			setErrors( errors );
		}
	};

	const validate = (): boolean => {
		const errors = {} as Record< FormFields, string >;

		errors[ 'store_address_1' ] = ! storeAddress1 ? __( 'Please add an address' ) : '';
		errors[ 'store_city' ] = ! storeCity ? __( 'Please add a city' ) : '';
		errors[ 'store_country' ] = ! storeCountry ? __( 'Please select a country / region' ) : '';

		setErrors( errors );

		return Object.values( errors ).filter( Boolean ).length === 0;
	};

	const onSubmit = async ( event: FormEvent ) => {
		event.preventDefault();

		if ( site ) {
			if ( ! validate() ) {
				return;
			}

			await setStoreAddressValue( 'store_address_1', storeAddress1 );
			await setStoreAddressValue( 'store_address_2', storeAddress2 || '' );
			await setStoreAddressValue( 'store_city', storeCity );
			await setStoreAddressValue( 'store_postcode', storePostcode );
			await setStoreAddressValue( 'store_country', storeCountry );

			submit?.( {
				storeAddress1,
				storeAddress2,
				storeCity,
				storePostcode,
				storeCountry,
			} );
		}
	};

	const getContent = () => {
		return (
			<>
				<form onSubmit={ onSubmit }>
					<FormFieldset>
						<FormLabel htmlFor="store_address_1">{ __( 'Address line 1' ) }</FormLabel>
						<FormInput
							value={ storeAddress1 }
							name="store_address_1"
							id="store_address_1"
							onChange={ onChange }
							className={ errors[ 'store_address_1' ] ? 'is-error' : '' }
						/>
						<ControlError error={ errors[ 'store_address_1' ] || '' } />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="store_address_2">{ __( 'Address line 2 (optional)' ) }</FormLabel>
						<FormInput
							value={ storeAddress2 }
							name="store_address_2"
							id="store_address_2"
							onChange={ onChange }
							className={ errors[ 'store_address_2' ] ? 'is-error' : '' }
						/>
						<ControlError error={ errors[ 'store_address_2' ] || '' } />
					</FormFieldset>

					<CityZipRow>
						<div>
							<FormFieldset>
								<FormLabel htmlFor="store_city">{ __( 'City' ) }</FormLabel>
								<FormInput
									value={ storeCity }
									name="store_city"
									id="store_city"
									onChange={ onChange }
									className={ errors[ 'store_city' ] ? 'is-error' : '' }
								/>
								<ControlError error={ errors[ 'store_city' ] || '' } />
							</FormFieldset>
						</div>

						<div>
							<FormFieldset>
								<FormLabel htmlFor="store_postcode">{ __( 'Postcode' ) }</FormLabel>
								<FormInput
									value={ storePostcode }
									name="store_postcode"
									id="store_postcode"
									onChange={ onChange }
									className={ errors[ 'store_postcode' ] ? 'is-error' : '' }
								/>
								<ControlError error={ errors[ 'store_postcode' ] || '' } />
							</FormFieldset>
						</div>
					</CityZipRow>

					<FormFieldset>
						<ComboboxControl
							label={ __( 'Country / State' ) }
							value={ storeCountry }
							onChange={ ( value: string | null ) => {
								if ( value ) {
									setStoreCountry( value );
									setErrors( {
										...errors,
										store_country: '',
									} );
								}
							} }
							options={ countriesAsOptions }
							className={ errors[ 'store_country' ] ? 'is-error' : '' }
						/>
						<ControlError error={ errors[ 'store_country' ] || '' } />
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
		<div className="store-address__signup is-woocommerce-install">
			<div className="store-address__is-store-address">
				<StepContainer
					stepName={ 'store-address' }
					className={ `is-step-${ intent }` }
					skipButtonAlign={ 'top' }
					goBack={ goBack }
					goNext={ goNext }
					isHorizontalLayout={ true }
					formattedHeader={
						<FormattedHeader
							id={ 'site-options-header' }
							headerText={ headerText }
							subHeaderText={ __(
								'This will be used as your default business address. You can change it later if you need to.'
							) }
							align={ 'left' }
						/>
					}
					stepContent={ getContent() }
					recordTracksEvent={ recordTracksEvent }
				/>
			</div>
		</div>
	);
};

function ControlError( { error }: { error: string } ): ReactElement | null {
	if ( error ) {
		return <FormInputValidation isError={ true } isValid={ false } text={ error } />;
	}
	return null;
}

export default StoreAddress;
