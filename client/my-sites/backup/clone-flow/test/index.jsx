/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import moment from 'moment';
import { useDispatch, Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import BackupCloneFlow from '../index';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn().mockImplementation( ( selector ) => selector() ),
	useDispatch: jest.fn().mockImplementation( () => () => {} ),
} ) );

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

jest.mock( 'calypso/state/selectors/get-rewind-state' );

jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteSlug: jest.fn().mockImplementation( () => 'mysite.example' ),
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
		ui: { selectedSiteId: siteId },
		preferences: {
			remoteValues: {},
		},
		documentHead: { unreadCount: 1 },
	};
}

describe( 'BackupCloneFlow', () => {
	describe( 'RewindFlowLoading', () => {
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

			// Render component
			render(
				<Provider store={ store }>
					<BackupCloneFlow />
				</Provider>
			);

			expect( screen.getByText( 'Loading restore status…' ) ).toBeVisible();
		} );

		test.skip( 'Dont show RewindFlowLoading if it is already initialized', () => {
			// Mock dispatch
			const mockedDispatch = jest.fn();
			useDispatch.mockReturnValue( mockedDispatch );

			getRewindState.mockImplementation( () => ( {
				state: 'other-state',
				rewind: 11111,
			} ) );

			const mockStore = configureStore();
			const store = mockStore( createState() );

			// Render component
			render(
				<Provider store={ store }>
					<BackupCloneFlow />
				</Provider>
			);

			expect( screen.getByText( 'Loading restore status…' ) ).not.toBeVisible();
		} );
	} );
} );
