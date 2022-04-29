import { createHigherOrderComponent } from '@wordpress/compose';
import useRouteModal, { RouteModalData } from './use-route-modal';

export default function withRouteModal( queryKey: string, defaultValue?: string ) {
	return createHigherOrderComponent< { routeModalData: RouteModalData } >(
		( WrappedComponent ) => ( props ) => {
			const routeModalData = useRouteModal( queryKey, defaultValue );
			// @ts-expect-error There is an issue an upstream type. See https://github.com/WordPress/gutenberg/pull/37795. May be fixed in an upcoming release.
			return <WrappedComponent { ...props } routeModalData={ routeModalData } />;
		},
		'WithRouteModal'
	);
}
