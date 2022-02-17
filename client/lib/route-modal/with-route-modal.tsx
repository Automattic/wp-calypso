import { createHigherOrderComponent } from '@wordpress/compose';
import useRouteModal, { RouteModalData } from './use-route-modal';

interface WithRouteModalProps {
	routeModalData: RouteModalData;
}

export default function withRouteModal< ComponentProps >(
	queryKey: string,
	defaultValue?: unknown
) {
	return createHigherOrderComponent< ComponentProps, ComponentProps & WithRouteModalProps >(
		( WrappedComponent ) => ( props ) => {
			const routeModalData = useRouteModal( queryKey, defaultValue );

			return <WrappedComponent { ...props } routeModalData={ routeModalData } />;
		},
		'WithRouteModal'
	);
}
