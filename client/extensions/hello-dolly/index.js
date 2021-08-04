import page from 'page';
import React from 'react';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import HelloDollyPage from './hello-dolly-page';
import reducer from './state/reducer';

const render = ( context, next ) => {
	context.primary = <HelloDollyPage />;
	next();
};

export default async function ( _, addReducer ) {
	await addReducer( [ 'extensions', 'helloDolly' ], reducer );

	page( '/hello-dolly/:site?', siteSelection, navigation, render, makeLayout, clientRender );
}
