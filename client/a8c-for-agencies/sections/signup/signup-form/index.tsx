import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import AgencyDetailsForm from 'calypso/a8c-for-agencies/sections/signup/agency-details-form';
import useCreateAgencyMutation from 'calypso/a8c-for-agencies/sections/signup/agency-details-form/hooks/use-create-agency-mutation';
import AutomatticLogo from 'calypso/components/automattic-logo';
import CardHeading from 'calypso/components/card-heading';
import { useDispatch } from 'calypso/state';
import { fetchAgencies } from 'calypso/state/a8c-for-agencies/agency/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import type { AgencyDetailsPayload } from 'calypso/a8c-for-agencies/sections/signup/agency-details-form/types';
import type { APIError } from 'calypso/state/a8c-for-agencies/types';

import './style.scss';

export default function SignupForm() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const notificationId = 'a4a-agency-signup-form';

	const createAgency = useCreateAgencyMutation( {
		onSuccess: () => {
			dispatch( fetchAgencies() );
		},
		onError: ( error: APIError ) => {
			dispatch( errorNotice( error?.message, { id: notificationId } ) );
		},
	} );

	const onSubmit = useCallback(
		( payload: AgencyDetailsPayload ) => {
			dispatch( removeNotice( notificationId ) );

			createAgency.mutate( payload );

			dispatch(
				recordTracksEvent( 'calypso_a4a_create_agency_submit', {
					name: payload.agencyName,
					business_url: payload.agencyUrl,
					managed_sites: payload.managedSites,
					services_offered: payload.servicesOffered,
					city: payload.city,
					line1: payload.line1,
					line2: payload.line2,
					country: payload.country,
					postal_code: payload.postalCode,
					state: payload.state,
				} )
			);
		},
		[ notificationId, createAgency, dispatch ]
	);

	return (
		<Card className="agency-signup-form">
			<AutomatticLogo size={ 18 } className="agency-signup-form__logo" />

			<CardHeading className="agency-signup-form__heading">
				{ translate( 'Sign up for Automattic for Agencies' ) }
			</CardHeading>

			<h2 className="agency-signup-form__subheading">
				{ translate( 'Tell us about yourself and your business.' ) }
			</h2>

			<AgencyDetailsForm
				includeTermsOfService={ true }
				isLoading={ createAgency.isPending }
				onSubmit={ onSubmit }
				submitLabel={ translate( 'Continue' ) }
			/>
		</Card>
	);
}
