import { RadioControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, isSavingPreference } from 'calypso/state/preferences/selectors';
import { useState, useEffect } from 'react';

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

	// Sync local state with Redux state when component mounts or Redux state changes
	useEffect( () => {
		if ( useSitesAsLandingPage ) {
			setSelectedOption( useReaderAsLandingPage ? 'reader' : 'my-sites' );
		} else {
			setSelectedOption( 'default' );
		}
	}, [ useSitesAsLandingPage, useReaderAsLandingPage ] );

	async function handlePreferenceChange( selectedOption: string ) {
		// Update local state for instant UI feedback
		setSelectedOption( selectedOption );

		console.log( 'selectedOption', selectedOption );

		let preferenceKey = null;
		let preference = { landingPage: selectedOption, updatedAt: Date.now() };

		if ( selectedOption === 'my-sites' ) {
			preferenceKey = 'sites-landing-page';
		} else if ( selectedOption === 'reader' ) {
			preferenceKey = 'reader-landing-page';
		} else if ( selectedOption === 'default' ) {
			// Handle default case: reset both preferences to unset state
			await dispatch( savePreference( 'sites-landing-page', null ) );
			await dispatch( savePreference( 'reader-landing-page', null ) );
			dispatch(
				successNotice( translate( 'Settings reset to default successfully!' ), {
					id: 'sites-landing-page-reset',
					duration: 10000,
				} )
			);
			return;
		}

		if ( preferenceKey ) {
			await dispatch( savePreference( preferenceKey, preference ) );

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
