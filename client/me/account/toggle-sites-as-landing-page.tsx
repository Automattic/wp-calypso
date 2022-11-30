import { ToggleControl as OriginalToggleControl } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, isSavingPreference } from 'calypso/state/preferences/selectors';

const ToggleControl = OriginalToggleControl as React.ComponentType<
	OriginalToggleControl.Props & {
		disabled?: boolean;
	}
>;

function ToggleSitesAsLandingPage() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const useSitesAsLandingPage = useSelector(
		( state ) => getPreference( state, 'sites-landing-page' )?.useSitesAsLandingPage
	);
	const isSaving = useSelector( ( state ) => isSavingPreference( state ) );

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

	const label = createInterpolateElement(
		translate( 'Make the <a>Sites page</a> my default landing page.' ),
		{
			a: <a href="/sites" target="_blank" rel="noopener noreferrer" />,
		}
	);

	return (
		<div>
			<ToggleControl
				checked={ !! useSitesAsLandingPage }
				onChange={ handleToggle }
				disabled={ isSaving }
				label={ label }
			/>
		</div>
	);
}

export default ToggleSitesAsLandingPage;
