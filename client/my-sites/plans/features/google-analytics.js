/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import Card from 'components/card';

export default function( context ) {
	renderWithReduxStore(
		<Main>
			<HeaderCake>Google Analytics</HeaderCake>
			<Card>
				<span>Teest</span>
			</Card>
		</Main>,
		document.getElementById( 'primary' ),
		context.store
	);
}
