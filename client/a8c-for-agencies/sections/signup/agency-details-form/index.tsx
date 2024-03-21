import { Button, Gridicon, FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useMemo, ChangeEvent, useEffect } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import SearchableDropdown from '../../../components/searchable-dropdown';
import { Option as CountryOption, useCountriesAndStates } from './hooks/use-countries-and-states';
import { AgencyDetailsPayload } from './types';

import './style.scss';

function getCountry( country: string, options: CountryOption[] ): string {
	if ( options.length < 1 ) {
		return country;
	}

	for ( let i = 0; i < options.length; i++ ) {
		if ( options[ i ].value === country ) {
			return country;
		}
	}

	return options[ 0 ].value;
}

interface Props {
	includeTermsOfService?: boolean;
	isLoading: boolean;
	onSubmit: ( payload: AgencyDetailsPayload ) => void;
	initialValues?: {
		agencyName?: string;
		businessUrl?: string;
		city?: string;
		line1?: string;
		line2?: string;
		country?: string;
		postalCode?: string;
		state?: string;
	};
	submitLabel: string;
}

export default function AgencyDetailsForm( {
	includeTermsOfService = false,
	isLoading,
	initialValues = {},
	onSubmit,
	submitLabel,
}: Props ) {
	const translate = useTranslate();
	const { countryOptions, stateOptionsMap } = useCountriesAndStates();
	const showCountryFields = countryOptions.length > 0;

	const [ countryValue, setCountryValue ] = useState( initialValues.country ?? '' );
	const [ city, setCity ] = useState( initialValues.city ?? '' );
	const [ line1, setLine1 ] = useState( initialValues.line1 ?? '' );
	const [ line2, setLine2 ] = useState( initialValues.line2 ?? '' );
	const [ postalCode, setPostalCode ] = useState( initialValues.postalCode ?? '' );
	const [ addressState, setAddressState ] = useState( initialValues.state ?? '' );
	const [ agencyName, setAgencyName ] = useState( initialValues.agencyName ?? '' );
	const [ businessUrl, setBusinessUrl ] = useState( initialValues.businessUrl ?? '' );

	const country = getCountry( countryValue, countryOptions );
	const stateOptions = stateOptionsMap[ country ];

	useEffect( () => {
		// Reset the value of state since our options have changed.
		setAddressState( stateOptions?.length ? stateOptions[ 0 ].value : '' );
	}, [ stateOptions ] );

	const payload: AgencyDetailsPayload = useMemo(
		() => ( {
			agencyName,
			businessUrl,
			city,
			line1,
			line2,
			country,
			postalCode,
			state: addressState,
			...( includeTermsOfService ? { tos: 'consented' } : {} ),
		} ),
		[
			agencyName,
			businessUrl,
			city,
			line1,
			line2,
			country,
			postalCode,
			addressState,
			includeTermsOfService,
		]
	);

	const handleSubmit = useCallback(
		( e: React.SyntheticEvent ) => {
			e.preventDefault();

			if ( ! showCountryFields || isLoading ) {
				return;
			}

			onSubmit( payload );
		},
		[ showCountryFields, isLoading, onSubmit, payload ]
	);

	return (
		<div className="agency-details-form">
			<form onSubmit={ handleSubmit }>
				<FormFieldset>
					<FormLabel htmlFor="agencyName">{ translate( 'Agency name' ) }</FormLabel>
					<FormTextInput
						id="agencyName"
						name="agencyName"
						value={ agencyName }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setAgencyName( event.target.value )
						}
						disabled={ isLoading }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="businessUrl">{ translate( 'Business URL' ) }</FormLabel>
					<FormTextInput
						id="businessUrl"
						name="businessUrl"
						value={ businessUrl }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setBusinessUrl( event.target.value )
						}
						disabled={ isLoading }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel>{ translate( 'Country' ) }</FormLabel>
					{ showCountryFields && (
						<SearchableDropdown
							value={ countryValue }
							onChange={ ( value ) => {
								setCountryValue( value ?? '' );
							} }
							options={ countryOptions }
							disabled={ isLoading }
						/>
					) }

					{ ! showCountryFields && <TextPlaceholder /> }
				</FormFieldset>
				{ showCountryFields && stateOptions && (
					<FormFieldset>
						<FormLabel>{ translate( 'State' ) }</FormLabel>
						<SearchableDropdown
							value={ addressState }
							onChange={ ( value ) => setAddressState( value ?? '' ) }
							options={ stateOptions }
							disabled={ isLoading }
							allowReset={ false }
						/>
					</FormFieldset>
				) }
				<FormFieldset className="agency-details-form__business-address">
					<FormLabel>{ translate( 'Business address' ) }</FormLabel>
					<FormTextInput
						id="line1"
						name="line1"
						placeholder={ translate( 'Street name and house number' ) }
						value={ line1 }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setLine1( event.target.value )
						}
						disabled={ isLoading }
					/>
					<FormTextInput
						id="line2"
						name="line2"
						placeholder={ translate( 'Apartment, floor, suite or unit number' ) }
						value={ line2 }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setLine2( event.target.value )
						}
						disabled={ isLoading }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="city">{ translate( 'City' ) }</FormLabel>
					<FormTextInput
						id="city"
						name="city"
						value={ city }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) => setCity( event.target.value ) }
						disabled={ isLoading }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="postalCode">{ translate( 'Postal code' ) }</FormLabel>
					<FormTextInput
						id="postalCode"
						name="postalCode"
						value={ postalCode }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setPostalCode( event.target.value )
						}
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
