import { type MockedFunction, vi } from 'vitest';
import { getHelpCenterRouterHistory, isHelpCenterShown } from '../resolvers';
import { getPersistedPreference } from '../utils';
import type { HelpCenterThunkProps } from '../types';

vi.mock( '../utils', () => ( {
	getPersistedPreference: vi.fn(),
} ) );

const mockGetPersistedPreference = getPersistedPreference as MockedFunction<
	typeof getPersistedPreference
>;

describe( 'Help Center resolvers', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	it( 'opens at home when a logged-out session is persisted', async () => {
		const dispatch = vi.fn();
		const select = {
			hasLoggedOutOdieChat: vi.fn( () => true ),
			getHelpCenterOptions: vi.fn( () => ( {} ) ),
			getLoggedOutOdieChat: vi.fn(),
		};

		await isHelpCenterShown()( {
			dispatch,
			select,
		} as unknown as HelpCenterThunkProps );

		expect( mockGetPersistedPreference ).not.toHaveBeenCalled();
		expect( select.getLoggedOutOdieChat ).not.toHaveBeenCalled();
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

	it( 'reopens the saved conversation of the presales bot for the plans-presales launcher', async () => {
		const dispatch = vi.fn();
		const select = {
			hasLoggedOutOdieChat: vi.fn( () => true ),
			getHelpCenterOptions: vi.fn( () => ( {
				launcherContext: 'plans-presales',
				loggedOutBotSlug: 'wpcom-workflow-presales',
			} ) ),
			getLoggedOutOdieChat: vi.fn( () => ( {
				odieId: 123,
				sessionId: 'abc-def',
				botSlug: 'wpcom-workflow-presales',
			} ) ),
		};

		await isHelpCenterShown()( {
			dispatch,
			select,
		} as unknown as HelpCenterThunkProps );

		expect( select.getLoggedOutOdieChat ).toHaveBeenCalledWith( 'wpcom-workflow-presales' );
		expect( dispatch ).toHaveBeenNthCalledWith( 1, {
			type: 'HELP_CENTER_SET_NAVIGATE_TO_ROUTE',
			route: '/odie?chatId=123&sessionId=abc-def&botSlug=wpcom-workflow-presales',
			coalesceParams: false,
		} );
		expect( dispatch ).toHaveBeenNthCalledWith( 2, {
			type: 'HELP_CENTER_SET_SHOW',
			show: true,
		} );
	} );

	it( 'opens the presales launcher on a fresh chat when the saved conversation belongs to another bot', async () => {
		const dispatch = vi.fn();
		const select = {
			hasLoggedOutOdieChat: vi.fn( () => true ),
			getHelpCenterOptions: vi.fn( () => ( {
				launcherContext: 'plans-presales',
				loggedOutBotSlug: 'wpcom-workflow-presales',
			} ) ),
			getLoggedOutOdieChat: vi.fn( () => undefined ),
		};

		await isHelpCenterShown()( {
			dispatch,
			select,
		} as unknown as HelpCenterThunkProps );

		expect( dispatch ).toHaveBeenNthCalledWith( 1, {
			type: 'HELP_CENTER_SET_NAVIGATE_TO_ROUTE',
			route: '/odie',
			coalesceParams: false,
		} );
	} );

	it( 'opens the presales launcher on a fresh chat when no bot slug was provided', async () => {
		const dispatch = vi.fn();
		const select = {
			hasLoggedOutOdieChat: vi.fn( () => true ),
			getHelpCenterOptions: vi.fn( () => ( { launcherContext: 'plans-presales' } ) ),
			getLoggedOutOdieChat: vi.fn(),
		};

		await isHelpCenterShown()( {
			dispatch,
			select,
		} as unknown as HelpCenterThunkProps );

		expect( select.getLoggedOutOdieChat ).not.toHaveBeenCalled();
		expect( dispatch ).toHaveBeenNthCalledWith( 1, {
			type: 'HELP_CENTER_SET_NAVIGATE_TO_ROUTE',
			route: '/odie',
			coalesceParams: false,
		} );
	} );

	it( 'uses the open preference when there is no logged-out session', async () => {
		mockGetPersistedPreference.mockResolvedValue( true );
		const dispatch = vi.fn();
		const select = {
			hasLoggedOutOdieChat: vi.fn( () => false ),
			isHelpCenterShown: vi.fn( () => undefined ),
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

	it.each( [ false, true ] )(
		'leaves the Help Center as it is when it was set to %s while the preference loaded',
		async ( shownMeanwhile ) => {
			mockGetPersistedPreference.mockResolvedValue( true );
			const dispatch = vi.fn();
			const select = {
				hasLoggedOutOdieChat: vi.fn( () => false ),
				isHelpCenterShown: vi.fn( () => shownMeanwhile ),
			};

			await isHelpCenterShown()( {
				dispatch,
				select,
			} as unknown as HelpCenterThunkProps );

			expect( dispatch ).not.toHaveBeenCalled();
		}
	);

	it( 'restores router history when no navigation was requested', async () => {
		const routerHistory = {
			entries: [ { pathname: '/odie', search: '', hash: '', key: 'odie', state: null } ],
			index: 0,
		};
		mockGetPersistedPreference.mockResolvedValue( routerHistory );
		const dispatch = vi.fn();
		const select = {
			getNavigateToRoute: vi.fn( () => undefined ),
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
		const dispatch = vi.fn();
		const route = { current: undefined as string | undefined };
		const select = {
			getNavigateToRoute: vi.fn( () => ( route.current ? { route: route.current } : undefined ) ),
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
