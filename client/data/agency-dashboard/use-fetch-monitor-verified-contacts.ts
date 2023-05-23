import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const isAPIAvailable = false; // FIXME: Remove this line when API is available

const useFetchMonitorVerfiedContacts = () => {
	return useQuery(
		[ 'monitor_notification_contacts' ],
		() =>
			isAPIAvailable
				? wpcom.req.get( {
						path: '/jetpack-agency/contacts',
						apiNamespace: 'wpcom/v2',
				  } )
				: {
						emails: [],
				  }, // FIXME: Remove this line and enable API call when API is available
		{
			select: ( contacts: { emails: [ { verified: boolean; value: string } ] } ) => {
				return {
					emails: contacts?.emails
						.filter( ( email ) => email.verified )
						.map( ( email ) => email.value ),
				};
			},
		}
	);
};

export default useFetchMonitorVerfiedContacts;
