/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { render as clientRender } from 'calypso/controller';

const oHai = ( context, next ) => {
	context.layout = (
		<>
			<span>o hai</span>
		</>
	);

	next();
};

const registerRoutes = () => {
	const BASE = '/pricing-new';

	page( `${ BASE }/`, oHai, clientRender );

	page.start( { decodeURLComponents: false } );
};

window.AppBoot = () => {
	registerRoutes();
};
