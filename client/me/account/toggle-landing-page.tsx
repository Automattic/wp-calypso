import { RadioControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, isSavingPreference } from 'calypso/state/preferences/selectors';
import { READER_AS_LANDING_PAGE_PREFERENCE } from 'calypso/state/sites/selectors/has-reader-as-landing-page';
import { SITES_AS_LANDING_PAGE_PREFERENCE } from 'calypso/state/sites/selectors/has-sites-as-landing-page';

function ToggleLandingPageSettings() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const useSitesAsLandingPage = useSelector(
		( state ) => getPreference( state, 'sites-landing-page' )?.useSitesAsLandingPage
	);
	const useReaderAsLandingPage = useSelector(
		( state ) => getPreference( state, 'reader-landing-page' )?.useReaderAsLandingPage
	);
	const isSaving = useSelector( isSavingPreference );

	// Local state to handle selected option
	const [ selectedOption, setSelectedOption ] = useState( 'default' );

	useEffect( () => {
		if ( useSitesAsLandingPage ) {
			setSelectedOption( 'my-sites' );
		} else if ( useReaderAsLandingPage ) {
			setSelectedOption( 'reader' );
		}
	}, [ useSitesAsLandingPage, useReaderAsLandingPage ] );

	async function handlePreferenceChange( selectedOption: string ) {
		try {
			setSelectedOption( selectedOption );

			const useSitesAsLandingPagePreference = {
				useSitesAsLandingPage: false,
				updatedAt: Date.now(),
			};
			const useReaderAsLandingPagePreference = {
				useReaderAsLandingPage: false,
				updatedAt: Date.now(),
			};

			if ( selectedOption === 'my-sites' ) {
				useSitesAsLandingPagePreference.useSitesAsLandingPage = true;
			} else if ( selectedOption === 'reader' ) {
				useReaderAsLandingPagePreference.useReaderAsLandingPage = true;
			}

			await dispatch(
				savePreference( SITES_AS_LANDING_PAGE_PREFERENCE, useSitesAsLandingPagePreference )
			);
			await dispatch(
				savePreference( READER_AS_LANDING_PAGE_PREFERENCE, useReaderAsLandingPagePreference )
			);

			dispatch(
				successNotice( translate( 'Settings saved successfully!' ), {
					id: 'sites-landing-page-save',
					duration: 10000,
				} )
			);

			dispatch(
				recordTracksEvent( 'calypso_settings_sites_dashboard_landing_page_toggle', {
					landing_page_option: selectedOption,
				} )
			);
		} catch ( error ) {
			dispatch(
				errorNotice(
					translate( 'An error occurred while saving your preferences. Please try again.' ),
					{
						id: 'sites-landing-page-error',
						duration: 10000,
					}
				)
			);
		}
	}

	return (
		<div>
			<RadioControl
				selected={ selectedOption }
				options={ [
					{ label: translate( 'My primary site' ), value: 'default' },
					{ label: translate( 'All sites' ), value: 'my-sites' },
					{ label: translate( 'The reader' ), value: 'reader' },
				] }
				onChange={ handlePreferenceChange }
				disabled={ isSaving }
			/>
		</div>
	);
}

export default ToggleLandingPageSettings;
