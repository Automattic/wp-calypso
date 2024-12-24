/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import Modal from 'react-modal';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { ACTIVATE_PLUGIN } from 'calypso/lib/plugins/constants';
import { getSite } from 'calypso/state/sites/selectors';
import RemovePlugin from '../remove-plugin';
import { site, plugin } from './utils/constants';

const HEADING_TEXT = 'Heading';
const MESSAGE_TEXT = 'Message';
const CONFIRM_TEXT = 'OK';
const CANCEL_TEXT = 'Cancel';
jest.mock( '../../hooks/use-get-dialog-text', () =>
	jest.fn().mockReturnValue( () => ( {
		heading: HEADING_TEXT,
		message: MESSAGE_TEXT,
		cta: {
			confirm: CONFIRM_TEXT,
			cancel: CANCEL_TEXT,
		},
	} ) )
);

const initialState = {
	sites: { items: { [ site.ID ]: site } },
	currentUser: {
		capabilities: {},
	},
	plugins: {
		installed: {
			isRequesting: {},
			isRequestingAll: false,
			plugins: {
				[ `${ site.ID }` ]: [ plugin ],
			},
			status: {
				[ `${ site.ID }` ]: {
					[ plugin.id ]: {
						status: 'completed',
						action: ACTIVATE_PLUGIN,
					},
				},
			},
		},
	},
};

describe( '<RemovePlugin>', () => {
	const middlewares = [ thunk ];
	const mockStore = configureStore( middlewares );
	const store = mockStore( initialState );

	let modalRoot;

	beforeAll( () => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.post( `/rest/v1.1/sites/${ site.ID }/plugins/${ plugin.id }/delete` )
			.reply( 200 );
	} );

	afterAll( () => {
		nock.cleanAll();
	} );

	beforeEach( () => {
		modalRoot = document.createElement( 'div' );
		modalRoot.setAttribute( 'id', 'modal-root' );
		document.body.appendChild( modalRoot );
		Modal.setAppElement( modalRoot );
	} );

	afterEach( () => {
		unmountComponentAtNode( modalRoot );
		document.body.removeChild( modalRoot );
		modalRoot = null;
	} );

	test( 'should render correctly and return null', async () => {
		// The site object passed around Calypso is more than just the raw
		// state.site.items object; pass in a version from the getSite selector
		// so that we get other important properties like `canUpdateFiles`.
		const testSite = getSite( store.getState(), site.ID );

		const { container } = render(
			<Provider store={ store }>
				<RemovePlugin site={ testSite } plugin={ plugin } />
			</Provider>
		);

		const [ removeButton ] = container.getElementsByClassName(
			'plugin-remove-button__remove-button'
		);

		expect( removeButton.textContent ).toEqual( 'Remove' );
		// Test to check if modal is open
		expect(
			document.getElementsByClassName( 'components-button is-scary is-primary' )[ 0 ]
		).toBeFalsy();
		// Simulate click which opens up a modal
		await userEvent.click( removeButton );
		// Test to check if modal is open and has `Remove Button`
		const [ removeButtonOnModal ] = document.getElementsByClassName(
			'components-button is-scary is-primary'
		);
		expect( removeButtonOnModal ).toBeInTheDocument();
		expect( removeButtonOnModal.textContent ).toEqual( CONFIRM_TEXT );
		// Simulate click which triggers API call to remove plugin
		await userEvent.click( removeButtonOnModal );
		// Test to check if modal is closed after the API is triggered
		expect(
			document.getElementsByClassName( 'components-button is-scary is-primary' )[ 0 ]
		).toBeFalsy();
	} );
} );
