/**
 * @jest-environment jsdom
 */
import { staticSiteImportSessionQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import StaticSiteImportReading from '..';
import { mockStepProps, renderStep } from '../../test/helpers';
import type { StaticSiteImportSession } from '@automattic/api-core';

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const session = (
	state: StaticSiteImportSession[ 'state' ],
	extra: Partial< StaticSiteImportSession > = {}
): StaticSiteImportSession => ( {
	session_id: 'abc123',
	status: 'new',
	state,
	source_digest: 'digest',
	preview_summary: [],
	site_url: '',
	...extra,
} );

const render = ( initialEntry: string, queryClient?: QueryClient ) => {
	const submit = jest.fn();
	renderStep(
		<StaticSiteImportReading
			{ ...mockStepProps( { navigation: { submit }, stepName: 'static-site-import-reading' } ) }
		/>,
		{ initialEntry, queryClient }
	);
	return submit;
};

describe( 'StaticSiteImportReading', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		nock.cleanAll();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'starts a session for the HTTPS source URL and hands its id to the flow', async () => {
		let postedBody: Record< string, unknown > = {};
		mockApi()
			.post( '/wpcom/v2/static-site-import-session', ( body ) => {
				postedBody = body;
				return true;
			} )
			.query( true )
			.reply( 200, session( 'capture_queued' ) );

		const submit = render( '/static-site-import-reading?from=busybearscleaning.com&platform=wix' );

		expect( await screen.findByText( 'Reading your site' ) ).toBeVisible();
		expect(
			screen.getByText( 'This can take a few minutes. Your Wix site stays live and unchanged.' )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Wix site/ } ) ).toHaveAttribute(
			'href',
			'https://busybearscleaning.com'
		);
		expect( screen.getByRole( 'progressbar', { name: 'Finding your site' } ) ).not.toHaveAttribute(
			'value'
		);
		for ( const name of [ 'Pages', 'Images', 'Design' ] ) {
			expect( screen.getByRole( 'progressbar', { name } ) ).toHaveAttribute( 'value', '0' );
		}

		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( {
				action: 'session-created',
				importSessionId: 'abc123',
			} )
		);
		expect( postedBody ).toEqual( { source_url: 'https://busybearscleaning.com' } );
	} );

	it.each( [
		{
			name: 'installation',
			response: session( 'capturing', { progress: { phase: 'installing' } } ),
		},
		{
			name: 'inspection',
			response: session( 'capturing', { progress: { phase: 'inspecting' } } ),
		},
		{
			name: 'page discovery, even with matching page counts',
			response: session( 'capturing', {
				progress: {
					phase: 'capturing',
					finding_pages: true,
					pages_captured: 2,
					pages_total: 2,
				},
			} ),
		},
	] )( 'keeps Finding active during $name', async ( { response } ) => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, response );
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { staleTime: Infinity } },
		} );
		await queryClient.prefetchQuery( staticSiteImportSessionQuery( 'abc123' ) );
		render(
			'/static-site-import-reading?from=busybearscleaning.com&importSessionId=abc123',
			queryClient
		);

		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Finding your site' );
		expect( screen.getByRole( 'progressbar', { name: 'Finding your site' } ) ).not.toHaveAttribute(
			'value'
		);
		for ( const name of [ 'Pages', 'Images', 'Design' ] ) {
			expect( screen.getByRole( 'progressbar', { name } ) ).toHaveAttribute( 'value', '0' );
		}
	} );

	it( 'uses optional page counters and follows phases through to preview readiness', async () => {
		const updates = [
			{
				response: session( 'capturing' ),
				label: 'Reading your pages',
				values: [ 100, 0, 0, 0 ],
			},
			{
				response: session( 'capturing', {
					progress: { phase: 'capturing', pages_captured: 0, pages_total: 0 },
				} ),
				label: 'Reading your pages',
				values: [ 100, 0, 0, 0 ],
			},
			{
				response: session( 'capturing', {
					progress: { phase: 'capturing', pages_captured: 0, pages_total: 8 },
				} ),
				label: 'Reading your pages',
				values: [ 100, 0, 0, 0 ],
			},
			{
				response: session( 'capturing', {
					progress: { phase: 'capturing', pages_captured: 2, pages_total: 8 },
				} ),
				label: 'Reading your pages',
				values: [ 100, 25, 0, 0 ],
			},
			{
				response: session( 'capturing', { progress: { phase: 'capturing', pages_total: 8 } } ),
				label: 'Reading your pages',
				values: [ 100, 25, 0, 0 ],
			},
			{
				response: session( 'capturing', { progress: { phase: 'capturing', pages_captured: 4 } } ),
				label: 'Reading your pages',
				values: [ 100, 50, 0, 0 ],
			},
			{
				response: session( 'capturing' ),
				label: 'Reading your pages',
				values: [ 100, 50, 0, 0 ],
			},
			{
				response: session( 'capturing', {
					progress: { phase: 'capturing', pages_captured: 8, pages_total: 8 },
				} ),
				label: 'Reading your images',
				values: [ 100, 100, undefined, 0 ],
			},
			{
				response: session( 'capturing', { progress: { phase: 'capturing' } } ),
				label: 'Reading your images',
				values: [ 100, 100, undefined, 0 ],
			},
			{
				response: session( 'capturing', { progress: { phase: 'building' } } ),
				label: 'Checking your fonts, colors, and layout',
				values: [ 100, 100, 100, undefined ],
			},
			{
				response: session( 'capturing', {
					progress: { phase: 'exporting', pages_captured: 2, pages_total: 8 },
				} ),
				label: 'Checking your fonts, colors, and layout',
				values: [ 100, 100, 100, undefined ],
			},
			{
				response: session( 'building', { progress: { phase: 'capturing', finding_pages: true } } ),
				label: 'Checking your fonts, colors, and layout',
				values: [ 100, 100, 100, undefined ],
			},
			{
				response: session( 'preview_ready' ),
				label: 'Your site is ready',
				values: [ 100, 100, 100, 100 ],
			},
		];
		for ( const { response } of updates ) {
			mockApi()
				.get( '/wpcom/v2/static-site-import-session/abc123' )
				.query( true )
				.reply( 200, response );
		}
		const queryClient = new QueryClient();
		const submit = render(
			'/static-site-import-reading?from=busybearscleaning.com&importSessionId=abc123',
			queryClient
		);

		for ( const [ index, { label, values } ] of updates.entries() ) {
			if ( index > 0 ) {
				await act( () =>
					queryClient.refetchQueries( {
						queryKey: staticSiteImportSessionQuery( 'abc123' ).queryKey,
					} )
				);
			}
			await waitFor( () => {
				expect( screen.getByRole( 'status' ) ).toHaveTextContent( label );
				const bars = screen.getAllByRole( 'progressbar' );
				expect( bars ).toHaveLength( 4 );
				bars.forEach( ( bar, barIndex ) => {
					const value = values[ barIndex ];
					expect( bar.getAttribute( 'value' ) ).toBe(
						value === undefined ? null : String( value )
					);
				} );
			} );
		}
		await waitFor( () => expect( submit ).toHaveBeenCalledTimes( 1 ), { timeout: 2000 } );
		expect( submit ).toHaveBeenCalledWith( { action: 'continue', importSessionId: 'abc123' } );
	} );

	it( 'resets retained page counts when the import session changes', () => {
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { staleTime: Infinity } },
		} );
		queryClient.setQueryData(
			staticSiteImportSessionQuery( 'abc123' ).queryKey,
			session( 'capturing', { progress: { pages_captured: 8, pages_total: 8 } } )
		);
		queryClient.setQueryData(
			staticSiteImportSessionQuery( 'new-session' ).queryKey,
			session( 'capturing', { session_id: 'new-session' } )
		);
		let changeSession = () => {};
		function Parent() {
			const [ , setSearchParams ] = useSearchParams();
			changeSession = () =>
				setSearchParams( { from: 'busybearscleaning.com', importSessionId: 'new-session' } );
			return (
				<StaticSiteImportReading { ...mockStepProps( { navigation: { submit: jest.fn() } } ) } />
			);
		}
		renderStep( <Parent />, {
			initialEntry: '/static-site-import-reading?from=busybearscleaning.com&importSessionId=abc123',
			queryClient,
		} );
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Reading your images' );
		expect( screen.getByRole( 'progressbar', { name: 'Pages' } ) ).toHaveAttribute(
			'value',
			'100'
		);

		act( () => changeSession() );

		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Reading your pages' );
		expect( screen.getByRole( 'progressbar', { name: 'Pages' } ) ).toHaveAttribute( 'value', '0' );
		expect( screen.getByRole( 'progressbar', { name: 'Images' } ) ).toHaveAttribute( 'value', '0' );
	} );

	it( 'shows all bars completed before continuing to results', () => {
		jest.useFakeTimers();
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { staleTime: Infinity } },
		} );
		const { queryKey } = staticSiteImportSessionQuery( 'abc123' );
		queryClient.setQueryData( queryKey, session( 'building' ) );
		const submit = render(
			'/static-site-import-reading?from=busybearscleaning.com&importSessionId=abc123',
			queryClient
		);
		expect( screen.getByRole( 'progressbar', { name: 'Design' } ) ).not.toHaveAttribute( 'value' );

		act( () => {
			queryClient.setQueryData( queryKey, session( 'preview_ready' ) );
			jest.advanceTimersByTime( 0 );
		} );

		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Your site is ready' );
		for ( const bar of screen.getAllByRole( 'progressbar' ) ) {
			expect( bar ).toHaveAttribute( 'value', '100' );
		}
		act( () => jest.advanceTimersByTime( 1499 ) );
		expect( submit ).not.toHaveBeenCalled();

		act( () => jest.advanceTimersByTime( 1 ) );
		expect( submit ).toHaveBeenCalledTimes( 1 );
		expect( submit ).toHaveBeenCalledWith( { action: 'continue', importSessionId: 'abc123' } );
	} );

	it( 'keeps the completion deadline and uses the latest navigation callback after a parent rerender', () => {
		jest.useFakeTimers();
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { staleTime: Infinity } },
		} );
		queryClient.setQueryData(
			staticSiteImportSessionQuery( 'abc123' ).queryKey,
			session( 'preview_ready' )
		);
		const originalSubmit = jest.fn();
		const latestSubmit = jest.fn();
		let updateNavigation = () => {};
		function Parent() {
			const [ updated, setUpdated ] = useState( false );
			updateNavigation = () => setUpdated( true );
			return (
				<StaticSiteImportReading
					{ ...mockStepProps( {
						navigation: { submit: updated ? latestSubmit : originalSubmit },
					} ) }
				/>
			);
		}
		renderStep( <Parent />, {
			initialEntry: '/static-site-import-reading?from=busybearscleaning.com&importSessionId=abc123',
			queryClient,
		} );

		act( () => jest.advanceTimersByTime( 1000 ) );
		act( () => updateNavigation() );
		act( () => jest.advanceTimersByTime( 499 ) );
		expect( originalSubmit ).not.toHaveBeenCalled();
		expect( latestSubmit ).not.toHaveBeenCalled();

		act( () => jest.advanceTimersByTime( 1 ) );
		expect( originalSubmit ).not.toHaveBeenCalled();
		expect( latestSubmit ).toHaveBeenCalledTimes( 1 );
		expect( latestSubmit ).toHaveBeenCalledWith( {
			action: 'continue',
			importSessionId: 'abc123',
		} );
	} );

	it( 'cancels pending navigation when the reading step unmounts', () => {
		jest.useFakeTimers();
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { staleTime: Infinity } },
		} );
		queryClient.setQueryData(
			staticSiteImportSessionQuery( 'abc123' ).queryKey,
			session( 'preview_ready' )
		);
		const submit = render(
			'/static-site-import-reading?from=busybearscleaning.com&importSessionId=abc123',
			queryClient
		);

		act( () => jest.advanceTimersByTime( 400 ) );
		cleanup();
		act( () => jest.advanceTimersByTime( 2000 ) );
		expect( submit ).not.toHaveBeenCalled();
	} );

	it( 'shows the captured homepage while the build runs, keeping its first URL', () => {
		jest.useFakeTimers();
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { staleTime: Infinity } },
		} );
		const { queryKey } = staticSiteImportSessionQuery( 'abc123' );
		queryClient.setQueryData( queryKey, session( 'building' ) );
		render(
			'/static-site-import-reading?from=busybearscleaning.com&importSessionId=abc123',
			queryClient
		);
		expect( screen.queryByRole( 'img' ) ).not.toBeInTheDocument();

		act( () => {
			queryClient.setQueryData(
				queryKey,
				session( 'building', { preview_image_url: 'https://public-api.wordpress.com/a.png' } )
			);
			jest.advanceTimersByTime( 0 );
		} );
		const image = screen.getByRole( 'img', { name: 'The homepage of busybearscleaning.com' } );
		expect( image ).toHaveAttribute( 'src', 'https://public-api.wordpress.com/a.png' );

		act( () => {
			queryClient.setQueryData(
				queryKey,
				session( 'building', { preview_image_url: 'https://public-api.wordpress.com/b.png' } )
			);
			jest.advanceTimersByTime( 0 );
		} );
		expect( image ).toHaveAttribute( 'src', 'https://public-api.wordpress.com/a.png' );
	} );

	it( 'resumes the session in the URL without starting another one', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'preview_ready' ) );

		const submit = render(
			'/static-site-import-reading?from=busybearscleaning.com&importSessionId=abc123'
		);

		await waitFor(
			() =>
				expect( submit ).toHaveBeenCalledWith( { action: 'continue', importSessionId: 'abc123' } ),
			{ timeout: 2000 }
		);
		expect( nock.isDone() ).toBe( true );
		for ( const bar of screen.getAllByRole( 'progressbar' ) ) {
			expect( bar ).toHaveAttribute( 'value', '100' );
		}
	} );

	it( 'reports the flow as unavailable when the API refuses the session', async () => {
		mockApi().post( '/wpcom/v2/static-site-import-session' ).query( true ).reply( 404, {
			code: 'static_site_import_disabled',
			message: 'Static site import is not enabled.',
		} );

		const submit = render( '/static-site-import-reading?from=busybearscleaning.com' );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'unavailable' } ) );
		for ( const bar of screen.getAllByRole( 'progressbar' ) ) {
			expect( bar ).toHaveAttribute( 'value', '0' );
		}
	} );

	it( 'reports a failed capture', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply(
				200,
				session( 'failed', {
					progress: { phase: 'exporting', pages_captured: 8, pages_total: 8 },
					receipt: { success: false, code: 'static_site_capture_capture_failed' },
				} )
			);

		const submit = render(
			'/static-site-import-reading?from=busybearscleaning.com&importSessionId=abc123'
		);

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'unavailable' } ) );
		for ( const bar of screen.getAllByRole( 'progressbar' ) ) {
			expect( bar ).toHaveAttribute( 'value', '0' );
		}
	} );
} );
