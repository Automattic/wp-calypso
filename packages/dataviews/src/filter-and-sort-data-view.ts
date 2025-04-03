/**
 * External dependencies
 */
import removeAccents from 'remove-accents';

/**
 * Internal dependencies
 */
import {
	OPERATOR_IS,
	OPERATOR_IS_NOT,
	OPERATOR_IS_NONE,
	OPERATOR_IS_ANY,
	OPERATOR_IS_ALL,
	OPERATOR_IS_NOT_ALL,
} from './constants';
import { normalizeFields } from './normalize-fields';
import type { Field, View } from './types';

function normalizeSearchInput( input = '' ) {
	return removeAccents( input.trim().toLowerCase() );
}

const EMPTY_ARRAY: [] = [];

/**
 * Applies the filtering, sorting and pagination to the raw data based on the view configuration.
 *
 * @param data   Raw data.
 * @param view   View config.
 * @param fields Fields config.
 *
 * @return Filtered, sorted and paginated data.
 */
export function filterSortAndPaginate< Item >(
	data: Item[],
	view: View,
	fields: Field< Item >[]
): {
	data: Item[];
	paginationInfo: { totalItems: number; totalPages: number };
} {
	if ( ! data ) {
		return {
			data: EMPTY_ARRAY,
			paginationInfo: { totalItems: 0, totalPages: 0 },
		};
	}
	const _fields = normalizeFields( fields );
	let filteredData = [ ...data ];
	// Handle global search.
	if ( view.search ) {
		const normalizedSearch = normalizeSearchInput( view.search );
		filteredData = filteredData.filter( ( item ) => {
			return _fields
				.filter( ( field ) => field.enableGlobalSearch )
				.map( ( field ) => {
					return normalizeSearchInput( field.getValue( { item } ) );
				} )
				.some( ( field ) => field.includes( normalizedSearch ) );
		} );
	}

	if ( view.filters && view.filters?.length > 0 ) {
		view.filters.forEach( ( filter ) => {
			const field = _fields.find(
				( _field ) => _field.id === filter.field
			);
			if ( field ) {
				if (
					filter.operator === OPERATOR_IS_ANY &&
					filter?.value?.length > 0
				) {
					filteredData = filteredData.filter( ( item ) => {
						const fieldValue = field.getValue( { item } );
						if ( Array.isArray( fieldValue ) ) {
							return filter.value.some( ( filterValue: any ) =>
								fieldValue.includes( filterValue )
							);
						} else if ( typeof fieldValue === 'string' ) {
							return filter.value.includes( fieldValue );
						}
						return false;
					} );
				} else if (
					filter.operator === OPERATOR_IS_NONE &&
					filter?.value?.length > 0
				) {
					filteredData = filteredData.filter( ( item ) => {
						const fieldValue = field.getValue( { item } );
						if ( Array.isArray( fieldValue ) ) {
							return ! filter.value.some( ( filterValue: any ) =>
								fieldValue.includes( filterValue )
							);
						} else if ( typeof fieldValue === 'string' ) {
							return ! filter.value.includes( fieldValue );
						}
						return false;
					} );
				} else if (
					filter.operator === OPERATOR_IS_ALL &&
					filter?.value?.length > 0
				) {
					filteredData = filteredData.filter( ( item ) => {
						return filter.value.every( ( value: any ) => {
							return field
								.getValue( { item } )
								?.includes( value );
						} );
					} );
				} else if (
					filter.operator === OPERATOR_IS_NOT_ALL &&
					filter?.value?.length > 0
				) {
					filteredData = filteredData.filter( ( item ) => {
						return filter.value.every( ( value: any ) => {
							return ! field
								.getValue( { item } )
								?.includes( value );
						} );
					} );
				} else if ( filter.operator === OPERATOR_IS ) {
					filteredData = filteredData.filter( ( item ) => {
						return filter.value === field.getValue( { item } );
					} );
				} else if ( filter.operator === OPERATOR_IS_NOT ) {
					filteredData = filteredData.filter( ( item ) => {
						return filter.value !== field.getValue( { item } );
					} );
				}
			}
		} );
	}

	// Handle sorting.
	if ( view.sort ) {
		const fieldId = view.sort.field;
		const fieldToSort = _fields.find( ( field ) => {
			return field.id === fieldId;
		} );
		if ( fieldToSort ) {
			filteredData.sort( ( a, b ) => {
				return fieldToSort.sort( a, b, view.sort?.direction ?? 'desc' );
			} );
		}
	}

	// Handle pagination.
	let totalItems = filteredData.length;
	let totalPages = 1;
	if ( view.page !== undefined && view.perPage !== undefined ) {
		const start = ( view.page - 1 ) * view.perPage;
		totalItems = filteredData?.length || 0;
		totalPages = Math.ceil( totalItems / view.perPage );
		filteredData = filteredData?.slice( start, start + view.perPage );
	}

	return {
		data: filteredData,
		paginationInfo: {
			totalItems,
			totalPages,
		},
	};
}
