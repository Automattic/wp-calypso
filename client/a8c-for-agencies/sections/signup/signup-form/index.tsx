import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import AgencyDetailsForm from 'calypso/a8c-for-agencies/sections/signup/agency-details-form';
import useCreatePartnerMutation from 'calypso/a8c-for-agencies/sections/signup/agency-details-form/hooks/use-create-partner-mutation';
import AutomatticLogo from 'calypso/components/automattic-logo';
import CardHeading from 'calypso/components/card-heading';
import { useDispatch } from 'calypso/state';
import { fetchAgencies } from 'calypso/state/a8c-for-agencies/agency/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { translateInvalidPartnerParameterError } from 'calypso/state/partner-portal/partner/utils';
import type { AgencyDetailsPayload } from 'calypso/a8c-for-agencies/sections/signup/agency-details-form/types';
import type { APIError } from 'calypso/state/partner-portal/types';

import './style.scss';

export default function SignupForm() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const notificationId = 'a4a-agency-signup-form';

	const createPartner = useCreatePartnerMutation( {
		onSuccess: () => {
			dispatch( fetchAgencies() );
		},
		onError: ( error: APIError ) => {
			let message = error.message;

			if ( error.code === 'rest_invalid_param' && typeof error?.data?.params !== 'undefined' ) {
				message = translateInvalidPartnerParameterError( error.data.params, error.data.details );
			}

			dispatch( errorNotice( message, { id: notificationId } ) );
		},
	} );

	const onSubmit = useCallback(
		( payload: AgencyDetailsPayload ) => {
			dispatch( removeNotice( notificationId ) );

			createPartner.mutate( payload );

			dispatch(
				recordTracksEvent( 'calypso_a4a_create_agency_submit', {
					name: payload.agencyName,
					business_url: payload.businessUrl,
					city: payload.city,
					line1: payload.line1,
					line2: payload.line2,
					country: payload.country,
					postal_code: payload.postalCode,
					state: payload.state,
				} )
			);
		},
		[ notificationId, createPartner.mutate, dispatch ]
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
				isLoading={ createPartner.isPending }
				onSubmit={ onSubmit }
				submitLabel={ translate( 'Continue' ) }
			/>
		</Card>
	);
}
