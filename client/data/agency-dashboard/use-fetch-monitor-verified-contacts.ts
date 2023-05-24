import { useQuery } from '@tanstack/react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';

const useFetchMonitorVerfiedContacts = ( isPartnerOAuthTokenLoaded: boolean ) => {
	return useQuery(
		[ 'monitor_notification_contacts' ],
		() =>
			wpcomJpl.req.get( {
				path: '/jetpack-agency/contacts',
				apiNamespace: 'wpcom/v2',
			} ),
		{
			select: ( contacts: { emails: [ { verified: boolean; email_address: string } ] } ) => {
				return {
					emails: contacts?.emails
						.filter( ( email ) => email.verified )
						.map( ( email ) => email.email_address ),
				};
			},
			enabled: isPartnerOAuthTokenLoaded,
		}
	);
};

export default useFetchMonitorVerfiedContacts;
