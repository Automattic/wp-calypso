/* eslint-disable no-console */
import { Button, FormInputValidation } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import FormInput from 'calypso/components/forms/form-text-input';
import useSiteVerticalsFeatured from 'calypso/data/site-verticals/use-site-verticals-featured';
import { useCountries } from 'calypso/landing/stepper/hooks/use-countries';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { SITE_STORE, USER_STORE } from '../../../../stores';
import type { Step } from '../../types';
import './style.scss';

const StoreProfiler: Step = function StoreProfiler( { navigation } ) {
	const { goBack, goNext, submit } = navigation;
	const [ siteTitle, setSiteTitle ] = React.useState( '' );
	const [ vertical, setVertical ] = React.useState( '' );
	const [ country, setCountry ] = React.useState( '' );
	// const [ formTouched, setFormTouched ] = React.useState( false );
	const translate = useTranslate();
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const newUser = useSelect( ( select ) => select( USER_STORE ).getNewUser() );
	const site = { ID: 0 }; // TODO: how to we initialize new site programmatically?
	const verticals = useSiteVerticalsFeatured();
	const verticalsOptions = React.useMemo( () => {
		const sorted = verticals.data?.sort( ( a, b ) => {
			if ( a.name === b.name ) {
				return 0;
			}
			return a.name > b.name ? 1 : -1;
		} );
		return sorted?.map( ( v ) => (
			<option value={ v.id } key={ v.id }>
				{ v.name }
			</option>
		) );
	}, [ verticals ] );
	// TODO: This may not be the right source for this info.
	const countries = useCountries();
	const countriesOptions = React.useMemo( () => {
		const data = countries.data as Record< string, string >;
		console.log( data );
		const options = [];
		for ( const abbrev in data ) {
			const country = data[ abbrev ];
			options.push(
				<option value={ abbrev } key={ abbrev }>
					{ country }
				</option>
			);
		}
		return options;
	}, [ countries ] );

	const { saveSiteSettings } = useDispatch( SITE_STORE );
	console.log( { currentUser, newUser } );

	const handleSubmit = async ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( site ) {
			await saveSiteSettings( site.ID, {
				blogname: siteTitle,
			} );
			recordTracksEvent( 'calypso_signup_store_profiler_submit', {
				has_site_title: !! siteTitle,
			} );

			submit?.( { siteTitle } );
		}
	};
	const onChange = ( event: React.FormEvent< HTMLInputElement | HTMLSelectElement > ) => {
		if ( site ) {
			// setFormTouched( true );

			switch ( event.currentTarget.name ) {
				case 'siteTitle':
					return setSiteTitle( event.currentTarget.value );
				case 'siteVertical':
					return setVertical( event.currentTarget.value );
				case 'siteCountry':
					return setCountry( event.currentTarget.value );
			}
		}
	};

	const siteTitleError = null;

	const stepContent = (
		<form className="store-profiler__form" onSubmit={ handleSubmit }>
			<FormFieldset disabled={ ! site } className="store-profiler__form-fieldset">
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
			<FormFieldset disabled={ ! site } className="store-profiler__form-fieldset">
				<FormLabel htmlFor="siteVertical" optional>
					{ translate( 'In which industry does your store operate?' ) }{ ' ' }
				</FormLabel>
				<FormSelect name="siteVertical" id="siteVertical" value={ vertical } onChange={ onChange }>
					{ verticalsOptions }
				</FormSelect>
			</FormFieldset>
			<FormFieldset disabled={ ! site } className="store-profiler__form-fieldset">
				<FormLabel htmlFor="siteCountry" optional>
					{ translate( 'Where will your business be located?' ) }{ ' ' }
				</FormLabel>
				<FormSelect name="siteCountry" id="siteCountry" value={ country } onChange={ onChange }>
					{ countriesOptions }
				</FormSelect>
			</FormFieldset>

			<Button disabled={ ! site } className="store-profiler__submit-button" type="submit" primary>
				{ translate( 'Continue' ) }
			</Button>
		</form>
	);

	return (
		<StepContainer
			stepName="store-profiler"
			skipButtonAlign="top"
			goBack={ goBack }
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
