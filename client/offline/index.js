/** @format */

/**
 * Internal dependencies
 */
import { offline } from './controller';
import { makeLayout } from 'controller';

export default router => {
	router( '/offline', offline, makeLayout );
};
