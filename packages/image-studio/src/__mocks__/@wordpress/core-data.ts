/**
 * Mock for @wordpress/core-data package
 */

export const store = {
	name: 'core',
};

export const useEntityRecord = jest.fn( () => ( {
	record: null,
	isResolving: false,
	hasResolved: false,
} ) );

export const useEntityRecords = jest.fn( () => ( {
	records: [],
	isResolving: false,
	hasResolved: false,
} ) );
