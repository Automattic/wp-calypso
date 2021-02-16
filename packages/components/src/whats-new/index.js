/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { Card } from '@automattic/components';
import WPCOM from 'wpcom';

/**
 * Internal dependencies
 */

const WhatsNew = () => {
	const [ isLoaded, setIsLoaded ] = useState( false );
	const [ whatsNewList, setWhatsNewList ] = useState();

	useEffect( () => {
		const results = WPCOM.req.get( `/whats-new/list`, '2' );
		setWhatsNewList( results );
		setIsLoaded( true );
		// wpcom
		// 	.req.get( {
		// 		path: `/whats-new/list`,
		// 		apiNamespace: 'wpcom/v2',
		// 	} )
		// 	.then( ( returnedList ) => {
		// 		setWhatsNewList( returnedList );
		// 		setIsLoaded( true );
		// 	} )
		// 	.catch( ( error ) => {
		// 		this.showErrorNotice();
		// 	} );
	}, [] );

	return <Card>{ isLoaded && JSON.stringify( whatsNewList ) }</Card>;
};

export default WhatsNew;
