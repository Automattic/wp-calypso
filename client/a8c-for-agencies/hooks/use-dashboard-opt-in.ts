import { agencyDashboardOptInMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { CONTACT_URL_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import {
	canSwitchAgencyDashboard,
	isOnNewAgencyDashboard,
} from 'calypso/dashboard/agency/lib/dashboard-opt-in';
import { buildDashboardLink } from 'calypso/dashboard/app/routing';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency, isAgencyOwner } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { errorNotice } from 'calypso/state/notices/actions';

/**
 * Whether the current user can move the agency to the Multi-site Dashboard,
 * and the action that does it.
 */
export default function useDashboardOptIn() {
	const dispatch = useDispatch();
	const agency = useSelector( getActiveAgency );
	const isOwner = useSelector( isAgencyOwner );

	const canOptIn =
		isOwner && canSwitchAgencyDashboard( agency ) && ! isOnNewAgencyDashboard( agency );

	const { mutate, isPending } = useMutation( agencyDashboardOptInMutation( agency?.id ) );

	const optIn = useCallback( () => {
		mutate( 'opt-in', {
			onSuccess: () => {
				window.location.href = buildDashboardLink( 'a4a', '/overview' );
			},
			onError: () => {
				dispatch(
					errorNotice(
						__(
							'We couldn’t enable the new dashboard. Please try again, or contact support if it keeps happening.'
						),
						{
							button: __( 'Contact support' ),
							// Opens the "Send us an email" form, as the profile menu's Contact support does.
							href: CONTACT_URL_HASH_FRAGMENT,
						}
					)
				);
			},
		} );
	}, [ dispatch, mutate ] );

	return { canOptIn, optIn, isPending };
}
