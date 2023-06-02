import { plugins, use } from '@wordpress/data';
import persistOptions from './one-week-persistence-config';

let isRegistered = false;

export const registerPlugins = () => {
	if ( isRegistered ) {
		return;
	}

	isRegistered = true;

	/**
	 * Register plugins for data-stores
	 */
	use( plugins.persistence, persistOptions );
};
