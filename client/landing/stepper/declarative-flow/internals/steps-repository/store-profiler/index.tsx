/* eslint-disable no-console */
import { Button, FormInputValidation } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormInput from 'calypso/components/forms/form-text-input';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import type { Step } from '../../types';
import './style.scss';

const StoreProfiler: Step = function StoreProfiler( { navigation } ) {
	const { goBack, goNext, submit } = navigation;
	const [ siteTitle, setSiteTitle ] = React.useState( '' );
	const [ tagline, setTagline ] = React.useState( '' );
	const [ formTouched, setFormTouched ] = React.useState( false );
	const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
	const translate = useTranslate();
	const site = useSite();

	const { saveSiteSettings } = useDispatch( SITE_STORE );
	console.log( site );
	useEffect( () => {
		if ( ! site ) {
			return;
		}

		if ( formTouched ) {
			return;
		}

		setSiteTitle( site.name || '' );
		setTagline( site.description );
	}, [ site, formTouched ] );

	const handleSubmit = async ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( site ) {
			await saveSiteSettings( site.ID, {
				blogname: siteTitle,
			} );
			recordTracksEvent( 'calypso_signup_store_profiler_submit', {
				has_site_title: !! siteTitle,
			} );

			submit?.( { siteTitle, tagline } );
		}
	};
	const onChange = ( event: React.FormEvent< HTMLInputElement > ) => {
		if ( site ) {
			setFormTouched( true );

			switch ( event.currentTarget.name ) {
				case 'siteTitle':
					return setSiteTitle( event.currentTarget.value );
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

			<Button disabled={ ! site } className="store-profiler__submit-button" type="submit" primary>
				{ translate( 'Continue' ) }
			</Button>
		</form>
	);

	return (
		<StepContainer
			stepName="store-profiler"
			className={ `is-step-${ intent }` }
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
