/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestEmbed } from 'state/embeds/actions';

export default function QueryEmbed( { siteId, url } ) {
	const dispatch = useDispatch();

	React.useEffect( () => {
		dispatch( requestEmbed( siteId, url ) );
	}, [ dispatch, siteId, url ] );

	return null;
}
