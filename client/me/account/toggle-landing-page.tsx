import { RadioControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, isSavingPreference } from 'calypso/state/preferences/selectors';

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

	// Determine the selected option
	const getSelectedOption = () => {
		if ( useSitesAsLandingPage ) {
			return useReaderAsLandingPage ? 'reader' : 'my-sites';
		}
		return 'default';
	};

	async function handlePreferenceChange( selectedOption ) {
		const preference = { landingPage: selectedOption, updatedAt: Date.now() };
		const preferenceKey =
			selectedOption === 'my-sites' ? 'sites-landing-page' : 'reader-landing-page';

		await dispatch( savePreference( preferenceKey, preference ) );

		dispatch(
			successNotice( translate( 'Settings saved successfully!' ), {
				id: 'sites-landing-page-save',
				duration: 10000,
			} )
		);

		dispatch(
			recordTracksEvent( 'calypso_settings_sites_dashboard_landing_page_toggle', {
				sites_as_landing_page: useSitesAsLandingPage,
				reader_as_landing_page: useReaderAsLandingPage,
			} )
		);
	}

	return (
		<div>
			<RadioControl
				label={ translate( 'Choose your default landing page:' ) }
				selected={ getSelectedOption() }
				options={ [
					{ label: translate( 'Default site home page' ), value: 'default' },
					{ label: translate( 'My sites page' ), value: 'my-sites' },
					{ label: translate( 'Reader page' ), value: 'reader' },
				] }
				onChange={ handlePreferenceChange }
				disabled={ isSaving }
			/>
		</div>
	);
}

export default ToggleLandingPageSettings;
