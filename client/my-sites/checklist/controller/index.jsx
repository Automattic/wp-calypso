/**
 * External Dependencies
 *
 * @format
 */

import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal Dependencies
 */

import { renderWithReduxStore } from 'lib/react-helpers';
import { setSection } from 'state/ui/actions';
import ChecklistShow from '../checklist-show';
import ChecklistThankYou from '../checklist-thank-you';

export function show( context, next ) {
	context.primary = <ChecklistShow />;
	next();
}

export function thankYou( context ) {
	const { params, store } = context;
	store.dispatch( setSection( { name: 'checklist-thank-you' }, { hasSidebar: false } ) );
	renderWithReduxStore(
		<ChecklistThankYou receiptId={ params.receiptId ? Number( params.receiptId ) : 0 } />,
		'primary',
		store
	);
	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
}
