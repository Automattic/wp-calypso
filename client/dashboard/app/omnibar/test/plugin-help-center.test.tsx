/**
 * @jest-environment jsdom
 */
import { render, renderHook } from '@testing-library/react';
import { useAnalytics } from '../../analytics';
import { useHelpCenter } from '../../help-center';
import { adminBarIcon } from '../admin-bar-icon';
import { useHelpCenterPlugin } from '../plugin-help-center';
import type { AdminBarNode } from '@automattic/omnibar';

jest.mock( '@automattic/api-queries', () => ( { omnibarSiteIdQuery: jest.fn( () => ( {} ) ) } ) );
jest.mock( '@automattic/calypso-analytics', () => ( {
	withSiteContext: jest.fn( ( props ) => props ),
} ) );
jest.mock( '@tanstack/react-query', () => ( { useQuery: jest.fn( () => ( { data: 7 } ) ) } ) );
jest.mock( '../../analytics', () => ( {
	useAnalytics: jest.fn( () => ( { recordTracksEvent: jest.fn() } ) ),
} ) );
jest.mock( '../../help-center', () => ( {
	useHelpCenter: jest.fn( () => ( { isShown: false, setShowHelpCenter: jest.fn() } ) ),
} ) );
jest.mock( '../admin-bar-icon', () => ( {
	adminBarIcon: jest.fn( ( _name, className ) => (
		<span className={ className }>
			<svg />
		</span>
	) ),
} ) );

const mockUseHelpCenter = useHelpCenter as jest.MockedFunction< typeof useHelpCenter >;
const setShowHelpCenter = jest.fn();
const recordTracksEvent = jest.fn();

const ICON = 'help';

const node = ( id: string, extra: Partial< AdminBarNode > = {} ): AdminBarNode => ( {
	id,
	title: `<span>${ id }</span>`,
	parent: 'top-secondary',
	href: '',
	group: false,
	...extra,
} );

const HELP_CENTER_NODE = node( 'help-center', {
	href: 'https://wordpress.com/help',
	meta: { icon: ICON, class: 'menupop', target: '_blank' },
} );

const renderPlugin = ( adminBarNodes: AdminBarNode[] ) =>
	renderHook( () => useHelpCenterPlugin( { sectionName: 'sites', adminBarNodes } ) ).result.current;

describe( 'useHelpCenterPlugin', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( useAnalytics ).mockReturnValue( {
			recordTracksEvent,
			recordPageView: jest.fn(),
		} );
		mockUseHelpCenter.mockReturnValue( {
			isShown: false,
			setShowHelpCenter,
		} as unknown as ReturnType< typeof useHelpCenter > );
	} );

	it( 'does not track an unrendered node', () => {
		renderPlugin( [] );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'tracks an impression only when the icon renders', () => {
		const result = renderPlugin( [] );
		expect( recordTracksEvent ).not.toHaveBeenCalled();

		render( result.icon as React.ReactElement );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_inlinehelp_impression', {
			location: 'help-center',
			entry_point: 'omnibar',
			section: 'sites',
		} );
	} );

	it( 'toggles the Help Center when the payload has no help center node', () => {
		const result = renderPlugin( [] );

		const { container } = render( result.icon as React.ReactElement );

		expect( result.id ).toBe( 'help-center' );
		expect( result.label ).toBe( 'Help' );
		expect( result.title ).toBeUndefined();
		expect( result.children ).toBeUndefined();

		// The icon must keep the wrapper the stylesheet sizes through.
		expect( container.querySelector( '.omnibar__help-icon > svg' ) ).toBeVisible();

		result.onClick?.( {} as React.MouseEvent );
		expect( setShowHelpCenter ).toHaveBeenCalledWith( true );
	} );

	it( 'stays icon only when the Help Center node carries no menu title', () => {
		const result = renderPlugin( [ HELP_CENTER_NODE ] );
		render( result.icon as React.ReactElement );

		expect( result.id ).toBe( 'help-center' );
		expect( result.label ).toBe( 'Help' );
		expect( result.title ).toBeUndefined();
		expect( result.tooltip ).toBeUndefined();
		expect( result.children ).toBeUndefined();
		expect( adminBarIcon ).toHaveBeenLastCalledWith( ICON, 'omnibar__help-icon' );

		result.onClick?.( {} as React.MouseEvent );
		expect( setShowHelpCenter ).toHaveBeenCalledWith( true );
	} );

	it( 'shows the entry label the backend sends as the menu title', () => {
		const result = renderPlugin( [
			node( 'help-center', {
				...HELP_CENTER_NODE,
				meta: { ...HELP_CENTER_NODE.meta, menu_title: 'Get Help' },
			} ),
		] );

		expect( result.title ).toBe( 'Get Help' );
		expect( result.tooltip ).toBe( 'Get Help' );
	} );
} );
