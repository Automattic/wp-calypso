import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { MonitorContactsResponse } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import wpcom, { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';

const client = isA8CForAgencies() ? wpcom : wpcomJpl;

const isMultipleEmailEnabled = isEnabled(
	'jetpack/pro-dashboard-monitor-multiple-email-recipients'
);

const useFetchMonitorVerifiedContacts = (
	isPartnerOAuthTokenLoaded: boolean,
	agencyId?: number
) => {
	const isAgencyOrPartnerAuthEnabled =
		isPartnerOAuthTokenLoaded || ( agencyId !== undefined && agencyId !== null );
	return useQuery( {
		queryKey: [ 'monitor_notification_contacts', agencyId ],
		queryFn: () =>
			client.req.get(
				{
					path: '/jetpack-agency/contacts',
					apiNamespace: 'wpcom/v2',
				},
				{
					...( agencyId && { agency_id: agencyId } ),
				}
			),
		select: ( contacts: MonitorContactsResponse ) => {
			return {
				emails: contacts?.emails
					?.filter( ( email ) => email.verified )
					.map( ( email ) => email.email_address ),
				phoneNumbers: contacts?.sms_numbers
					?.filter( ( sms ) => sms.verified )
					.map( ( sms ) => sms.sms_number ),
			};
		},
		enabled: isAgencyOrPartnerAuthEnabled && isMultipleEmailEnabled,
	} );
};

export default useFetchMonitorVerifiedContacts;
