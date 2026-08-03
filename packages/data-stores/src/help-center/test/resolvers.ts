import { getHelpCenterRouterHistory, isHelpCenterShown } from '../resolvers';
import { getPersistedPreference } from '../utils';
import type { HelpCenterThunkProps } from '../types';

jest.mock( '../utils', () => ( {
	getPersistedPreference: jest.fn(),
} ) );

const mockGetPersistedPreference = getPersistedPreference as jest.MockedFunction<
	typeof getPersistedPreference
>;

describe( 'Help Center resolvers', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens at home when a logged-out session is persisted', async () => {
		const dispatch = jest.fn();
		const select = {
			hasLoggedOutOdieChat: jest.fn( () => true ),
		};

		await isHelpCenterShown()( {
			dispatch,
			select,
		} as unknown as HelpCenterThunkProps );

		expect( mockGetPersistedPreference ).not.toHaveBeenCalled();
		expect( dispatch ).toHaveBeenNthCalledWith( 1, {
			type: 'HELP_CENTER_SET_NAVIGATE_TO_ROUTE',
			route: '/',
			coalesceParams: false,
		} );
		expect( dispatch ).toHaveBeenNthCalledWith( 2, {
			type: 'HELP_CENTER_SET_SHOW',
			show: true,
		} );
	} );

	it( 'uses the open preference when there is no logged-out session', async () => {
		mockGetPersistedPreference.mockResolvedValue( true );
		const dispatch = jest.fn();
		const select = {
			hasLoggedOutOdieChat: jest.fn( () => false ),
		};

		await isHelpCenterShown()( {
			dispatch,
			select,
		} as unknown as HelpCenterThunkProps );

		expect( dispatch ).toHaveBeenCalledWith( {
			type: 'HELP_CENTER_SET_SHOW',
			show: true,
		} );
	} );

	it( 'restores router history when no navigation was requested', async () => {
		const routerHistory = {
			entries: [ { pathname: '/odie', search: '', hash: '', key: 'odie', state: null } ],
			index: 0,
		};
		mockGetPersistedPreference.mockResolvedValue( routerHistory );
		const dispatch = jest.fn();
		const select = {
			getNavigateToRoute: jest.fn( () => undefined ),
		};

		await getHelpCenterRouterHistory()( {
			dispatch,
			select,
		} as unknown as HelpCenterThunkProps );

		expect( dispatch ).toHaveBeenCalledWith( {
			type: 'HELP_CENTER_SET_HELP_CENTER_ROUTER_HISTORY',
			history: routerHistory,
		} );
	} );

	it( 'does not overwrite navigation requested while router history is loading', async () => {
		const routerHistory = {
			entries: [ { pathname: '/odie', search: '', hash: '', key: 'odie', state: null } ],
			index: 0,
		};
		let resolvePreference: ( value: typeof routerHistory ) => void = () => {};
		mockGetPersistedPreference.mockReturnValue(
			new Promise( ( resolve ) => {
				resolvePreference = resolve;
			} )
		);
		const dispatch = jest.fn();
		const route = { current: undefined as string | undefined };
		const select = {
			getNavigateToRoute: jest.fn( () => ( route.current ? { route: route.current } : undefined ) ),
		};

		const resolution = getHelpCenterRouterHistory()( {
			dispatch,
			select,
		} as unknown as HelpCenterThunkProps );

		route.current = '/';
		resolvePreference( routerHistory );
		await resolution;

		expect( dispatch ).not.toHaveBeenCalled();
	} );
} );
