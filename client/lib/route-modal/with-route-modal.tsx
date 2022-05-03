import { createHigherOrderComponent } from '@wordpress/compose';
import useRouteModal, { RouteModalData } from './use-route-modal';

export default function withRouteModal( queryKey: string, defaultValue?: string ) {
	return createHigherOrderComponent< { routeModalData: RouteModalData } >(
		( InnerComponent ) => ( props ) => {
			const routeModalData = useRouteModal( queryKey, defaultValue );
			const innerProps = { routeModalData, ...props } as React.ComponentProps<
				typeof InnerComponent
			>;
			return <InnerComponent { ...innerProps } />;
		},
		'WithRouteModal'
	);
}
