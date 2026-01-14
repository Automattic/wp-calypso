import { Card, ExternalLink } from '@automattic/components';
import { FormToggle } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useId, useState } from 'react';
import Banner from 'calypso/components/banner';
import FormFieldset from 'calypso/components/forms/form-fieldset';
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

	// We do not want the survey banner to disappear immediately after opting out
	// is complete. This state is used to keep it around until the component is unmounted.
	const [ optedOutThisMount, setOptedOutThisMount ] = useState( false );

	const showOptOutSurvey =
		( isSaving && savedPreference?.value === 'opt-out' ) ||
		( ! isSaving && savedPreference?.value === 'opt-out' && optedOutThisMount ) ||
		( ! isSaving && ! isEnabled && savedPreference?.value === 'opt-in' );

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
				setOptedOutThisMount( true );
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
			<div className="hosting-dashboard-opt-in__row">
				<div className="hosting-dashboard-opt-in__content">
					<label htmlFor={ toggleId } className="hosting-dashboard-opt-in__label">
						{ translate( 'Try the new Hosting Dashboard' ) }
					</label>
					<p className="hosting-dashboard-opt-in__description">
						{ translate(
							"We've recently updated the dashboard with a modern design and smarter tools for managing your hosting."
						) }
					</p>
				</div>
				<FormToggle
					id={ toggleId }
					checked={ isEnabled }
					onChange={ handleToggle }
					disabled={ isFetching || isSaving }
				/>
			</div>
			{ showOptOutSurvey && (
				<FormFieldset className="hosting-dashboard-opt-in__survey">
					<Banner
						title={ translate( 'Prefer the previous version?' ) }
						showIcon={ false }
						description={ translate(
							"{{surveyLink}}Please complete this short survey{{/surveyLink}} to help us understand what didn't work and how we can improve.",
							{
								components: {
									surveyLink: (
										<ExternalLink
											href="https://automattic.survey.fm/msd-survey-for-opt-out"
											icon
											onClick={ () =>
												dispatch(
													recordTracksEvent( 'calypso_account_new_hosting_dashboard_survey_click' )
												)
											}
										/>
									),
								},
							}
						) }
					/>
				</FormFieldset>
			) }
		</Card>
	);
}
