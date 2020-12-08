/**
 * External dependencies
 */
import React, { useState } from 'react';
/**
 * Internal dependencies
 */
import QueryViewers from 'calypso/components/data/query-viewers';
import { localize } from 'i18n-calypso';
import Viewers from './viewers';

const DEFAULT_NUMBER_OF_VIEWERS = 100;

const ViewersList = ( { site, label } ) => {
	const [ page, setPage ] = useState( 1 );
	const incrementPage = () => setPage( page + 1 );

	return (
		<>
			<QueryViewers siteId={ site.ID } page={ page } number={ DEFAULT_NUMBER_OF_VIEWERS } />
			<Viewers site={ site } label={ label } incrementPage={ incrementPage } page={ page } />
		</>
	);
};

export default localize( ViewersList );
