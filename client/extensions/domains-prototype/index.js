/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { renderWithReduxStore } from 'lib/react-helpers';
import { setSection } from 'state/ui/actions';
import styles from './styles';
import Stylizer, { insertCss } from './stylizer';

const render = ( content, context ) => {
	renderWithReduxStore( (
		<Stylizer onInsertCss={ insertCss }>
			{ content }
		</Stylizer>
	), document.getElementById( 'primary' ), context.store );
};

const success = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	render( (
		<Main>
			<h1 className={ styles.header }>Site is setup</h1>
			<div>You have created a site. blah blah blah.</div>
		</Main> ),
		context
	);
};

export default function() {
	page( '/domains-prototype/success', success );
}
