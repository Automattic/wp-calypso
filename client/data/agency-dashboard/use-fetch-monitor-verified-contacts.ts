import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { MonitorContactsResponse } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';

const isMultipleEmailEnabled = isEnabled(
	'jetpack/pro-dashboard-monitor-multiple-email-recipients'
);

const useFetchMonitorVerfiedContacts = ( isPartnerOAuthTokenLoaded: boolean ) => {
	return useQuery(
		[ 'monitor_notification_contacts' ],
		() =>
			wpcomJpl.req.get( {
				path: '/jetpack-agency/contacts',
				apiNamespace: 'wpcom/v2',
			} ),
		{
			select: ( contacts: MonitorContactsResponse ) => {
				return {
					emails: contacts?.emails
						.filter( ( email ) => email.verified )
						.map( ( email ) => email.email_address ),
				};
			},
			enabled: isPartnerOAuthTokenLoaded && isMultipleEmailEnabled,
		}
	);
};

export default useFetchMonitorVerfiedContacts;
