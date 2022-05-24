import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactChild, ReactElement, useCallback, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import SelectDropdown from 'calypso/components/select-dropdown';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { PartnerDetailsPayload } from 'calypso/state/partner-portal/types';
import { useCountriesAndStates } from './hooks/use-countries-and-states';
import './style.scss';

function getCountry( country: string, options: object[] ): string {
	if ( options.length < 1 ) {
		return country;
	}

	for ( let i = 0; i < options.length; i++ ) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if ( options[ i ].value === country ) {
			return country;
		}
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return options[ 0 ].value;
}

interface Props {
	includeTermsOfService?: boolean;
	isLoading: boolean;
	onSubmit: ( payload: PartnerDetailsPayload ) => void;
	initialValues?: {
		name?: string;
		city?: string;
		line1?: string;
		line2?: string;
		country?: string;
		postalCode?: string;
		state?: string;
	};
	submitLabel: ReactChild;
}

export default function CompanyDetailsForm( {
	includeTermsOfService = false,
	isLoading,
	initialValues = {},
	onSubmit,
	submitLabel,
}: Props ): ReactElement {
	const translate = useTranslate();
	const { countryOptions, stateOptionsMap } = useCountriesAndStates();
	const showCountryFields = countryOptions.length > 0;

	const [ name, setName ] = useState( initialValues.name ?? '' );
	const [ countryValue, setCountry ] = useState( initialValues.country ?? '' );
	const [ city, setCity ] = useState( initialValues.city ?? '' );
	const [ line1, setLine1 ] = useState( initialValues.line1 ?? '' );
	const [ line2, setLine2 ] = useState( initialValues.line2 ?? '' );
	const [ postalCode, setPostalCode ] = useState( initialValues.postalCode ?? '' );
	const [ addressState, setAddressState ] = useState( initialValues.state ?? '' );

	const country = getCountry( countryValue, countryOptions );
	const stateOptions = stateOptionsMap.hasOwnProperty( country )
		? stateOptionsMap[ country ]
		: false;
	const payload: PartnerDetailsPayload = {
		name,
		city,
		line1,
		line2,
		country,
		postalCode,
		state: addressState,
		...( includeTermsOfService ? { tos: 'consented' } : {} ),
	};

	const handleSubmit = useCallback(
		( e ) => {
			e.preventDefault();

			if ( ! showCountryFields || isLoading ) {
				return;
			}

			onSubmit( payload );
		},
		[ showCountryFields, isLoading, onSubmit, payload ]
	);

	return (
		<div className="company-details-form">
			<form onSubmit={ handleSubmit }>
				<FormFieldset>
					<FormLabel htmlFor="name">{ translate( 'Company name' ) }</FormLabel>
					<FormTextInput
						id="name"
						name="name"
						value={ name }
						onChange={ ( event: any ) => setName( event.target.value ) }
						disabled={ isLoading }
					/>
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Country' ) }</FormLabel>
					{ showCountryFields && (
						<SelectDropdown
							className="company-details-form__dropdown"
							initialSelected={ country }
							options={ countryOptions }
							onSelect={ ( option: any ) => {
								setCountry( option.value );
								// Reset the value of state since it no longer matches with the selected country.
								setAddressState( '' );
							} }
							disabled={ isLoading }
							isLoading={ countryOptions.length === 0 }
						/>
					) }

					{ ! showCountryFields && <TextPlaceholder /> }
				</FormFieldset>

				{ showCountryFields && stateOptions && (
					<FormFieldset>
						<FormLabel>{ translate( 'State' ) }</FormLabel>
						<SelectDropdown
							className="company-details-form__dropdown"
							initialSelected={ addressState }
							options={ stateOptions }
							onSelect={ ( option: any ) => {
								setAddressState( option.value );
							} }
							disabled={ isLoading }
						/>
					</FormFieldset>
				) }

				<FormFieldset className="company-details-form__business-address">
					<FormLabel>{ translate( 'Business address' ) }</FormLabel>
					<FormTextInput
						id="line1"
						name="line1"
						placeholder={ translate( 'Street name and house number' ) }
						value={ line1 }
						onChange={ ( event: any ) => setLine1( event.target.value ) }
						disabled={ isLoading }
					/>
					<FormTextInput
						id="line2"
						name="line2"
						placeholder={ translate( 'Apartment, floor, suite or unit number' ) }
						value={ line2 }
						onChange={ ( event: any ) => setLine2( event.target.value ) }
						disabled={ isLoading }
					/>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="postalCode">{ translate( 'Postal code' ) }</FormLabel>
					<FormTextInput
						id="postalCode"
						name="postalCode"
						value={ postalCode }
						onChange={ ( event: any ) => setPostalCode( event.target.value ) }
						disabled={ isLoading }
					/>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="city">{ translate( 'City' ) }</FormLabel>
					<FormTextInput
						id="city"
						name="city"
						value={ city }
						onChange={ ( event: any ) => setCity( event.target.value ) }
						disabled={ isLoading }
					/>
				</FormFieldset>

				{ includeTermsOfService && (
					<div className="company-details-form__tos">
						<p>
							{ translate(
								'By clicking ‘Continue’, you agree to the{{break}}{{/break}}{{link}}%(link_text)s{{icon}}{{/icon}}{{/link}}.',
								{
									components: {
										break: <br />,
										link: (
											<a
												href="https://jetpack.com/platform-agreement/"
												target="_blank"
												rel="noopener noreferrer"
											></a>
										),
										icon: <Gridicon icon="external" size={ 18 } />,
									},
									args: { link_text: 'Terms of the Jetpack Agency Platform Agreement' },
								}
							) }
						</p>
					</div>
				) }

				<div className="company-details-form__controls">
					<Button
						primary
						type="submit"
						className="company-details-form__submit"
						disabled={ ! showCountryFields || isLoading }
						busy={ isLoading }
					>
						{ submitLabel }
					</Button>
				</div>
			</form>
		</div>
	);
}
