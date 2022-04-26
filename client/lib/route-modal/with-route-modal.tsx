import { createHigherOrderComponent } from '@wordpress/compose';
import useRouteModal, { RouteModalData } from './use-route-modal';

export default function withRouteModal( queryKey: string, defaultValue?: string ) {
	return createHigherOrderComponent< { routeModalData: RouteModalData } >(
		( WrappedComponent ) => ( props ) => {
			const routeModalData = useRouteModal( queryKey, defaultValue );
			// There is an issue with a type rework in the upstream package which causes
			// this correct use to fail without an ignore. See https://github.com/WordPress/gutenberg/pull/37795
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore-next-line
			return <WrappedComponent { ...props } routeModalData={ routeModalData } />;
		},
		'WithRouteModal'
	);
}
