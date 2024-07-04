/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { areJetpackCredentialsInvalid } from 'calypso/state/jetpack/credentials/selectors';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import getIsRestoreInProgress from 'calypso/state/selectors/get-is-restore-in-progress';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import ActionsButton from '../actions-button';

jest.mock( 'calypso/lib/jetpack/actionable-rewind-id' );

jest.mock( 'react', () => ( {
	...jest.requireActual( 'react' ),
	useState: jest.fn( () => [ false, jest.fn() ] ),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useRtl: jest.fn(),
	localize: ( x ) => x,
	translate: ( x ) => x,
	useTranslate: jest.fn( () => ( text ) => text ),
} ) );

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn().mockImplementation( ( selector ) => selector() ),
	useDispatch: jest.fn().mockImplementation( () => () => {} ),
} ) );

jest.mock( 'calypso/components/popover-menu', () => 'components--popover--menu' );

jest.mock( 'calypso/state/jetpack/credentials/selectors', () => ( {
	areJetpackCredentialsInvalid: jest.fn().mockImplementation( () => false ),
} ) );

jest.mock( 'calypso/state/selectors/get-does-rewind-need-credentials' );
jest.mock( 'calypso/state/selectors/get-is-restore-in-progress' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );

jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteSlug: jest.fn().mockImplementation( () => 'mysite.example' ),
	isJetpackSiteMultiSite: jest.fn().mockImplementation( () => false ),
} ) );

function createState( siteId = 1 ) {
	return {
		currentUser: {
			capabilities: {
				[ siteId ]: {
					publish_posts: true,
				},
			},
		},
		sites: {
			plans: {
				[ siteId ]: {},
			},
		},
		ui: {
			selectedSiteId: siteId,
		},
	};
}

function initializeUseStateMock( { isPopoverVisible = true } = {} ) {
	useState.mockReturnValueOnce( [ isPopoverVisible, jest.fn() ] );
}

describe( 'ActionsButton render', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'Site is multisite. Show download button', () => {
		isJetpackSiteMultiSite.mockImplementation( () => true );

		const mockStore = configureStore();
		const store = mockStore( createState() );

		// Render component
		render(
			<Provider store={ store }>
				<ActionsButton />
			</Provider>
		);

		expect( screen.queryByText( /Download backup/i ) ).toBeVisible();
	} );

	test( 'Available action is "clone"', () => {
		isJetpackSiteMultiSite.mockImplementation( () => false );

		const mockStore = configureStore();
		const store = mockStore( createState() );

		const availableActions = [ 'clone' ];
		// Render component
		render(
			<Provider store={ store }>
				<ActionsButton availableActions={ availableActions } />
			</Provider>
		);

		expect( screen.queryByText( /Clone from here/i ) ).toBeVisible();
	} );

	test( 'Available actions are download and restore', () => {
		const availableActions = [ 'rewind', 'download' ];

		initializeUseStateMock();

		isJetpackSiteMultiSite.mockImplementation( () => false );
		areJetpackCredentialsInvalid.mockImplementation( () => false );
		getIsRestoreInProgress.mockImplementation( () => false );
		getDoesRewindNeedCredentials.mockImplementation( () => false );
		isSiteAutomatedTransfer.mockImplementation( () => false );

		const mockStore = configureStore();
		const store = mockStore( createState() );

		// Render component
		render(
			<Provider store={ store }>
				<ActionsButton availableActions={ availableActions } />
			</Provider>
		);

		const linkElements = screen.getAllByRole( 'link' );
		const downloadButton = linkElements.find( ( link ) =>
			link.classList.contains( 'toolbar__download-button' )
		);
		const restoredButton = linkElements.find( ( link ) =>
			link.classList.contains( 'toolbar__restore-button' )
		);

		expect( downloadButton ).toBeInTheDocument();
		expect( downloadButton.textContent ).toEqual( 'Download backup' );

		expect( restoredButton ).toBeInTheDocument();
		expect( restoredButton.textContent ).toEqual( 'Restore to this point' );
	} );
} );
