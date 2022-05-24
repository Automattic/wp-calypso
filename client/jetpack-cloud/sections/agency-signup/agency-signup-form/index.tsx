import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import CompanyDetailsForm from 'calypso/jetpack-cloud/sections/partner-portal/company-details-form';
import { formatApiPartner } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { partnerPortalBasePath } from 'calypso/lib/jetpack/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { receivePartner } from 'calypso/state/partner-portal/partner/actions';
import useCreatePartnerMutation from 'calypso/state/partner-portal/partner/hooks/use-create-partner-mutation';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
import type { APIError } from 'calypso/state/partner-portal/types';
import type { ReactElement } from 'react';
import './style.scss';

export default function AgencySignupForm(): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const partner = useSelector( getCurrentPartner );
	const notificationId = 'partner-portal-agency-signup-form';

	const createPartner = useCreatePartnerMutation( {
		onSuccess: ( partner ) => {
			dispatch( receivePartner( formatApiPartner( partner ) ) );

			page.redirect( partnerPortalBasePath() );
		},
		onError: ( error: APIError ) => {
			dispatch(
				errorNotice( error.message, {
					id: notificationId,
				} )
			);
		},
	} );

	const onSubmit = useCallback(
		( payload ) => {
			dispatch( removeNotice( notificationId ) );

			createPartner.mutate( payload );

			dispatch(
				recordTracksEvent( 'calypso_partner_portal_create_partner_submit', {
					partner_id: partner?.id,
					name: payload.name,
					city: payload.city,
					line1: payload.line1,
					line2: payload.line2,
					country: payload.country,
					postal_code: payload.postalCode,
					state: payload.state,
				} )
			);
		},
		[ notificationId, partner?.id, createPartner.mutate, dispatch ]
	);

	return (
		<Card className="agency-signup-form">
			<svg
				className="agency-signup-form__logo"
				width="32"
				height="32"
				viewBox="0 0 32 32"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16C0 7.16345 7.16344 0 16 0C24.8366 0 32 7.16345 32 16ZM15.1756 18.6566V3.17569L7.20612 18.6566H15.1756ZM16.794 13.3124V28.8239L24.794 13.3124H16.794Z"
					fill="#069E08"
				/>
			</svg>

			<CardHeading className="agency-signup-form__heading">
				{ translate( 'Sign up as an Agency' ) }
			</CardHeading>

			<h2 className="agency-signup-form__subheading">
				{ translate( 'Tell us about yourself and your business.' ) }
			</h2>

			<CompanyDetailsForm
				includeTermsOfService={ true }
				isLoading={ createPartner.isLoading }
				onSubmit={ onSubmit }
				submitLabel={ translate( 'Continue' ) }
			/>
		</Card>
	);
}
