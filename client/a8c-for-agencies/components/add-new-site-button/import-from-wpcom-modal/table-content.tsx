import { useState, useEffect } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { SiteItem } from './wpcom-sites-table';
import type { Field } from '@wordpress/dataviews';

interface Props {
	items: SiteItem[];
	fields: Field< any >[];
}

export default function WPCOMSitesTableContent( { items, fields }: Props ) {
	const [ dataViewsState, setDataViewsState ] = useState( initialDataViewsState );

	useEffect( () => {
		if ( items.length ) {
			const handleRowClick = ( event: Event ) => {
				const target = event.target as HTMLElement;

				const row = target.closest(
					'.dataviews-view-table__row, li:has(.dataviews-view-list__item)'
				);

				if (
					target.tagName.toLowerCase() === 'input' ||
					target.tagName.toLowerCase() === 'label'
				) {
					return;
				}
				if ( row ) {
					const isButtonOrLink = target.closest( 'button, a' );
					if ( ! isButtonOrLink ) {
						const button = row.querySelector( '.view-details-button' ) as HTMLButtonElement;
						const checkbox = button?.getElementsByTagName( 'input' )[ 0 ];
						if ( checkbox ) {
							checkbox.click();
						}
					}
				}
			};

			const rowsContainer = document.querySelector( '.dataviews-view-table, .dataviews-view-list' );

			if ( rowsContainer ) {
				rowsContainer.addEventListener( 'click', handleRowClick as EventListener );
			}

			return () => {
				if ( rowsContainer ) {
					rowsContainer.removeEventListener( 'click', handleRowClick as EventListener );
				}
			};
		}
	}, [ dataViewsState, items ] );

	return (
		<ItemsDataViews
			data={ {
				items,
				fields,
				getItemId: ( item ) => `${ item.id }`,
				pagination: {
					totalItems: 1,
					totalPages: 1,
				},
				enableSearch: false,
				actions: [],
				dataViewsState: dataViewsState,
				setDataViewsState: setDataViewsState,
			} }
		/>
	);
}
