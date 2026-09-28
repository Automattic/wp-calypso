import { siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { TextBlur } from '../../../components/text-blur';
import type { AgencySite, Site } from '@automattic/api-core';
import type { Field, NormalizedField } from '@wordpress/dataviews';

function PlaceholderCell( { isPending }: { isPending: boolean } ) {
	return (
		<TextBlur isBlurred={ isPending } length={ isPending ? 6 : undefined }>
			-
		</TextBlur>
	);
}

export function toAgencyField( field: Field< Site > ): Field< AgencySite > {
	const getValue =
		field.getValue ?? ( ( { item }: { item: Site } ): unknown => Reflect.get( item, field.id ) );

	// Only DataViews can build a real NormalizedField. Every column delegated
	// here reads `getValue` and nothing else off it: reading another member
	// gives `undefined`, and calling one (e.g. `field.getValueFormatted`) throws.
	const delegateField = { ...field, getValue } as unknown as NormalizedField< Site >;
	const SiteFieldRender =
		field.render ??
		( ( { item }: { item: Site } ) => <>{ String( getValue( { item } ) ?? '' ) }</> );

	// Fetching per cell keeps the field list stable across renders. DataViews
	// renders `field.render` as a component, so a new field would remount
	// every cell.
	function HydratedCell( { item }: { item: AgencySite } ) {
		const { data: site, isPending } = useQuery( {
			...siteByIdQuery( item.blog_id ),
			staleTime: 5 * 60 * 1000,
		} );
		// The wrapper stays mounted across the swap below: page translators
		// reparent inline nodes and React crashes removing them
		// (react/react#11538).
		return (
			<span>
				{ site ? (
					<SiteFieldRender item={ site } field={ delegateField } />
				) : (
					<PlaceholderCell isPending={ isPending } />
				) }
			</span>
		);
	}

	return {
		id: field.id,
		label: field.label ?? field.id,
		header: field.header,
		enableHiding: field.enableHiding,
		enableSorting: false,
		enableGlobalSearch: false,
		filterBy: false,
		render: HydratedCell,
	};
}
