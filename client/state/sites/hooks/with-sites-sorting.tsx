import { createHigherOrderComponent } from '@wordpress/compose';
import { ComponentType } from 'react';
import { useSitesSorting } from './use-sites-sorting';

export type SitesSortingPreferenceProps = ReturnType< typeof useSitesSorting >;

export const withSitesSortingPreference = createHigherOrderComponent(
	< OuterProps extends SitesSortingPreferenceProps >( Component: ComponentType< OuterProps > ) => {
		const ComponentWithSitesSorting: ComponentType<
			Omit< OuterProps, keyof SitesSortingPreferenceProps >
		> = ( props ) => {
			return <Component { ...( props as OuterProps ) } { ...useSitesSorting() } />;
		};

		return ComponentWithSitesSorting;
	},
	'withSitesSortingPreference'
);
