import { useQuery } from 'react-query';
import wp from 'calypso/lib/wp';

export const useUserDevicesQuery = () =>
	useQuery( [ 'user-devices' ], () => wp.req.get( `/notifications/devices` ), {
		select( data ) {
			return data.map( ( { device_id: id, device_name: name } ) => ( { id, name } ) );
		},
	} );
