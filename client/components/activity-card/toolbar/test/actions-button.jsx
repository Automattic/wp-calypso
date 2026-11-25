/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { vi } from 'vitest';
import { areJetpackCredentialsInvalid } from 'calypso/state/jetpack/credentials/selectors';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import getIsRestoreInProgress from 'calypso/state/selectors/get-is-restore-in-progress';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import ActionsButton from '../actions-button';

vi.mock( 'calypso/lib/jetpack/actionable-rewind-id' );

vi.mock( 'react', async () => ( {
	...( await vi.importActual( 'react' ) ),
	useState: vi.fn( () => [ false, vi.fn() ] ),
} ) );

vi.mock( 'i18n-calypso', async () => ( {
	...( await vi.importActual( 'i18n-calypso' ) ),
	useRtl: vi.fn(),
	localize: ( x ) => x,
	translate: ( x ) => x,
	useTranslate: vi.fn( () => ( text ) => text ),
} ) );

vi.mock( 'react-redux', async () => ( {
	...( await vi.importActual( 'react-redux' ) ),
	useSelector: vi.fn().mockImplementation( ( selector ) => selector() ),
	useDispatch: vi.fn().mockImplementation( () => () => {} ),
} ) );

vi.mock( 'calypso/components/popover-menu', () => ( { default: 'components--popover--menu' } ) );

vi.mock( 'calypso/state/jetpack/credentials/selectors', () => ( {
	areJetpackCredentialsInvalid: vi.fn().mockImplementation( () => false ),
} ) );

vi.mock( 'calypso/state/selectors/get-does-rewind-need-credentials' );
vi.mock( 'calypso/state/selectors/get-is-restore-in-progress' );
vi.mock( 'calypso/state/selectors/is-site-automated-transfer' );

vi.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteSlug: vi.fn().mockImplementation( () => 'mysite.example' ),
	isJetpackSiteMultiSite: vi.fn().mockImplementation( () => false ),
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
	useState.mockReturnValueOnce( [ isPopoverVisible, vi.fn() ] );
}

describe( 'ActionsButton render', () => {
	beforeEach( () => {
		vi.clearAllMocks();
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
