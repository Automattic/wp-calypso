import { createHigherOrderComponent } from '@wordpress/compose';
import { ComponentType } from 'react';
import { useSitesSorting } from './use-sites-sorting';

export type SitesSortingPreferenceProps = ReturnType< typeof useSitesSorting >;

export const withSitesSortingPreference = createHigherOrderComponent(
	< OuterProps, >( Component: ComponentType< OuterProps & SitesSortingPreferenceProps > ) => {
		return ( props: OuterProps ) => {
			return <Component { ...props } { ...useSitesSorting() } />;
		};
	},
	'withSitesSortingPreference'
);
