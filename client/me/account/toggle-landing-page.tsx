import { RadioControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
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
	const { sitesAsLandingPage, readerAsLandingPage } = useSelector( ( state ) => ( {
		sitesAsLandingPage: getPreference( state, 'sites-landing-page' )?.useSitesAsLandingPage,
		readerAsLandingPage: getPreference( state, 'reader-landing-page' )?.useReaderAsLandingPage,
	} ) );

	let preference = 'default';
	if ( sitesAsLandingPage ) {
		preference = 'my-sites';
	} else if ( readerAsLandingPage ) {
		preference = 'reader';
	}

	// Local state to handle selected option
	const [ selectedOption, setSelectedOption ] = useState( preference );
	const isSaving = useSelector( isSavingPreference );

	async function handlePreferenceChange( selectedOption: string ) {
		setSelectedOption( selectedOption );
		try {
			const updatedAt = Date.now();
			await dispatch(
				savePreference( SITES_AS_LANDING_PAGE_PREFERENCE, {
					useSitesAsLandingPage: 'my-sites' === selectedOption,
					updatedAt,
				} )
			);
			await dispatch(
				savePreference( READER_AS_LANDING_PAGE_PREFERENCE, {
					useReaderAsLandingPage: 'reader' === selectedOption,
					updatedAt,
				} )
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
					{ label: translate( 'All my sites' ), value: 'my-sites' },
					{ label: translate( 'The Reader' ), value: 'reader' },
				] }
				onChange={ handlePreferenceChange }
				disabled={ isSaving }
			/>
		</div>
	);
}

export default ToggleLandingPageSettings;
