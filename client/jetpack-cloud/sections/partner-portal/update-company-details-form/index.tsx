import { useTranslate } from 'i18n-calypso';
import { ReactElement, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CompanyDetailsForm from 'calypso/jetpack-cloud/sections/partner-portal/company-details-form';
import { formatApiPartner } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import { receivePartner } from 'calypso/state/partner-portal/partner/actions';
import useUpdateCompanyDetailsMutation from 'calypso/state/partner-portal/partner/hooks/use-update-company-details-mutation';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
import { PartnerDetailsPayload } from 'calypso/state/partner-portal/types';
import type { APIError } from 'calypso/state/partner-portal/types';

export default function UpdateCompanyDetailsForm(): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const partner = useSelector( getCurrentPartner );
	const notificationId = 'partner-portal-company-details-form';

	const name = partner?.name ?? '';
	const country = partner?.address.country ?? '';
	const city = partner?.address.city ?? '';
	const line1 = partner?.address.line1 ?? '';
	const line2 = partner?.address.line2 ?? '';
	const postalCode = partner?.address.postal_code ?? '';
	const state = partner?.address.state ?? '';

	const updateCompanyDetails = useUpdateCompanyDetailsMutation( {
		onSuccess: ( partner ) => {
			dispatch( receivePartner( formatApiPartner( partner ) ) );

			dispatch(
				successNotice( translate( 'Company details have been updated' ), {
					id: notificationId,
				} )
			);
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
		( payload: PartnerDetailsPayload ) => {
			dispatch( removeNotice( notificationId ) );

			updateCompanyDetails.mutate( payload );

			dispatch(
				recordTracksEvent( 'calypso_partner_portal_update_company_details_submit', {
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
		[ notificationId, partner?.id, updateCompanyDetails.mutate, dispatch ]
	);

	return (
		<CompanyDetailsForm
			initialValues={ {
				name,
				country,
				city,
				line1,
				line2,
				postalCode,
				state,
			} }
			isLoading={ updateCompanyDetails.isLoading }
			onSubmit={ onSubmit }
			submitLabel={ translate( 'Update details' ) }
		/>
	);
}
