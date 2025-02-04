import { createHigherOrderComponent } from '@wordpress/compose';
import useRouteModal, { RouteModalData } from './use-route-modal';
import type { ComponentType } from 'react';

export default function withRouteModal( queryKey: string, defaultValue?: string ) {
	return createHigherOrderComponent(
		< OuterProps, >(
			InnerComponent: ComponentType< OuterProps & { routeModalData: RouteModalData } >
		) =>
			( props: OuterProps ) => {
				const routeModalData = useRouteModal( queryKey, defaultValue );
				const innerProps = { ...props, routeModalData };
				return <InnerComponent { ...innerProps } />;
			},
		'WithRouteModal'
	);
}
