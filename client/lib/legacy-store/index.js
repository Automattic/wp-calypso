/** @format */

/**
 * External dependencies
 */
import engine from 'store/src/store-engine';
import storageLocalStorage from 'store/storages/localStorage';

export default engine.createStore( [ storageLocalStorage ] );
