/**
 * Mock for @wordpress/data package
 * Prevents module-level store initialization errors in tests
 */

// Mutable mocks that tests can override
// Default implementations return empty objects so tests can use mockImplementation
export const dispatch = jest.fn( () => ( {} ) );
export const select = jest.fn( () => ( {} ) );
export const resolveSelect = jest.fn( () => ( {} ) );

// Function mocks
export const createReduxStore = jest.fn( () => ( {} ) );
export const createSelector = jest.fn( ( fn ) => fn );
export const register = jest.fn();
export const useDispatch = jest.fn( () => ( {} ) );
export const useSelect = jest.fn( () => ( {} ) );
export const combineReducers = jest.fn( ( reducers ) => reducers );
export const createRegistrySelector = jest.fn( ( fn ) => fn );
export const createRegistryControl = jest.fn( ( fn ) => fn );
