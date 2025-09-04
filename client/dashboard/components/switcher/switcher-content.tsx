import { MenuGroup, NavigableMenu, SearchControl } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { type PropsWithChildren, type ReactNode, useMemo, useState } from 'react';
import RouterLinkMenuItem from '../router-link-menu-item';
import type { View } from '@wordpress/dataviews';

const DEFAULT_VIEW: View = {
	type: 'list',
	page: 1,
	perPage: 10,
	sort: { field: 'name', direction: 'asc' },
};

export type RenderItemIcon< T > = ( props: {
	item: T;
	context: 'dropdown' | 'list';
	size: number;
} ) => ReactNode;

export default function SwitcherContent< T >( {
	items,
	getItemName,
	getItemUrl,
	renderItemIcon,
	children,
	onClose,
}: PropsWithChildren< {
	items?: T[];
	getItemName: ( item: T ) => string;
	getItemUrl: ( item: T ) => string;
	renderItemIcon: RenderItemIcon< T >;
	onClose: () => void;
} > ) {
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	const fields = useMemo( () => {
		return [
			{
				id: 'name',
				getValue: ( { item }: { item: T } ) => getItemName( item ),
				enableGlobalSearch: true,
			},
		];
	}, [ getItemName ] );

	if ( ! items ) {
		return __( 'Loading…' );
	}

	const { data: filteredData } = filterSortAndPaginate( items, view, fields );

	return (
		<NavigableMenu style={ { width: '280px' } }>
			<MenuGroup>
				<SearchControl
					label={ __( 'Search' ) }
					value={ view.search }
					onChange={ ( value ) => setView( { ...view, search: value } ) }
					size="compact"
					__nextHasNoMarginBottom
				/>
			</MenuGroup>
			<MenuGroup>
				{ filteredData.map( ( item ) => {
					const itemUrl = getItemUrl( item );
					return (
						<RouterLinkMenuItem key={ itemUrl } to={ itemUrl } onClick={ onClose }>
							<div style={ { display: 'flex', gap: '8px', alignItems: 'center', width: '100%' } }>
								{ renderItemIcon( { item, context: 'list', size: 24 } ) }
								<span
									style={ { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }
								>
									{ getItemName( item ) }
								</span>
							</div>
						</RouterLinkMenuItem>
					);
				} ) }
			</MenuGroup>
			{ children }
		</NavigableMenu>
	);
}
