import { Button, Gridicon, FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useMemo, ChangeEvent, useEffect } from 'react';
import SearchableDropdown from 'calypso/a8c-for-agencies/components/searchable-dropdown';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import MultiCheckbox, { ChangeList } from 'calypso/components/forms/multi-checkbox';
import { Option as CountryOption, useCountriesAndStates } from './hooks/use-countries-and-states';
import { AgencyDetailsPayload } from './types';
import type { FormEventHandler } from 'react';

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
	referer?: string | null;
	initialValues?: {
		agencyName?: string;
		agencyUrl?: string;
		managedSites?: string;
		servicesOffered?: string[];
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
	referer,
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
	const [ managedSites, setManagedSites ] = useState( initialValues.managedSites ?? '1-20' );
	const [ servicesOffered, setServicesOffered ] = useState( initialValues.servicesOffered ?? [] );

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
			managedSites,
			servicesOffered,
			city,
			line1,
			line2,
			country,
			postalCode,
			state: addressState,
			referer,
			...( includeTermsOfService ? { tos: 'consented' } : {} ),
		} ),
		[
			agencyName,
			agencyUrl,
			managedSites,
			servicesOffered,
			city,
			line1,
			line2,
			country,
			postalCode,
			addressState,
			referer,
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

	const getServicesOfferedOptions = () => {
		return [
			{ value: 'strategy_consulting', label: translate( 'Strategy consulting' ) },
			{ value: 'website_design_development', label: translate( 'Website design & development' ) },
			{ value: 'performance_optimization', label: translate( 'Performance optimization' ) },
			{ value: 'digital_strategy_marketing', label: translate( 'Digital strategy & marketing' ) },
			{ value: 'maintenance_support_plans', label: translate( 'Maintenance & support plans' ) },
		];
	};

	// <FormSelect> complains if we "just" pass "setManagedSites" because it expects
	// React.FormEventHandler, so this wrapper function is made to satisfy everything
	// in an easily readable way.
	const handleSetManagedSites: FormEventHandler = ( { target } ) => {
		const value: string = ( target as HTMLSelectElement ).value;
		setManagedSites( value );
	};

	const handleSetServicesOffered = ( services: ChangeList< string > ) => {
		setServicesOffered( services.value );
	};

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
					<FormLabel htmlFor="managed_sites">
						{ translate( 'How many sites do you manage?' ) }
					</FormLabel>
					<FormSelect
						name="managed_sites"
						id="managed_sites"
						value={ managedSites }
						onChange={ handleSetManagedSites }
					>
						<option value="1-5">{ translate( '1-5' ) }</option>
						<option value="6-25">{ translate( '6-25' ) }</option>
						<option value="26-50">{ translate( '26-50' ) }</option>
						<option value="51-100">{ translate( '51-100' ) }</option>
						<option value="101-500">{ translate( '101-500' ) }</option>
						<option value="501+">{ translate( '501+' ) }</option>
					</FormSelect>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="services_offered">
						{ translate( 'What services do you offer?', {
							comment:
								'Possible values are: "Strategy consulting", "Website design & development", "Performance optimization", "Digital strategy & marketing", "Maintenance & support plans".',
						} ) }
					</FormLabel>
					<MultiCheckbox
						id="services_offered"
						name="services_offered"
						checked={ servicesOffered }
						options={ getServicesOfferedOptions() }
						// // Using 'as any' to bypass TypeScript type checks due to a known and intentional type mismatch between
						// the expected custom event type for `onChange` and the standard event types.
						onChange={ handleSetServicesOffered as any }
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
												href="https://automattic.com/for/agencies/partnership-agreement"
												target="_blank"
												rel="noopener noreferrer"
											></a>
										),
										icon: <Gridicon icon="external" size={ 18 } />,
									},
									args: { link_text: 'Terms of the Automattic for Agencies Partnership Agreement' },
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
