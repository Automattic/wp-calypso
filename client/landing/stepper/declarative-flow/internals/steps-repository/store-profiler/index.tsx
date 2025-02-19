/* eslint-disable no-console */
import { Button, FormInputValidation, FormLabel } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormInput from 'calypso/components/forms/form-text-input';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import useSiteVerticalsFeatured from 'calypso/data/site-verticals/use-site-verticals-featured';
import { useCountriesAndStates } from 'calypso/jetpack-cloud/sections/partner-portal/company-details-form/hooks/use-countries-and-states';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE, USER_STORE } from '../../../../stores';
import type { Step } from '../../types';
import type { UserSelect } from '@automattic/data-stores';
import './style.scss';

const StoreProfiler: Step = function StoreProfiler( { navigation } ) {
	const { goBack, goNext, submit } = navigation;
	const [ siteTitle, setSiteTitle ] = React.useState( '' );
	const [ verticalId, setVerticalId ] = React.useState( '' );
	const [ storeCountryCode, setStoreCountryCode ] = React.useState( '' );
	const translate = useTranslate();
	const currentUser = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
		[]
	);
	const {
		setSiteTitle: saveSiteTitleToStore,
		setVerticalId: saveVerticalIdToStore,
		setStoreLocationCountryCode: saveCountryCodeToStore,
	} = useDispatch( ONBOARD_STORE );

	const verticals = useSiteVerticalsFeatured();
	const verticalsOptions = React.useMemo( () => {
		const sorted = verticals.data?.sort( ( a, b ) => {
			if ( a.title === b.title ) {
				return 0;
			}
			return a.title > b.title ? 1 : -1;
		} );
		const options = sorted?.map( ( v ) => (
			<option value={ v.id } key={ v.id }>
				{ v.title }
			</option>
		) );
		options?.unshift(
			<option value="" key="">
				{ translate( '- Select Industry -' ) }
			</option>
		);
		return options;
	}, [ verticals, translate ] );
	const countriesAndStates = useCountriesAndStates();
	const countriesOptions = React.useMemo( () => {
		return countriesAndStates.countryOptions.map( ( c ) => (
			<option value={ c.value } key={ c.value }>
				{ c.label }
			</option>
		) );
	}, [ countriesAndStates ] );

	const region = useGeoLocationQuery()?.data;

	useEffect( () => {
		if ( ! storeCountryCode && region ) {
			setStoreCountryCode( region?.country_short );
		}
	}, [ region ] );

	const isLoading = verticals.isLoading || ! countriesAndStates;

	const handleSubmit = async ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( currentUser ) {
			saveSiteTitleToStore( siteTitle );
			saveVerticalIdToStore( verticalId );
			saveCountryCodeToStore( storeCountryCode );
			recordTracksEvent( 'calypso_signup_store_profiler_submit', {
				has_site_title: !! siteTitle,
				has_vertical: !! verticalId,
				has_location: !! storeCountryCode,
			} );

			submit?.( {
				siteTitle: siteTitle,
				verticalId: verticalId,
				storeLocationCountryCode: storeCountryCode,
			} );
		}
	};
	const onChange = ( event: React.FormEvent< HTMLInputElement | HTMLSelectElement > ) => {
		if ( currentUser ) {
			switch ( event.currentTarget.name ) {
				case 'siteTitle':
					return setSiteTitle( event.currentTarget.value );
				case 'siteVertical':
					return setVerticalId( event.currentTarget.value );
				case 'siteCountry':
					return setStoreCountryCode( event.currentTarget.value );
			}
		}
	};

	const siteTitleError = null;

	const stepContent = (
		<form className="store-profiler__form" onSubmit={ handleSubmit }>
			<FormFieldset disabled={ isLoading } className="store-profiler__form-fieldset">
				<FormLabel htmlFor="siteTitle" optional>
					{ translate( 'Name of your store' ) }{ ' ' }
				</FormLabel>
				<FormInput
					name="siteTitle"
					id="siteTitle"
					value={ siteTitle }
					isError={ siteTitleError }
					onChange={ onChange }
				/>
				{ siteTitleError && <FormInputValidation isError text={ siteTitleError } /> }
			</FormFieldset>
			<FormFieldset disabled={ isLoading } className="store-profiler__form-fieldset">
				<FormLabel htmlFor="siteVertical" optional>
					{ translate( 'In which industry does your store operate?' ) }{ ' ' }
				</FormLabel>
				<FormSelect
					name="siteVertical"
					id="siteVertical"
					value={ verticalId }
					onChange={ onChange }
				>
					{ verticalsOptions }
				</FormSelect>
			</FormFieldset>
			<FormFieldset disabled={ isLoading } className="store-profiler__form-fieldset">
				<FormLabel htmlFor="siteCountry" optional>
					{ translate( 'Where will your business be located?' ) }{ ' ' }
				</FormLabel>
				<FormSelect
					name="siteCountry"
					id="siteCountry"
					value={ storeCountryCode }
					onChange={ onChange }
				>
					{ countriesOptions }
				</FormSelect>
			</FormFieldset>

			<Button
				disabled={ isLoading }
				className="store-profiler__submit-button"
				type="submit"
				primary
			>
				{ translate( 'Continue' ) }
			</Button>
		</form>
	);

	return (
		<StepContainer
			stepName="store-profiler"
			skipButtonAlign="top"
			goBack={ goBack }
			hideBack
			goNext={ goNext }
			formattedHeader={
				<FormattedHeader
					id="store-profiler-header"
					headerText={ translate( 'Tell us a bit about your store' ) }
					subHeaderText={ translate(
						"We'll use this information to help you set up payments, shipping, and taxes, and recommend you the best theme."
					) }
					align="center"
				/>
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default StoreProfiler;
