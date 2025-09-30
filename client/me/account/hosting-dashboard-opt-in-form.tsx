import { Card, FormLabel, ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Banner from 'calypso/components/banner';
import FormButton from 'calypso/components/forms/form-button';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SectionHeader from 'calypso/components/section-header';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import {
	getPreference,
	isSavingPreference,
	isFetchingPreferences,
	preferencesLastSaveError,
} from 'calypso/state/preferences/selectors';
import type { HostingDashboardOptIn } from '@automattic/api-core';

export default function HostingDashboardOptInForm() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const savedPreference = useSelector(
		( state ) => getPreference( state, 'hosting-dashboard-opt-in' ) as HostingDashboardOptIn | null
	);
	const isSaving = useSelector( isSavingPreference );
	const isFetching = useSelector( isFetchingPreferences );
	const lastSaveError = useSelector( preferencesLastSaveError );
	const [ isRedirecting, setIsRedirecting ] = useState( false );
	const [ enabled, setEnabled ] = useState( savedPreference?.value === 'opt-in' );

	// We do not want the survey banner to disappear immediately after opting out
	// is complete. This state is used to keep it around until the component is unmounted.
	const [ optedOutThisMount, setOptedOutThisMount ] = useState( false );

	const [ wasFetching, setWasFetching ] = useState( isFetching );
	if ( isFetching !== wasFetching ) {
		// Preferences have finished fetching
		setEnabled( savedPreference?.value === 'opt-in' );
		setWasFetching( isFetching );
	}

	const isDirty = enabled !== ( savedPreference?.value === 'opt-in' );

	const showOptOutSurvey =
		( isSaving && savedPreference?.value === 'opt-out' ) ||
		( ! isSaving && savedPreference?.value === 'opt-out' && optedOutThisMount ) ||
		( ! isSaving && ! enabled && savedPreference?.value === 'opt-in' );

	const handleSubmit = async ( event: React.FormEvent ) => {
		event.preventDefault();

		dispatch(
			recordTracksEvent( 'calypso_account_new_hosting_dashboard_toggle', {
				enabled,
			} )
		);

		const preference = {
			value: enabled ? 'opt-in' : 'opt-out',
			updated_at: new Date().toISOString(),
		} satisfies HostingDashboardOptIn;

		await dispatch( savePreference( 'hosting-dashboard-opt-in', preference ) );

		if ( lastSaveError ) {
			dispatch(
				errorNotice( translate( 'Failed to save preference.' ), {
					duration: 5000,
				} )
			);
		} else if ( enabled ) {
			setIsRedirecting( true );
			window.location.href = '/v2/me/preferences?updated=dashboard';
		} else {
			dispatch(
				successNotice( translate( 'Successfully saved preference.' ), {
					duration: 5000,
				} )
			);
			if ( ! enabled ) {
				setOptedOutThisMount( true );
			}
		}
	};

	return (
		<>
			<SectionHeader label={ translate( 'Try the new Hosting Dashboard' ) } />
			<Card className="account__settings">
				<form onSubmit={ handleSubmit }>
					<p className="account__hosting-dashboard-description">
						{ translate(
							'We’ve recently updated the dashboard with a modern design and smarter tools for managing your hosting.'
						) }
					</p>
					<FormFieldset className="account__settings-admin-home">
						<FormLabel>
							<FormCheckbox
								checked={ enabled }
								disabled={ isFetching || isSaving }
								onChange={ ( event ) => setEnabled( event.target.checked ) }
							/>
							<span>{ translate( 'I want to try the beta version.' ) }</span>
						</FormLabel>
					</FormFieldset>
					{ showOptOutSurvey && (
						<FormFieldset>
							<Banner
								title={ translate( 'Prefer the previous version?' ) }
								showIcon={ false }
								description={ translate(
									'{{surveyLink}}Please complete this short survey{{/surveyLink}} to help us understand what didn’t work and how we can improve.',
									{
										components: {
											surveyLink: (
												<ExternalLink
													href="https://automattic.survey.fm/new-hosting-dashboard-opt-out-survey"
													icon
													onClick={ () =>
														dispatch(
															recordTracksEvent(
																'calypso_account_new_hosting_dashboard_survey_click'
															)
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
					<FormButton
						isSubmitting={ isSaving }
						disabled={ isFetching || isSaving || ! isDirty }
						busy={ isSaving || isRedirecting }
						type="submit"
					>
						{ translate( 'Save' ) }
					</FormButton>
				</form>
			</Card>
		</>
	);
}
