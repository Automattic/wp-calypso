import { DomainData } from '@automattic/data-stores';

export const getSimpleSortFunctionBy =
	( column: keyof DomainData ) => ( first: DomainData, second: DomainData, sortOrder: number ) => {
		if ( ! first.hasOwnProperty( column ) || ! second.hasOwnProperty( column ) ) {
			return -1;
		}

		const firstValue = first[ column ] as string;
		const secondValue = second[ column ] as string;

		if ( firstValue === secondValue ) {
			return 0;
		}

		const comparison = ( firstValue ?? '' ).localeCompare( secondValue ?? '' );

		return comparison * sortOrder;
	};

export const getReverseSimpleSortFunctionBy =
	( column: keyof DomainData ) => ( first: DomainData, second: DomainData, sortOrder: number ) =>
		getSimpleSortFunctionBy( column )( first, second, sortOrder ) * -1;
