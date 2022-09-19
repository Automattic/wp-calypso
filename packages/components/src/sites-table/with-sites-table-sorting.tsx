import { createHigherOrderComponent } from '@wordpress/compose';
import {
	SiteDetailsForSorting,
	SitesTableSortOptions,
	useSitesTableSorting,
} from './use-sites-table-sorting';

type SitesTableSortingProps = {
	sitesSorting: SitesTableSortOptions;
	sites: SiteDetailsForSorting[];
};

export const withSitesTableSorting = createHigherOrderComponent(
	< OuterProps extends SitesTableSortingProps >( Component: React.ComponentType< OuterProps > ) => {
		return ( props: OuterProps ) => {
			const { sortedSites: sites } = useSitesTableSorting( props.sites, props.sitesSorting );

			return <Component { ...props } sites={ sites } />;
		};
	},
	'withSitesTableSorting'
);
