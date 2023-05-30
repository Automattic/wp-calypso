import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const useNotificationDevicesQuery = () =>
	useQuery( {
		queryKey: [ 'notification-devices' ],
		queryFn: () => wp.req.get( `/notifications/devices` ),
		select( data ) {
			return data.map( ( { device_id: id, device_name: name } ) => ( { id, name } ) );
		},
	} );
