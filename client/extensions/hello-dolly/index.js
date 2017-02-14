/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { navigation, siteSelection } from 'my-sites/controller';
import { renderWithReduxStore } from 'lib/react-helpers';
import HelloDollyPage from './hello-dolly-page';
import reducer from './state/reducer';
import useReducer from './use-reducer';

const MainPage = useReducer( 'helloDolly', reducer )( HelloDollyPage );

const render = ( context ) => {
	renderWithReduxStore( <MainPage />, document.getElementById( 'primary' ), context.store );
};

export default function() {
	page( '/hello-dolly/:site?', siteSelection, navigation, render );
}
