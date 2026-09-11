/**
 * @jest-environment jsdom
 */
import {
	closeAgentsManagerChat,
	getAgentsManagerChatRoute,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
	useUnifiedAiChat,
} from '@automattic/agents-manager';
import { render, renderHook } from '@testing-library/react';
import { useExperiment } from 'calypso/lib/explat';
import { useAnalytics } from '../../analytics';
import { useHelpCenter } from '../../help-center';
import { useHelpCenterPlugin } from '../plugin-help-center';
import type { AdminBarNode, OmnibarNode } from '@automattic/omnibar';

jest.mock( '@automattic/agents-manager', () => ( {
	closeAgentsManagerChat: jest.fn(),
	getAgentsManagerChatRoute: jest.fn( () => undefined ),
	isAgentsManagerChatVisible: jest.fn( () => false ),
	openAgentsManagerChat: jest.fn(),
	useUnifiedAiChat: jest.fn(),
} ) );
jest.mock( '@automattic/api-queries', () => ( { omnibarSiteIdQuery: jest.fn( () => ( {} ) ) } ) );
jest.mock( '@automattic/calypso-analytics', () => ( {
	withSiteContext: jest.fn( ( props ) => props ),
} ) );
jest.mock( '@automattic/i18n-utils', () => ( {
	localizeUrl: jest.fn( ( url ) => `${ url }?l=fr` ),
} ) );
jest.mock( '@tanstack/react-query', () => ( { useQuery: jest.fn( () => ( { data: 7 } ) ) } ) );
jest.mock( '../../analytics', () => ( {
	useAnalytics: jest.fn( () => ( { recordTracksEvent: jest.fn() } ) ),
} ) );
jest.mock( '../../help-center', () => ( {
	useHelpCenter: jest.fn( () => ( { isShown: false, setShowHelpCenter: jest.fn() } ) ),
} ) );
jest.mock( 'calypso/lib/explat', () => ( { useExperiment: jest.fn() } ) );

const mockIsChatVisible = isAgentsManagerChatVisible as jest.MockedFunction<
	typeof isAgentsManagerChatVisible
>;
const mockGetChatRoute = getAgentsManagerChatRoute as jest.MockedFunction<
	typeof getAgentsManagerChatRoute
>;
const mockUseHelpCenter = useHelpCenter as jest.MockedFunction< typeof useHelpCenter >;
const mockUseExperiment = useExperiment as jest.MockedFunction< typeof useExperiment >;
const mockUseUnifiedAiChat = useUnifiedAiChat as jest.MockedFunction< typeof useUnifiedAiChat >;

const unifiedAgent = ( data: boolean | undefined, isPending = false ) =>
	mockUseUnifiedAiChat.mockReturnValue( { data, isPending } as unknown as ReturnType<
		typeof useUnifiedAiChat
	> );

const assignment = ( variationName: string | null ) =>
	[ false, variationName === null ? null : { variationName } ] as unknown as ReturnType<
		typeof useExperiment
	>;
const setShowHelpCenter = jest.fn();
const recordTracksEvent = jest.fn();

const ICON = 'help';

const node = ( id: string, extra: Partial< AdminBarNode > = {} ): AdminBarNode => ( {
	id,
	title: `<span>${ id }</span>`,
	parent: 'agents-manager',
	href: '',
	group: false,
	...extra,
} );

const HELP_NODES: AdminBarNode[] = [
	node( 'agents-manager', {
		parent: 'top-secondary',
		meta: { menu_title: 'Help Center', icon: ICON, class: 'menupop' },
	} ),
	node( 'agents-manager-menu-panel-chat', {
		group: true,
		meta: { class: 'ab-sub-secondary' },
	} ),
	node( 'agents-manager-chat-support', {
		parent: 'agents-manager-menu-panel-chat',
		meta: { menu_title: 'Chat support', icon: ICON, route: '/chat' },
	} ),
	node( 'agents-manager-chat-history', {
		parent: 'agents-manager-menu-panel-chat',
		meta: { menu_title: 'Chat history', icon: ICON, route: '/history' },
	} ),
	node( 'agents-manager-menu-panel-links', {
		group: true,
		meta: { class: 'ab-sub-secondary' },
	} ),
	node( 'agents-manager-courses', {
		parent: 'agents-manager-menu-panel-links',
		href: 'https://wordpress.com/support/courses/',
		meta: { menu_title: 'Courses', icon: ICON, target: '_blank', rel: 'noopener noreferrer' },
	} ),
];

const renderPlugin = ( adminBarNodes: AdminBarNode[] ) =>
	renderHook( () => useHelpCenterPlugin( { sectionName: 'sites', adminBarNodes } ) ).result.current;

const childrenOf = ( n: OmnibarNode | undefined, id: string ) =>
	n?.children?.find( ( group ) => group.id === id )?.children ?? [];

describe( 'useHelpCenterPlugin', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( useAnalytics ).mockReturnValue( {
			recordTracksEvent,
			recordPageView: jest.fn(),
		} );
		mockIsChatVisible.mockReturnValue( false );
		mockGetChatRoute.mockReturnValue( undefined );
		mockUseHelpCenter.mockReturnValue( {
			isShown: false,
			setShowHelpCenter,
		} as unknown as ReturnType< typeof useHelpCenter > );
		unifiedAgent( false );
		// Mirrors ExPlat: an ineligible caller gets no assignment and no exposure.
		mockUseExperiment.mockImplementation( ( _name, options ) =>
			options?.isEligible === false ? assignment( null ) : assignment( 'treatment' )
		);
	} );

	it.each( [
		[ 'agents manager', HELP_NODES ],
		[ 'legacy help', [] ],
	] )( 'does not track an unrendered %s node', ( _, nodes ) => {
		renderPlugin( nodes );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'agents manager', HELP_NODES ],
		[ 'legacy help', [] ],
	] )( 'tracks an impression only when the %s icon renders', ( _, nodes ) => {
		const result = renderPlugin( nodes as AdminBarNode[] );
		expect( recordTracksEvent ).not.toHaveBeenCalled();

		render( result.icon as React.ReactElement );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_inlinehelp_impression', {
			location: 'help-center',
			entry_point: 'omnibar',
			section: 'sites',
			get_help_chat_forward_variation: 'treatment',
			is_get_help_chat_forward_assignment_loaded: true,
		} );
	} );

	it( 'leaves the experiment fields off the impression for unified-agent users', () => {
		unifiedAgent( true );

		render( renderPlugin( HELP_NODES ).icon as React.ReactElement );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_inlinehelp_impression', {
			location: 'help-center',
			entry_point: 'omnibar',
			section: 'sites',
		} );
	} );

	it( 'holds the impression until the experiment assignment settles', () => {
		mockUseExperiment.mockReturnValue( [ true, null ] as unknown as ReturnType<
			typeof useExperiment
		> );

		render( renderPlugin( [] ).icon as React.ReactElement );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'holds the impression until the unified-agent flag resolves', () => {
		unifiedAgent( undefined, true );

		render( renderPlugin( [] ).icon as React.ReactElement );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'a unified-agent user', true, false ],
		[ 'an unresolved unified-agent flag', undefined, false ],
		[ 'a legacy user', false, true ],
	] )( 'only enters the experiment for %s', ( _, flag, isEligible ) => {
		unifiedAgent( flag as boolean | undefined, flag === undefined );

		render( renderPlugin( [] ).icon as React.ReactElement );

		expect( mockUseExperiment ).toHaveBeenCalledWith( expect.any( String ), { isEligible } );
	} );

	it( 'takes its id, label and tooltip from the admin bar node', () => {
		const result = renderPlugin( HELP_NODES );

		expect( result.id ).toBe( 'agents-manager' );
		expect( result.label ).toBe( 'Help Center' );
		expect( result.tooltip ).toBe( 'Help Center' );
		expect(
			render( result.icon as React.ReactElement ).container.querySelector(
				'.omnibar__help-icon > svg'
			)
		).toBeVisible();
	} );

	it( 'builds the groups in payload order, shading only the resources group', () => {
		const result = renderPlugin( HELP_NODES );

		expect( result.children?.map( ( group ) => group.id ) ).toEqual( [
			'agents-manager-menu-panel-chat',
			'agents-manager-menu-panel-links',
		] );
		expect( result.children?.[ 0 ].variant ).toBeUndefined();
		expect( result.children?.[ 1 ].variant ).toBe( 'secondary' );
	} );

	it( 'labels each item from the payload', () => {
		const result = renderPlugin( HELP_NODES );

		expect(
			childrenOf( result, 'agents-manager-menu-panel-chat' ).map( ( item ) => item.title )
		).toEqual( [ 'Chat support', 'Chat history' ] );
	} );

	it.each( [
		[ 'agents-manager-chat-support', undefined ],
		[ 'agents-manager-chat-history', '/history' ],
	] )( 'opens the chat for %s', ( id, expected ) => {
		const result = renderPlugin( HELP_NODES );
		const item = childrenOf( result, 'agents-manager-menu-panel-chat' ).find(
			( child ) => child.id === id
		);

		item?.onClick?.( {} as React.MouseEvent );

		expect( openAgentsManagerChat ).toHaveBeenCalledWith( expected );
	} );

	it( 'skips items that have neither a route nor a link', () => {
		const result = renderPlugin( [
			...HELP_NODES,
			node( 'agents-manager-mystery', {
				parent: 'agents-manager-menu-panel-chat',
				meta: { menu_title: 'Mystery', icon: ICON },
			} ),
		] );

		expect(
			childrenOf( result, 'agents-manager-menu-panel-chat' ).map( ( item ) => item.id )
		).toEqual( [ 'agents-manager-chat-support', 'agents-manager-chat-history' ] );
	} );

	it( 'closes the chat when the active route is clicked again', () => {
		mockIsChatVisible.mockReturnValue( true );
		mockGetChatRoute.mockReturnValue( '/history' );

		const result = renderPlugin( HELP_NODES );
		childrenOf( result, 'agents-manager-menu-panel-chat' )
			.find( ( child ) => child.id === 'agents-manager-chat-history' )
			?.onClick?.( {} as React.MouseEvent );

		expect( closeAgentsManagerChat ).toHaveBeenCalled();
		expect( openAgentsManagerChat ).not.toHaveBeenCalled();
	} );

	it( 'opens external items in a new tab, localized', () => {
		const open = jest.spyOn( window, 'open' ).mockImplementation( () => null );

		const result = renderPlugin( HELP_NODES );
		childrenOf( result, 'agents-manager-menu-panel-links' )[ 0 ]?.onClick?.(
			{} as React.MouseEvent
		);

		expect( open ).toHaveBeenCalledWith(
			'https://wordpress.com/support/courses/?l=fr',
			'_blank',
			'noopener,noreferrer'
		);
		expect( openAgentsManagerChat ).not.toHaveBeenCalled();
	} );

	it( 'links out instead of opening a dropdown when there is no menu panel', () => {
		const result = renderPlugin( [
			node( 'agents-manager', {
				parent: 'top-secondary',
				href: 'https://wordpress.com/help',
				meta: {
					menu_title: 'Help Center',
					icon: ICON,
					target: '_blank',
					rel: 'noopener noreferrer',
				},
			} ),
		] );

		expect( result.href ).toBe( 'https://wordpress.com/help' );
		expect( result.target ).toBe( '_blank' );
		expect( result.rel ).toBe( 'noopener noreferrer' );
		expect( result.children ).toBeUndefined();
	} );

	it( 'falls back to the legacy Help Center when the payload has no agents manager node', () => {
		const result = renderPlugin( [] );

		const { container } = render( result.icon as React.ReactElement );

		expect( result.id ).toBe( 'help-center' );
		expect( result.label ).toBe( 'Help' );
		expect( result.children ).toBeUndefined();

		// The icon must keep the wrapper the stylesheet sizes through.
		expect( container.querySelector( '.omnibar__help-icon > svg' ) ).toBeVisible();

		result.onClick?.( {} as React.MouseEvent );
		expect( setShowHelpCenter ).toHaveBeenCalledWith( true );
	} );
} );
