import { Card } from '@automattic/components';
import { FormToggle } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useId } from 'react';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import {
	getPreference,
	isSavingPreference,
	isFetchingPreferences,
} from 'calypso/state/preferences/selectors';
import type { HostingDashboardOptIn } from '@automattic/api-core';

import './hosting-dashboard-opt-in-form.scss';

export default function HostingDashboardOptInForm() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const toggleId = useId();

	const savedPreference = useSelector(
		( state ) => getPreference( state, 'hosting-dashboard-opt-in' ) as HostingDashboardOptIn | null
	);
	const isSaving = useSelector( isSavingPreference );
	const isFetching = useSelector( isFetchingPreferences );

	const isEnabled = savedPreference?.value === 'opt-in';

	const handleToggle = async () => {
		const newValue = ! isEnabled;

		dispatch(
			recordTracksEvent( 'calypso_account_new_hosting_dashboard_toggle_click', {
				enabled: newValue,
			} )
		);

		const preference = {
			value: newValue ? 'opt-in' : 'opt-out',
			updated_at: new Date().toISOString(),
		} satisfies HostingDashboardOptIn;

		try {
			await dispatch( savePreference( 'hosting-dashboard-opt-in', preference ) );

			if ( newValue ) {
				window.location.href = dashboardLink( '/me/preferences?flash=dashboard' );
			} else {
				dispatch(
					successNotice( translate( 'New Hosting Dashboard disabled.' ), { duration: 5000 } )
				);
			}
		} catch {
			dispatch(
				errorNotice(
					newValue
						? translate( 'Failed to enable new Hosting Dashboard.' )
						: translate( 'Failed to disable new Hosting Dashboard.' ),
					{ duration: 5000 }
				)
			);
		}
	};

	return (
		<Card className="account__settings hosting-dashboard-opt-in">
			<div className="hosting-dashboard-opt-in__header">
				<label htmlFor={ toggleId } className="hosting-dashboard-opt-in__label">
					{ translate( 'Try the new Hosting Dashboard' ) }
				</label>
				<FormToggle
					id={ toggleId }
					checked={ isEnabled }
					onChange={ handleToggle }
					disabled={ isFetching || isSaving }
				/>
			</div>
			<p className="hosting-dashboard-opt-in__description">
				{ translate(
					"We've recently updated the dashboard with a modern design and smarter tools for managing your hosting."
				) }
			</p>
		</Card>
	);
}
