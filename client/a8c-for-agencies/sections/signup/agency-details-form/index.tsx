import { Button, Gridicon, FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useMemo, ChangeEvent, useEffect } from 'react';
import SearchableDropdown from 'calypso/a8c-for-agencies/components/searchable-dropdown';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
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
		agencyUrl?: string;
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
	const [ agencyUrl, setAgencyUrl ] = useState( initialValues.agencyUrl ?? '' );

	const country = getCountry( countryValue, countryOptions );
	const stateOptions = stateOptionsMap[ country ];

	useEffect( () => {
		// Reset the value of state since our options have changed.
		setAddressState( stateOptions?.length ? stateOptions[ 0 ].value : '' );
	}, [ stateOptions ] );

	const payload: AgencyDetailsPayload = useMemo(
		() => ( {
			agencyName,
			agencyUrl,
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
			agencyUrl,
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
					<FormLabel htmlFor="agencyUrl">{ translate( 'Business URL' ) }</FormLabel>
					<FormTextInput
						id="agencyUrl"
						name="agencyUrl"
						value={ agencyUrl }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setAgencyUrl( event.target.value )
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
