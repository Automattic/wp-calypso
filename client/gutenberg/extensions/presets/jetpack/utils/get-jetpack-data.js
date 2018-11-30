/** @format */
/**
 * External Dependencies
 */
import { get } from 'lodash';
import apiFetch from '@wordpress/api-fetch';

const JETPACK_DATA_PATH = [ 'Jetpack_Editor_Initial_State' ];

export default async function getJetpackData() {
	const jetpackData = get( 'object' === typeof window ? window : null, JETPACK_DATA_PATH, null );

	//we may be on Gutenlypso
	if ( ! jetpackData ) {
		const gutenlypsoData = await apiFetch( {
			path: '/gutenberg/available-extensions',
			method: 'GET',
			apiNamespace: 'wpcom/v2',
		} );

		return {
			available_blocks: gutenlypsoData,
		};
	}
}
