import { createHigherOrderComponent } from '@wordpress/compose';
import useRouteModal, { RouteModalData } from './use-route-modal';

export default function withRouteModal( queryKey: string, defaultValue?: string ) {
	return createHigherOrderComponent< { routeModalData: RouteModalData } >(
		( WrappedComponent ) => ( props ) => {
			const routeModalData = useRouteModal( queryKey, defaultValue );
			// @ts-expect-error Upstream type issue from https://github.com/WordPress/gutenberg/pull/37795. May be fixed in an upcoming release.
			return <WrappedComponent { ...props } routeModalData={ routeModalData } />;
		},
		'WithRouteModal'
	);
}
