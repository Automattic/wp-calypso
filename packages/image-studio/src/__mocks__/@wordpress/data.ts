/**
 * Mock for @wordpress/data package
 * Prevents module-level store initialization errors in tests
 */

// Mutable mocks that tests can override
// Default implementations return empty objects so tests can use mockImplementation
import { vi } from 'vitest';
export const dispatch = vi.fn( () => ( {} ) );
export const select = vi.fn( () => ( {} ) );
export const resolveSelect = vi.fn( () => ( {} ) );

// Function mocks
export const createReduxStore = vi.fn( () => ( {} ) );
export const createSelector = vi.fn( ( fn ) => fn );
export const register = vi.fn();
export const useDispatch = vi.fn( () => ( {} ) );
export const useSelect = vi.fn( () => ( {} ) );
export const combineReducers = vi.fn( ( reducers ) => reducers );
export const createRegistrySelector = vi.fn( ( fn ) => fn );
export const createRegistryControl = vi.fn( ( fn ) => fn );
