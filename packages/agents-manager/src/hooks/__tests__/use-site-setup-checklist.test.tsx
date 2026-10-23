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

const mockFetchSiteSetupTasks = jest.fn();
const mockGetSiteSetupSiteId = jest.fn( (): number | null => 123 );
jest.mock( '../../utils/site-setup-tasks', () => ( {
	fetchSiteSetupTasks: ( ...args: unknown[] ) => mockFetchSiteSetupTasks( ...args ),
	getSiteSetupSiteId: () => mockGetSiteSetupSiteId(),
} ) );

import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import useSiteSetupChecklist from '../use-site-setup-checklist';
import type { UIMessage } from '@automattic/agenttic-client';

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

const userMessage = ( id: string, promptSourceId?: string ): UIMessage => ( {
	id,
	role: 'user',
	timestamp: 0,
	archived: false,
	showIcon: false,
	content: [
		{ type: 'text', text: 'hi' },
		...( promptSourceId
			? [
					{ type: 'data' as const, data: { promptSource: 'site-setup-checklist', promptSourceId } },
				]
			: [] ),
	],
} );

const config = {
	enabled: true,
	isProcessing: false,
	isLoadingConversation: false,
	messages: [] as UIMessage[],
};

const NONE = { isLoading: false, variant: null, items: [], focusHeaderOnMount: false };

describe( 'useSiteSetupChecklist', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsSiteSetupChecklistEnabled.mockReturnValue( true );
		mockGetSiteSetupSiteId.mockReturnValue( 123 );
		mockUseQuery.mockReturnValue( { data: DETAILS, isLoading: false, refetch: mockRefetch } );
	} );

	it( 'shows the checklist in a new chat’s empty view', () => {
		const { result } = renderHook( () => useSiteSetupChecklist( config ) );

		expect( result.current ).toMatchObject( {
			isLoading: false,
			variant: 'empty',
			focusHeaderOnMount: false,
			items: [
				expect.objectContaining( { id: 'design', status: 'todo', autoSubmit: true } ),
				expect.objectContaining( { id: 'about', status: 'done' } ),
			],
		} );
	} );

	it( 'pins the checklist, with the picked tasks in progress, once a message came from it', () => {
		const { result } = renderHook( () =>
			useSiteSetupChecklist( { ...config, messages: [ userMessage( 'u1', 'design' ) ] } )
		);

		expect( result.current ).toMatchObject( {
			variant: 'pinned',
			items: [
				expect.objectContaining( { id: 'design', status: 'in-progress' } ),
				expect.objectContaining( { id: 'about', status: 'done' } ),
			],
		} );
	} );

	it( 'hands the focus over only on the empty → pinned move of the same session', () => {
		const { result, rerender } = renderHook( ( props ) => useSiteSetupChecklist( props ), {
			initialProps: config,
		} );
		expect( result.current.focusHeaderOnMount ).toBe( false );

		rerender( { ...config, messages: [ userMessage( 'u1', 'design' ) ] } );
		expect( result.current.focusHeaderOnMount ).toBe( true );

		rerender( { ...config, messages: [ userMessage( 'u1', 'design' ), userMessage( 'u2' ) ] } );
		expect( result.current.focusHeaderOnMount ).toBe( false );
	} );

	it( 'does not take the focus when a started chat is opened', () => {
		const { result } = renderHook( () =>
			useSiteSetupChecklist( { ...config, messages: [ userMessage( 'u1', 'design' ) ] } )
		);

		expect( result.current.variant ).toBe( 'pinned' );
		expect( result.current.focusHeaderOnMount ).toBe( false );
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
		[ 'the chat has messages that did not come from the list', [ userMessage( 'u1' ) ], DETAILS ],
		[ 'the site has no list', [], { ...DETAILS, eligible: false, tasks: [] } ],
		[ 'the list is empty', [], { ...DETAILS, tasks: [] } ],
		[ 'the ability failed', [], undefined ],
	] )( 'shows nothing when %s', ( _label, messages, data ) => {
		mockUseQuery.mockReturnValue( { data, isLoading: false, refetch: mockRefetch } );

		const { result } = renderHook( () => useSiteSetupChecklist( { ...config, messages } ) );

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
