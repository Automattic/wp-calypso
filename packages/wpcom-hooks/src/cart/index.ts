/**
 * External dependencies
 */
import React from 'react';
import WPCOM from 'wpcom';
import apiFetch from '@wordpress/api-fetch';

export function useSiteCart( siteId: string ) {
	const [ cart, setCart ] = React.useState( 0 );
	const [ updateTick, setUpdateTick ] = React.useState( 1 );

	React.useEffect( () => {
		const wpcom = new WPCOM( undefined, apiFetch );
		( async function () {
			const serverCart = await wpcom.sendRequest(
				{
					global: true, // needed when used in wp-admin, otherwise wp-admin will add site-prefix (search for wpcomFetchAddSitePrefix)
					url: `https://public-api.wordpress.com/rest/v1/sites/${ siteId }/shopping-cart`,
					mode: 'cors',
					credentials: 'omit',
				},
				() => 0
			);
			setCart( serverCart );
		} )();
	}, [ siteId, updateTick ] );

	async function publicSetCart( newCart: number ) {
		setCart( newCart );
		setUpdateTick( ( tick ) => tick++ );
	}

	return [ cart, publicSetCart ];
}
