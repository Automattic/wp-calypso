import { createHigherOrderComponent } from '@wordpress/compose';
import { useGeoLocationQuery } from './use-geolocation-query';

export const withGeoLocation = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { data } = useGeoLocationQuery();
		return <Wrapped { ...props } geo={ data } />;
	},
	'withGeoLocation'
);
