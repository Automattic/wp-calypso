/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import AsyncLoad from 'calypso/components/async-load';
import AgentsManagerLoader from '../agents-manager-loader';

let mockUser: { ID: number } | null = { ID: 1 };
let mockSelectedSite: { ID: number } | null = null;
jest.mock( 'react-redux', () => ( { useSelector: ( selector: () => unknown ) => selector() } ) );
jest.mock( 'calypso/state/current-user/selectors', () => ( { getCurrentUser: () => mockUser } ) );
jest.mock( 'calypso/state/ui/selectors', () => ( { isSiteSection: () => false } ) );
jest.mock( '../use-help-center-site', () => ( {
	useHelpCenterSite: () => ( { selectedSite: mockSelectedSite, site: { ID: 99 } } ),
} ) );
jest.mock( 'calypso/components/async-load', () => jest.fn( () => null ) );

afterEach( () => {
	jest.clearAllMocks();
	mockUser = { ID: 1 };
	mockSelectedSite = null;
} );
it( 'keeps site-less marketplace context and updates it when switching sites', () => {
	const { rerender } = render( <AgentsManagerLoader sectionName="plugins" /> );
	expect( AsyncLoad ).toHaveBeenLastCalledWith(
		expect.objectContaining( { site: null, currentSiteId: undefined } ),
		undefined
	);
	mockSelectedSite = { ID: 42 };
	rerender( <AgentsManagerLoader sectionName="plugins" /> );
	expect( AsyncLoad ).toHaveBeenLastCalledWith(
		expect.objectContaining( { site: { ID: 42 }, currentSiteId: 42 } ),
		undefined
	);
	mockSelectedSite = null;
	rerender( <AgentsManagerLoader sectionName="plugins" /> );
	expect( AsyncLoad ).toHaveBeenLastCalledWith(
		expect.objectContaining( { site: null, currentSiteId: undefined } ),
		undefined
	);
} );
it( 'does not load for logged-out visitors', () => {
	mockUser = null;
	render( <AgentsManagerLoader sectionName="plugins" /> );
	expect( AsyncLoad ).not.toHaveBeenCalled();
} );
