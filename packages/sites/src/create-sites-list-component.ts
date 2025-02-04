/* eslint-disable @typescript-eslint/ban-types, react-hooks/rules-of-hooks */
import { Attributes, ReactElement } from 'react';
import { MinimumSite } from './site-type';
import { SitesFilterOptions, useSitesListFiltering } from './use-sites-list-filtering';
import { SitesGroupingOptions, Status, useSitesListGrouping } from './use-sites-list-grouping';
import { SitesSortOptions, useSitesListSorting } from './use-sites-list-sorting';

type Features< TGrouping extends boolean, TSorting extends boolean, TFiltering extends boolean > = {
	grouping?: TGrouping;
	sorting?: TSorting;
	filtering?: TFiltering;
};

/**
 * Order:
 *
 * 1. Group;
 * 2. Sort;
 * 3. Filter.
 */

interface BaseProps< T = MinimumSite > extends Attributes {
	sites: T[];
	grouping?: SitesGroupingOptions;
}

type FilteringProps = { filtering?: SitesFilterOptions };

const addFiltering = < T extends BaseProps >( enabled: boolean, baseProps: T ) => {
	if ( enabled ) {
		const props = baseProps as T & FilteringProps;

		return {
			...props,
			sites: useSitesListFiltering( props.sites, props.filtering ?? {} ),
		};
	}

	return baseProps;
};

type SortingProps = { sorting?: SitesSortOptions };

const addSorting = < T extends BaseProps >( enabled: boolean, baseProps: T ) => {
	if ( enabled ) {
		const props = baseProps as T & SortingProps;

		return {
			...props,
			sites: useSitesListSorting( props.sites, props.sorting ?? {} ),
		};
	}

	return baseProps;
};

type GroupingProps = { grouping: SitesGroupingOptions };

const addGrouping = < T extends BaseProps >( enabled: boolean, baseProps: T ) => {
	if ( enabled ) {
		const props = baseProps as T & GroupingProps;

		const { currentStatusGroup: sites, statuses } = useSitesListGrouping(
			props.sites,
			props.grouping
		);

		return {
			...props,
			sites,
			statuses,
		};
	}

	return baseProps;
};

type ComponentGroupingProp< T extends boolean > = T extends true
	? { grouping: SitesGroupingOptions }
	: {};

type ComponentSortingProp< T extends boolean > = T extends true
	? { sorting: SitesSortOptions }
	: {};

type ComponentFilteringProp< T extends boolean > = T extends true
	? { filtering: SitesFilterOptions }
	: {};

type RenderProp< TSite, TGrouping > = TGrouping extends true
	? BaseProps< TSite > & { statuses: Status[] }
	: BaseProps< TSite >;

type CreatedComponentProps<
	TSite extends MinimumSite,
	TGrouping extends boolean,
	TSorting extends boolean,
	TFiltering extends boolean,
> = {
	sites: TSite[];
	children( processedData: RenderProp< TSite, TGrouping > ): ReactElement;
} & ComponentGroupingProp< TGrouping > &
	ComponentSortingProp< TSorting > &
	ComponentFilteringProp< TFiltering >;

export const createSitesListComponent = <
	TGrouping extends boolean = true,
	TSorting extends boolean = true,
	TFiltering extends boolean = true,
>( { grouping, sorting, filtering }: Features< TGrouping, TSorting, TFiltering > = {} ) => {
	return < TSite extends MinimumSite >( {
		children,
		...props
	}: CreatedComponentProps< TSite, TGrouping, TSorting, TFiltering > ) => {
		const grouped = addGrouping( grouping ?? true, props );
		const sorted = addSorting( sorting ?? true, grouped );
		const filtered = addFiltering( filtering ?? true, sorted );

		return children( filtered as unknown as RenderProp< TSite, TGrouping > );
	};
};
