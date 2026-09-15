import { siteByIdQuery } from '@automattic/api-queries';
import { useQueries } from '@tanstack/react-query';
import { TextBlur } from '../../../components/text-blur';
import type { AgencySite, Site } from '@automattic/api-core';
import type { Field, NormalizedField } from '@wordpress/dataviews';

export interface HydratedSite {
	site?: Site;
	isPending: boolean;
}

export type HydratedSites = Map< number, HydratedSite >;

export function useHydratedSites( sites: AgencySite[] ): HydratedSites {
	const blogIds = sites.map( ( site ) => site.blog_id );

	return useQueries( {
		queries: blogIds.map( ( blogId ) => siteByIdQuery( blogId ) ),
		combine: ( results ) => {
			const hydrated: HydratedSites = new Map();
			results.forEach( ( result, index ) => {
				hydrated.set( blogIds[ index ], { site: result.data, isPending: result.isPending } );
			} );
			return hydrated;
		},
	} );
}

function PlaceholderCell( { isPending }: { isPending: boolean } ) {
	return (
		<TextBlur isBlurred={ isPending } length={ isPending ? 6 : undefined }>
			-
		</TextBlur>
	);
}

export function toAgencyField(
	field: Field< Site >,
	getHydrated: ( item: AgencySite ) => HydratedSite | undefined
): Field< AgencySite > {
	const getValue =
		field.getValue ?? ( ( { item }: { item: Site } ): unknown => Reflect.get( item, field.id ) );

	// Only DataViews can build a real NormalizedField. Every column delegated
	// here reads `getValue` and nothing else off it, so a column that started
	// reading another member would throw rather than render something wrong.
	const delegateField = { ...field, getValue } as unknown as NormalizedField< Site >;
	const SiteFieldRender =
		field.render ??
		( ( { item }: { item: Site } ) => <>{ String( getValue( { item } ) ?? '' ) }</> );

	return {
		id: field.id,
		label: field.label ?? field.id,
		header: field.header,
		enableHiding: field.enableHiding,
		enableSorting: false,
		enableGlobalSearch: false,
		filterBy: false,
		getValue: ( { item } ) => {
			const site = getHydrated( item )?.site;
			return site ? getValue( { item: site } ) : '';
		},
		render: ( { item } ) => {
			const hydrated = getHydrated( item );
			// The wrapper stays mounted across the swap below: page translators
			// reparent inline nodes and React crashes removing them
			// (react/react#11538).
			return (
				<span>
					{ hydrated?.site ? (
						<SiteFieldRender item={ hydrated.site } field={ delegateField } />
					) : (
						<PlaceholderCell isPending={ !! hydrated?.isPending } />
					) }
				</span>
			);
		},
	};
}
