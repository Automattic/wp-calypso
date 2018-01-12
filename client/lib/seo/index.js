/** @format */
/**
 * External dependencies
 */
import { includes } from 'lodash';

export const getConflictingSeoPlugins = activePlugins => {
	const conflictingSeoPlugins = [
		'Yoast SEO',
		'Yoast SEO Premium',
		'All In One SEO Pack',
		'All in One SEO Pack Pro',
	];

	return activePlugins
		.filter( ( { name } ) => includes( conflictingSeoPlugins, name ) )
		.map( ( { name, slug } ) => ( { name, slug } ) );
};
