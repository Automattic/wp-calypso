/**
 * @jest-environment jsdom
 */
//import { useBreakpoint } from '@automattic/viewport-react';
import { render, screen } from '@testing-library/react';
import renderer from 'react-test-renderer';

import moment from 'moment';
import { useState } from 'react';
import { useDispatch, Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import {
	FormMode,
	INITIAL_FORM_STATE,
	INITIAL_FORM_ERRORS,
} from 'calypso/components/advanced-credentials/form';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import getJetpackCredentialsTestStatus from 'calypso/state/selectors/get-jetpack-credentials-test-status';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import isRequestingSiteCredentials from 'calypso/state/selectors/is-requesting-site-credentials';
import BackupCloneFlow from '../index';

import config from '@automattic/calypso-config';

/*
jest.mock( 'calypso/../packages/viewport-react', () => ( {
	...jest.requireActual( 'calypso/../packages/viewport-react' ),
	//useBreakpoint: () => 'OYE',
	withMobileBreakpoint: jest.fn(),
} ) );
*/

jest.mock( 'calypso/../packages/viewport-react', () => ( {
	...jest.requireActual( 'calypso/../packages/viewport-react' ),
	//useBreakpoint: () => 'OYE',
	withMobileBreakpoint: () => {
		const WordpressCompose = require( '@wordpress/compose' );
		const React = require( 'react' );
		//import { createHigherOrderComponent } from '@wordpress/compose';
		return WordpressCompose.createHigherOrderComponent(
			( WrappedComponent ) =>
				React.forwardRef( ( props, ref ) => {
					const isActive = false;
					return <WrappedComponent { ...props } isBreakpointActive={ isActive } ref={ ref } />;
				} ),
			'WithMobileBreakpoint'
		);
	},
} ) );

/*
export const withMobileBreakpoint = createHigherOrderComponent(
	( WrappedComponent ) =>
		forwardRef( ( props, ref ) => {
			const isActive = useBreakpoint( MOBILE_BREAKPOINT );
			return <WrappedComponent { ...props } isBreakpointActive={ isActive } ref={ ref } />;
		} ),
	'WithMobileBreakpoint'
);

*/

// TODO Not working
jest.mock( 'i18n-calypso', () => ( {
	localize: ( x ) => x,
	translate: ( x ) => x,
	useTranslate: () => ( x ) => x,
} ) );

jest.mock( 'react', () => ( {
	...jest.requireActual( 'react' ),
	useState: jest.fn(),
} ) );

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn().mockImplementation( ( selector ) => selector() ),
	useDispatch: jest.fn().mockImplementation( () => () => {} ),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/track-component-view', () =>
	require( 'calypso/components/empty-component' )
);
jest.mock( 'calypso/lib/analytics/page-view-tracker', () =>
	require( 'calypso/components/empty-component' )
);

jest.mock( 'calypso/components/localized-moment', () => ( {
	...jest.requireActual( 'calypso/components/localized-moment' ),
	useLocalizedMoment: jest.fn(),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: jest.fn( () => ( text ) => text ),
} ) );

jest.mock( 'calypso/data/activity-log/use-rewindable-activity-log-query', () =>
	jest.fn().mockImplementation( () => [] )
);

jest.mock( 'calypso/state/selectors/get-site-gmt-offset', () =>
	jest.fn().mockImplementation( () => null )
);

jest.mock( 'calypso/state/selectors/get-site-timezone-value', () =>
	jest.fn().mockImplementation( () => null )
);

jest.mock( 'calypso/state/selectors/get-jetpack-credentials-test-status' );
jest.mock( 'calypso/state/selectors/get-rewind-state' );
jest.mock( 'calypso/state/selectors/is-requesting-site-credentials' );

jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteSlug: jest.fn().mockImplementation( () => 'mysite.example' ),
} ) );

jest.mock( 'calypso/state/ui/selectors', () => ( {
	...jest.requireActual( 'calypso/state/ui/selectors' ),
	getSelectedSiteId: jest.fn().mockImplementation( () => 1 ),
	getSelectedSiteSlug: jest.fn().mockImplementation( () => 'mysite.example' ),
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
			section: {
				name: 'backup"',
				paths: [ '/backup' ],
				module: 'calypso/my-sites/backup',
				group: 'sites',
			},
		},
		preferences: {
			remoteValues: {},
		},
		documentHead: { unreadCount: 1 },
	};
}

function setUseStateMockCloneFlow( {
	userHasRequestedRestore = false,
	userHasSetDestination = false,
	cloneDestination = '',
	userHasSetBackupPeriod = false,
	backupPeriod = '',
	backupDisplayDate = '',
} ) {
	useState
		.mockReturnValueOnce( [
			'{"themes":true,"plugins":true,"uploads":true,"sqls":true,"roots":true,"contents":true}',
			jest.fn(),
		] ) // rewindConfig
		.mockReturnValueOnce( [ userHasRequestedRestore, jest.fn() ] )
		.mockReturnValueOnce( [ userHasSetDestination, jest.fn() ] )
		.mockReturnValueOnce( [ cloneDestination, jest.fn() ] )
		.mockReturnValueOnce( [ userHasSetBackupPeriod, jest.fn() ] )
		.mockReturnValueOnce( [ backupPeriod, jest.fn() ] )
		.mockReturnValueOnce( [ backupDisplayDate, jest.fn() ] );
}

function setUseStateMockAdvancedCredentials() {
	useState
		.mockReturnValueOnce( [ INITIAL_FORM_STATE, jest.fn() ] ) // setFormState
		.mockReturnValueOnce( [ INITIAL_FORM_ERRORS, jest.fn() ] ) // setFormErrors;
		.mockReturnValueOnce( [ FormMode.Password, jest.fn() ] ) // setFormMode
		.mockReturnValueOnce( [ false, jest.fn() ] ) // setStartedWithoutConnection
		.mockReturnValueOnce( [ false, jest.fn() ] ) // setTestCredentialsLoading
		.mockReturnValueOnce( [ false, jest.fn() ] ); // setTestCredentialsResult
}

function setUseStateMockSetDest( { stateMobile = { isActive: false, breakpoint: false } } = {} ) {
	useState.mockReturnValueOnce( [ stateMobile, jest.fn() ] );
}

describe( 'BackupCloneFlow', () => {
	describe.skip( 'Render loading', () => {
		beforeEach( () => {
			jest.clearAllMocks();
			useLocalizedMoment.mockImplementation( () => moment );
			//useTranslate.mockImplementation( mockUseTranslate );
		} );

		test( 'Show RewindFlowLoading if it is not initialized', () => {
			// Mock dispatch
			const mockedDispatch = jest.fn();
			useDispatch.mockReturnValue( mockedDispatch );

			getRewindState.mockImplementation( () => ( {
				state: 'uninitialized',
			} ) );

			const mockStore = configureStore();
			const store = mockStore( createState() );

			setUseStateMockCloneFlow();

			// Render component
			render(
				<Provider store={ store }>
					<BackupCloneFlow />
				</Provider>
			);

			expect( screen.getByText( 'Loading restore status…' ) ).toBeVisible();
		} );
	} );

	describe.skip( 'Render setDestination', () => {
		test( 'Advance credentials render renderCredentialsForm', () => {
			// Mock dispatch
			const mockedDispatch = jest.fn();
			useDispatch.mockReturnValue( mockedDispatch );

			getRewindState.mockImplementation( () => ( {
				state: 'active',
			} ) );

			const mockStore = configureStore();
			const store = mockStore( createState() );

			setUseStateMockCloneFlow();
			setUseStateMockAdvancedCredentials();
			setUseStateMockAdvancedCredentials(); //I don't know but it is called twice
			getJetpackCredentialsTestStatus.mockImplementation( () => 'pending' );
			isRequestingSiteCredentials.mockImplementation( () => false );

			// Render component
			render(
				<Provider store={ store }>
					<BackupCloneFlow />
				</Provider>
			);

			expect( screen.queryByText( /Loading restore status…/i ) ).toBeNull();
			expect(
				screen.queryByText( /Enter the server credentials from your hosting provider/i )
			).toBeVisible();
		} );
	} );

	describe( 'Render setBackupPeriod', () => {
		test( 'lalala', () => {
			// Mock dispatch
			const mockedDispatch = jest.fn();
			useDispatch.mockReturnValue( mockedDispatch );

			getRewindState.mockImplementation( () => ( {
				state: 'active',
			} ) );

			const mockStore = configureStore();
			const store = mockStore( createState() );

			setUseStateMockCloneFlow( { userHasSetDestination: true } );
			//setUseStateMockSetDest();
			//getJetpackCredentialsTestStatus.mockImplementation( () => 'pending' );
			//isRequestingSiteCredentials.mockImplementation( () => false );

			// TODO This mock is not working :( Why?
			/*
			useBreakpoint.mockImplementation( ( breakpoint ) => {
				if ( '<480px' === breakpoint ) {
					console.log('### MOCK MOBILE');
					return false;
				}
				console.log('### MOCK DESKTOP');
				return false;
			} );

*/

			// Render component
			render(
				<Provider store={ store }>
					<BackupCloneFlow />
				</Provider>
			);

			/*
			const tree = renderer
            .create(<Provider store={ store }> <BackupCloneFlow  /> </Provider>)
            .toJSON();

		console.log(tree);
		*/
			/*
			const defaultProps = {
				countryCode: 'US',
				getFieldProps: ( name ) => ( { name, value: '' } ),
				translate: ( string ) => string,
				store,
			};


			renderWithProvider( <BackupCloneFlow { ...defaultProps } /> );
*/
			expect( screen.queryByText( /Loading restore status…/i ) ).toBeNull();
			//expect(
			//	screen.queryByText( /Enter the server credentials from your hosting provider/i )
			//).toBeVisible();
		} );
	} );
} );
