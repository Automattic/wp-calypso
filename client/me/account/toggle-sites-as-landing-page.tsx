import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, isSavingPreference } from 'calypso/state/preferences/selectors';

function ToggleSitesAsLandingPage() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const useSitesAsLandingPage = useSelector(
		( state ) => getPreference( state, 'sites-landing-page' )?.useSitesAsLandingPage
	);
	const isSaving = useSelector( isSavingPreference );

	async function handleToggle( isChecked: boolean ) {
		const preference = { useSitesAsLandingPage: isChecked, updatedAt: Date.now() };
		await dispatch( savePreference( 'sites-landing-page', preference ) );

		dispatch(
			successNotice( translate( 'Settings saved successfully!' ), {
				id: 'sites-landing-page-save',
				duration: 10000,
			} )
		);

		dispatch(
			recordTracksEvent( 'calypso_settings_sites_dashboard_landing_page_toggle', {
				sites_as_landing_page: isChecked,
			} )
		);
	}

	return (
		<div>
			<ToggleControl
				checked={ !! useSitesAsLandingPage }
				onChange={ handleToggle }
				disabled={ isSaving }
				label={ translate(
					'Display all my sites instead of just my primary site when I visit WordPress.com.'
				) }
			/>
		</div>
	);
}

export default ToggleSitesAsLandingPage;
