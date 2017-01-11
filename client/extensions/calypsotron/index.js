import page from 'page';
import React from 'react';

import { navigation, siteSelection } from 'my-sites/controller';
import { renderWithReduxStore } from 'lib/react-helpers';
import Main from 'components/main';
import Card from 'components/card';

const render = ( context ) => {
	renderWithReduxStore( (
		<Main className="calypsotron__main">
			<Card>Placeholder</Card>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

export default function() {
	page( '/calypsotron/:site?', siteSelection, navigation, render );
}

