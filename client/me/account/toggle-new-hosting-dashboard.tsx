import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import {
	getPreference,
	isSavingPreference,
	isFetchingPreferences,
} from 'calypso/state/preferences/selectors';
import type { HostingDashboardOptIn } from '@automattic/api-core';

export default function ToggleNewHostingDashboard() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const enableNewHostingDashboard = useSelector(
		( state ) =>
			getPreference( state, 'hosting-dashboard-opt-in' ) as HostingDashboardOptIn | undefined
	);

	const isSaving = useSelector( isSavingPreference );
	const isFetching = useSelector( isFetchingPreferences );

	const handleChange = ( value: boolean ) => {
		dispatch(
			recordTracksEvent( 'calypso_account_new_hosting_dashboard_toggle', {
				enabled: value,
			} )
		);

		const preference = {
			value: value ? 'opt-in' : 'opt-out',
			updated_at: new Date().toISOString(),
		} satisfies HostingDashboardOptIn;

		dispatch( savePreference( 'hosting-dashboard-opt-in', preference ) );
	};

	return (
		<div>
			<ToggleControl
				checked={ enableNewHostingDashboard?.value === 'opt-in' }
				onChange={ handleChange }
				disabled={ isSaving || isFetching }
				label={ translate( 'Try the new Hosting Dashboard' ) }
			/>
		</div>
	);
}
