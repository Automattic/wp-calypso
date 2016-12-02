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
import Main from 'components/main';

const render = ( context ) => {
	renderWithReduxStore( (
		<Main>
			<h1>Hello, World!</h1>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

export default function() {
	page( '/hello-world', siteSelection, navigation, render );
}
