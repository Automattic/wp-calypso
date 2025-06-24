import { RadioControl } from '@wordpress/components';
import { fixMe, useTranslate } from 'i18n-calypso';
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
	const sitesAsLandingPage = useSelector(
		( state ) => getPreference( state, 'sites-landing-page' )?.useSitesAsLandingPage
	);
	const readerAsLandingPage = useSelector(
		( state ) => getPreference( state, 'reader-landing-page' )?.useReaderAsLandingPage
	);

	let selectedOption = 'default';
	if ( sitesAsLandingPage ) {
		selectedOption = 'my-sites';
	} else if ( readerAsLandingPage ) {
		selectedOption = 'reader';
	}

	const isSaving = useSelector( isSavingPreference );

	async function handlePreferenceChange( selectedOption: string ) {
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

	const primarySiteLabel = fixMe( {
		text: 'Primary site dashboard',
		newCopy: translate( 'Primary site dashboard' ),
		oldCopy: translate( 'My primary site' ),
	} ) as string;

	return (
		<div>
			<RadioControl
				selected={ selectedOption }
				options={ [
					{ label: primarySiteLabel, value: 'default' },
					{ label: translate( 'Sites' ), value: 'my-sites' },
					{ label: translate( 'Reader' ), value: 'reader' },
				] }
				onChange={ handlePreferenceChange }
				disabled={ isSaving }
			/>
		</div>
	);
}

export default ToggleLandingPageSettings;
