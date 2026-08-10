/**
 * @jest-environment jsdom
 */
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { pluginManagementContext } from '../controller';

jest.mock( 'calypso/state/partner-portal/partner/selectors' );
jest.mock( 'calypso/state/ui/actions' );
jest.mock( 'calypso/state/ui/selectors' );

const mockedIsAgencyUser = isAgencyUser as jest.MockedFunction< typeof isAgencyUser >;
const mockedSetSelectedSiteId = setSelectedSiteId as jest.MockedFunction<
	typeof setSelectedSiteId
>;
const mockedGetSelectedSiteId = getSelectedSiteId as jest.MockedFunction<
	typeof getSelectedSiteId
>;

const createContext = ( params: { site?: string } ) => ( {
	params,
	path: '/plugins/manage/sites',
	secondary: undefined as unknown,
	store: {
		getState: () => ( {} ),
		dispatch: jest.fn(),
	},
} );

describe( 'pluginManagementContext', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockedIsAgencyUser.mockReturnValue( true );
	} );

	test( 'clears the selected site on the multi-site view', () => {
		mockedGetSelectedSiteId.mockReturnValue( 123 );
		const context = createContext( {} );
		const next = jest.fn();

		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial page.js context
		pluginManagementContext( context as any, next );

		expect( mockedSetSelectedSiteId ).toHaveBeenCalledWith( null );
		expect( context.store.dispatch ).toHaveBeenCalledTimes( 1 );
		expect( context.secondary ).toBeTruthy();
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'keeps the selected site on the per-site view', () => {
		mockedGetSelectedSiteId.mockReturnValue( 123 );
		const context = createContext( { site: 'example.com' } );
		const next = jest.fn();

		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial page.js context
		pluginManagementContext( context as any, next );

		expect( mockedSetSelectedSiteId ).not.toHaveBeenCalled();
		expect( context.store.dispatch ).not.toHaveBeenCalled();
		expect( context.secondary ).toBeUndefined();
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );
} );
