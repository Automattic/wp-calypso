import { createHigherOrderComponent } from '@wordpress/compose';
import useGetDefaultInterface from 'calypso/me/account/hooks/use-get-default-interface';

export const withDefaultInterface = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const defaultInterface = useGetDefaultInterface();
		return <Wrapped { ...props } defaultInterface={ defaultInterface } />;
	},
	'withGeoLocation'
);
