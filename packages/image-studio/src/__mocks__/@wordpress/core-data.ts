/**
 * Mock for @wordpress/core-data package
 */

import { vi } from 'vitest';
export const store = {
	name: 'core',
};

export const useEntityRecord = vi.fn( () => ( {
	record: null,
	isResolving: false,
	hasResolved: false,
} ) );

export const useEntityRecords = vi.fn( () => ( {
	records: [],
	isResolving: false,
	hasResolved: false,
} ) );
