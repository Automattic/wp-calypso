/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
jest.mock( '@tanstack/react-query', () => ( {
	useQuery: jest.fn(),
} ) );

const mockIsSiteSetupChecklistEnabled = jest.fn( () => true );
jest.mock( '../../utils/site-setup-checklist', () => ( {
	...jest.requireActual( '../../utils/site-setup-checklist' ),
	isSiteSetupChecklistEnabled: () => mockIsSiteSetupChecklistEnabled(),
} ) );

// The component pulls in `@automattic/agenttic-ui`, which jest cannot resolve.
jest.mock( '../../components/site-setup-checklist', () => ( {
	__esModule: true,
	default: () => null,
} ) );

const mockFetchSiteSetupTasks = jest.fn();
const mockGetSiteSetupSiteId = jest.fn( (): number | null => 123 );
jest.mock( '../../utils/site-setup-tasks', () => ( {
	fetchSiteSetupTasks: ( ...args: unknown[] ) => mockFetchSiteSetupTasks( ...args ),
	getSiteSetupSiteId: () => mockGetSiteSetupSiteId(),
} ) );

import { useQuery } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import useSiteSetupChecklist from '../use-site-setup-checklist';
import type { SiteSetupChecklistProps } from '../../components/site-setup-checklist';
import type { ChecklistItem } from '@automattic/agenttic-ui';
import type { ReactElement } from 'react';

const mockUseQuery = useQuery as jest.Mock;
const mockRefetch = jest.fn();

const DETAILS = {
	eligible: true,
	tasks: [
		{ id: 'design', title: 'Customize the design', status: 'todo', disabled: false },
		{ id: 'about', title: 'Publish the About page', status: 'done', disabled: false },
	],
	progress: { completed: 1, total: 2 },
	summary: '1 of 2 setup tasks done.',
};

const config = {
	enabled: true,
	isProcessing: false,
	isLoadingConversation: false,
	hasConversationMessages: false,
	isStartedFromChecklist: false,
};

const NONE = { isLoading: false, emptyViewContent: null, pinnedContent: null };

const getEmptyViewProps = ( state: ReturnType< typeof useSiteSetupChecklist > ) =>
	( state.emptyViewContent as ReactElement< SiteSetupChecklistProps > ).props;

const getPinnedProps = ( state: ReturnType< typeof useSiteSetupChecklist > ) =>
	( state.pinnedContent as ReactElement< SiteSetupChecklistProps > ).props;

describe( 'useSiteSetupChecklist', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsSiteSetupChecklistEnabled.mockReturnValue( true );
		mockGetSiteSetupSiteId.mockReturnValue( 123 );
		mockUseQuery.mockReturnValue( { data: DETAILS, isLoading: false, refetch: mockRefetch } );
	} );

	it( 'shows the checklist in a new chat’s empty view, open and not pinned', () => {
		const { result } = renderHook( () => useSiteSetupChecklist( config ) );

		expect( result.current.isLoading ).toBe( false );
		expect( result.current.pinnedContent ).toBeNull();
		expect( getEmptyViewProps( result.current ) ).toMatchObject( {
			collapsedByDefault: false,
			items: [
				expect.objectContaining( { id: 'design', status: 'todo', autoSubmit: true } ),
				expect.objectContaining( { id: 'about', status: 'done' } ),
			],
		} );
	} );

	it( 'is loading while the list is read, and while the conversation is', () => {
		mockUseQuery.mockReturnValue( { data: undefined, isLoading: true, refetch: mockRefetch } );
		const { result, rerender } = renderHook( ( props ) => useSiteSetupChecklist( props ), {
			initialProps: config,
		} );

		expect( result.current ).toEqual( { ...NONE, isLoading: true } );

		mockUseQuery.mockReturnValue( { data: DETAILS, isLoading: false, refetch: mockRefetch } );
		rerender( { ...config, isLoadingConversation: true } );

		expect( result.current ).toEqual( { ...NONE, isLoading: true } );
	} );

	it( 'does not query when the surface or the flag rules it out', () => {
		mockIsSiteSetupChecklistEnabled.mockReturnValue( false );

		const { result } = renderHook( () => useSiteSetupChecklist( config ) );

		expect( mockUseQuery ).toHaveBeenCalledWith( expect.objectContaining( { enabled: false } ) );
		expect( result.current ).toEqual( NONE );
	} );

	it( 'does not query without a site to run the ability for', () => {
		mockGetSiteSetupSiteId.mockReturnValue( null );

		const { result } = renderHook( () => useSiteSetupChecklist( config ) );

		expect( mockUseQuery ).toHaveBeenCalledWith( expect.objectContaining( { enabled: false } ) );
		expect( result.current ).toEqual( NONE );
	} );

	it.each( [
		[ 'the chat already has messages', config, DETAILS ],
		[ 'the site has no list', config, { ...DETAILS, eligible: false, tasks: [] } ],
		[ 'the list is empty', config, { ...DETAILS, tasks: [] } ],
		[ 'the ability failed', config, undefined ],
	] )( 'shows nothing when %s', ( label, hookConfig, data ) => {
		mockUseQuery.mockReturnValue( { data, isLoading: false, refetch: mockRefetch } );
		const hasConversationMessages = label === 'the chat already has messages';

		const { result } = renderHook( () =>
			useSiteSetupChecklist( { ...hookConfig, hasConversationMessages } )
		);

		expect( result.current ).toEqual( NONE );
	} );

	it( 'runs the ability for the site through the query', async () => {
		mockFetchSiteSetupTasks.mockResolvedValue( DETAILS );
		renderHook( () => useSiteSetupChecklist( config ) );
		const { queryFn, queryKey } = mockUseQuery.mock.calls[ 0 ][ 0 ];

		expect( queryKey ).toContain( 123 );
		await expect( queryFn() ).resolves.toEqual( DETAILS );
		expect( mockFetchSiteSetupTasks ).toHaveBeenCalledWith( 123 );
	} );

	it( 'pins the checklist above the messages once a task is picked', () => {
		const { result, rerender } = renderHook( ( props ) => useSiteSetupChecklist( props ), {
			initialProps: config,
		} );

		act( () => {
			getEmptyViewProps( result.current ).onSelect( {
				id: 'design',
				label: 'Customize the design',
			} as ChecklistItem );
		} );
		rerender( { ...config, hasConversationMessages: true } );

		expect( result.current.emptyViewContent ).toBeNull();
		expect( getPinnedProps( result.current ) ).toMatchObject( {
			pinned: true,
			collapsedByDefault: true,
			items: [
				expect.objectContaining( { id: 'design', status: 'in-progress' } ),
				expect.objectContaining( { id: 'about', status: 'done' } ),
			],
		} );
	} );

	it( 'pins the checklist in a reloaded chat that was started from it', () => {
		const { result } = renderHook( () =>
			useSiteSetupChecklist( {
				...config,
				hasConversationMessages: true,
				isStartedFromChecklist: true,
			} )
		);

		expect( result.current.emptyViewContent ).toBeNull();
		expect( getPinnedProps( result.current ) ).toMatchObject( {
			pinned: true,
			collapsedByDefault: true,
		} );
	} );

	it( 're-reads the list when an agent turn ends', () => {
		const { rerender } = renderHook( ( props ) => useSiteSetupChecklist( props ), {
			initialProps: config,
		} );

		rerender( { ...config, isProcessing: true } );
		expect( mockRefetch ).not.toHaveBeenCalled();

		rerender( { ...config, isProcessing: false } );
		expect( mockRefetch ).toHaveBeenCalledTimes( 1 );
	} );
} );
