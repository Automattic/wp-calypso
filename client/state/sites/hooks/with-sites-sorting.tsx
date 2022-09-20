import { createHigherOrderComponent } from '@wordpress/compose';
import { ComponentType } from 'react';
import { useSitesSorting } from './use-sites-sorting';

export const withSitesSortingPreference = createHigherOrderComponent(
	< OuterProps, >( Component: ComponentType< OuterProps > ) => {
		const ComponentWithSitesSorting: ComponentType<
			Omit< OuterProps, keyof ReturnType< typeof useSitesSorting > >
		> = ( props ) => {
			return <Component { ...( props as OuterProps ) } { ...useSitesSorting() } />;
		};

		return ComponentWithSitesSorting;
	},
	'withSitesSortingPreference'
);
