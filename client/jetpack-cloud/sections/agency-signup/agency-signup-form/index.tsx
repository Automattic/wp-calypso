import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef } from 'react';
import CardHeading from 'calypso/components/card-heading';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import CompanyDetailsForm from 'calypso/jetpack-cloud/sections/partner-portal/company-details-form';
import formatApiPartner from 'calypso/jetpack-cloud/sections/partner-portal/lib/format-api-partner';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { dashboardPath, overviewPath } from 'calypso/lib/jetpack/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { receivePartner } from 'calypso/state/partner-portal/partner/actions';
import useCreatePartnerMutation from 'calypso/state/partner-portal/partner/hooks/use-create-partner-mutation';
import {
	getCurrentPartner,
	hasFetchedPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import { translateInvalidPartnerParameterError } from 'calypso/state/partner-portal/partner/utils';
import type { APIError, PartnerDetailsPayload } from 'calypso/state/partner-portal/types';
import './style.scss';

export default function AgencySignupForm() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const partner = useSelector( getCurrentPartner );
	const hasFetched = useSelector( hasFetchedPartner );
	const notificationId = 'partner-portal-agency-signup-form';
	const queryParams = new URLSearchParams( window.location.search );
	const refQueryParam = queryParams.get( 'ref' );

	const referrer = refQueryParam === 'agencies-lp' ? 'agencies-lp' : 'manage-lp';

	const createPartner = useCreatePartnerMutation( {
		onSuccess: ( partner ) => {
			dispatch( receivePartner( formatApiPartner( partner ) ) );
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
		( payload: PartnerDetailsPayload ) => {
			dispatch( removeNotice( notificationId ) );

			createPartner.mutate( payload );

			dispatch(
				recordTracksEvent( 'calypso_partner_portal_create_partner_submit', {
					partner_id: partner?.id,
					name: payload.name,
					contact_person: payload.contactPerson,
					company_website: payload.companyWebsite,
					company_type: payload.companyType,
					managed_sites: payload.managedSites,
					partner_program_opt_in: payload.partnerProgramOptIn,
					city: payload.city,
					line1: payload.line1,
					line2: payload.line2,
					country: payload.country,
					postal_code: payload.postalCode,
					state: payload.state,
					referrer: payload.referrer,
				} )
			);
		},
		[ notificationId, partner?.id, createPartner.mutate, dispatch ]
	);

	// Redirect the user to the dashboard if they are already a partner,
	// or the overview page if the form was submitted successfully,
	// or the issue licenses page if coming via the /manage/pricing page.
	const source = useRef( queryParams.get( 'source' ) );
	const bundleSize = useRef( queryParams.get( 'bundle_size' ) );
	const products = useRef( queryParams.get( 'products' ) );
	useEffect( () => {
		if ( createPartner.isSuccess ) {
			if ( source.current === 'manage-pricing-page' ) {
				const path = `/partner-portal/issue-license?products=${ products.current }&bundle_size=${ bundleSize.current }&source=manage-pricing-page`;
				page.redirect( path );
			} else {
				page.redirect( overviewPath() );
			}
		} else if ( partner ) {
			page.redirect( dashboardPath() );
		}
	} );

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_partner_portal_agency_signup_start', {
				form_referrer_source: referrer,
			} )
		);
	}, [] );

	return (
		<Card className="agency-signup-form">
			<QueryJetpackPartnerPortalPartner />
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
				{ translate( 'Sign up for Jetpack Manage' ) }
			</CardHeading>

			<h2 className="agency-signup-form__subheading">
				{ translate( 'Tell us about yourself and your business.' ) }
			</h2>

			{ ( ! hasFetched || partner ) && <TextPlaceholder /> }

			{ hasFetched && ! partner && (
				<CompanyDetailsForm
					includeTermsOfService
					isLoading={ createPartner.isPending }
					onSubmit={ onSubmit }
					submitLabel={ translate( 'Continue' ) }
					showSignupFields
					referrer={ referrer }
				/>
			) }
		</Card>
	);
}
