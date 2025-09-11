import { Card, FormLabel } from '@automattic/components';
import { Badge } from '@automattic/ui';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
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

	const [ wasFetching, setWasFetching ] = useState( isFetching );
	if ( isFetching !== wasFetching ) {
		// Preferences have finished fetching
		setEnabled( savedPreference?.value === 'opt-in' );
		setWasFetching( isFetching );
	}

	const isDirty = enabled !== ( savedPreference?.value === 'opt-in' );

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
		}
	};

	return (
		<>
			<SectionHeader
				label={
					<HStack justify="flex-start">
						<div>{ translate( 'Try the new Hosting Dashboard' ) }</div>
						<Badge intent="info">{ translate( 'New feature' ) }</Badge>
					</HStack>
				}
			/>
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
