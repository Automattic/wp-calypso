import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useMemo, ChangeEvent, useEffect } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormTextInput from 'calypso/components/forms/form-text-input';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { PartnerDetailsPayload } from 'calypso/state/partner-portal/types';
import SearchableDropdown from '../searchable-dropdown';
import { Option as CountryOption, useCountriesAndStates } from './hooks/use-countries-and-states';

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
	onSubmit: ( payload: PartnerDetailsPayload ) => void;
	referrer?: string;
	initialValues?: {
		name?: string;
		contactPerson?: string;
		companyWebsite?: string;
		companyType?: string;
		city?: string;
		line1?: string;
		line2?: string;
		country?: string;
		postalCode?: string;
		state?: string;
	};
	submitLabel: string;
}

export default function CompanyDetailsForm( {
	includeTermsOfService = false,
	isLoading,
	initialValues = {},
	onSubmit,
	submitLabel,
	referrer,
}: Props ) {
	const translate = useTranslate();
	const { countryOptions, stateOptionsMap } = useCountriesAndStates();
	const showCountryFields = countryOptions.length > 0;

	const [ name, setName ] = useState( initialValues.name ?? '' );
	const [ countryValue, setCountryValue ] = useState( initialValues.country ?? '' );
	const [ city, setCity ] = useState( initialValues.city ?? '' );
	const [ line1, setLine1 ] = useState( initialValues.line1 ?? '' );
	const [ line2, setLine2 ] = useState( initialValues.line2 ?? '' );
	const [ postalCode, setPostalCode ] = useState( initialValues.postalCode ?? '' );
	const [ addressState, setAddressState ] = useState( initialValues.state ?? '' );
	const [ contactPerson, setContactPerson ] = useState( initialValues.contactPerson ?? '' );
	const [ companyWebsite, setCompanyWebsite ] = useState( initialValues.companyWebsite ?? '' );
	const [ companyType, setCompanyType ] = useState( initialValues.companyType ?? '' );

	const country = getCountry( countryValue, countryOptions );
	const stateOptions = stateOptionsMap[ country ];

	useEffect( () => {
		// Reset the value of state since our options have changed.
		setAddressState( stateOptions?.length ? stateOptions[ 0 ].value : '' );
	}, [ stateOptions ] );

	const payload: PartnerDetailsPayload = useMemo(
		() => ( {
			name,
			contactPerson,
			companyWebsite,
			companyType,
			city,
			line1,
			line2,
			country,
			postalCode,
			referrer,
			state: addressState,
			...( includeTermsOfService ? { tos: 'consented' } : {} ),
		} ),
		[
			name,
			contactPerson,
			companyWebsite,
			companyType,
			city,
			line1,
			line2,
			country,
			postalCode,
			referrer,
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
		<div className="company-details-form">
			<form onSubmit={ handleSubmit }>
				<FormFieldset>
					<FormLabel htmlFor="name">{ translate( 'Company name' ) }</FormLabel>
					<FormTextInput
						id="name"
						name="name"
						value={ name }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) => setName( event.target.value ) }
						disabled={ isLoading }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="contactPerson">
						{ translate( 'Contact first and last name' ) }
					</FormLabel>
					<FormTextInput
						id="contactPerson"
						name="contactPerson"
						value={ contactPerson }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setContactPerson( event.target.value )
						}
						disabled={ isLoading }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="companyWebsite">{ translate( 'Company website' ) }</FormLabel>
					<FormTextInput
						id="companyWebsite"
						name="companyWebsite"
						value={ companyWebsite }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setCompanyWebsite( event.target.value )
						}
						disabled={ isLoading }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel>{ translate( 'Which answer below best describes your company:' ) }</FormLabel>
					<FormRadio
						label={ translate( 'Agency' ) }
						value="agency"
						checked={ companyType === 'agency' }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setCompanyType( event.target.value )
						}
						disabled={ isLoading }
						className={ undefined }
					/>
					<FormRadio
						label={ translate( 'Freelancer/Pro' ) }
						value="freelancer"
						checked={ companyType === 'freelancer' }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setCompanyType( event.target.value )
						}
						disabled={ isLoading }
						className={ undefined }
					/>
					<FormRadio
						label={ translate( 'A business with multiple sites' ) }
						value="business"
						checked={ companyType === 'business' }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setCompanyType( event.target.value )
						}
						disabled={ isLoading }
						className={ undefined }
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
				<FormFieldset className="company-details-form__business-address">
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
