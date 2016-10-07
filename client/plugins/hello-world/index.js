import page from 'page';
import React from 'react';

import { navigation, siteSelection } from 'my-sites/controller';
import { renderWithReduxStore } from 'lib/react-helpers';
import Main from 'components/main';
import HelloWorld from 'plugins/hello-world/hello-world';

const renderStuff = ( context ) => {
	renderWithReduxStore( (
		<Main>
			<HelloWorld />
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

export default function() {
	page( '/hello-world', siteSelection, navigation, renderStuff );
	page( '/hello-world/:siteId', siteSelection, navigation, renderStuff );
}
