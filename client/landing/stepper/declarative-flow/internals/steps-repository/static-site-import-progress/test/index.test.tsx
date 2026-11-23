/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { useStaticSiteImport } from 'calypso/dashboard/sites/static-site-import/use-static-site-import';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import StaticSiteImportProgressStep from '..';
import { mockStepProps } from '../../test/helpers';
import type { StaticSiteImport } from 'calypso/dashboard/sites/static-site-import/use-static-site-import';

let mockLinks: { data?: { code: string }[]; isError?: boolean } = {};
let mockCreated: { data?: { code: string }; isError?: boolean } = {};
const mockCreateLink = jest.fn();

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useQuery: ( { enabled }: { enabled?: boolean } ) => ( enabled ? mockLinks : {} ),
	useMutation: () => ( { mutate: mockCreateLink, ...mockCreated } ),
} ) );

jest.mock( 'calypso/dashboard/sites/static-site-import/use-static-site-import', () => ( {
	...jest.requireActual( 'calypso/dashboard/sites/static-site-import/use-static-site-import' ),
	useStaticSiteImport: jest.fn(),
} ) );

const MOVE = {
	siteId: 456,
	siteSlug: 'preview.wpcomstaging.com',
	importSessionId: 'abc123',
	from: 'source.example.com',
};

const render = ( siteImport: StaticSiteImport | null, props: Partial< typeof MOVE > = MOVE ) => {
	jest.mocked( useStaticSiteImport ).mockReturnValue( siteImport );
	const submit = jest.fn();
	renderWithProvider(
		<MemoryRouter>
			<StaticSiteImportProgressStep
				{ ...mockStepProps( { navigation: { submit }, stepName: 'static-site-import-progress' } ) }
				{ ...props }
			/>
		</MemoryRouter>,
		{ reducers: { documentHead: documentHeadReducer, ui: uiReducer } }
	);
	return submit;
};

describe( 'StaticSiteImportProgressStep', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockLinks = {};
		mockCreated = {};
	} );

	it( 'shows the move’s steps beside a window onto the site', () => {
		const submit = render( { status: 'moving' } );

		expect( screen.getByRole( 'heading', { name: 'Copying your site' } ) ).toBeVisible();
		expect(
			screen.getByText(
				'We’re copying source.example.com into a private preview on WordPress.com. Your original site stays as it is.'
			)
		).toBeVisible();
		expect( screen.getByText( 'Getting your preview ready' ) ).toBeVisible();
		expect( useStaticSiteImport ).toHaveBeenCalledWith( 456, 'abc123', { approve: false } );
		expect( submit ).not.toHaveBeenCalled();
	} );

	it( 'submits a finished preview with its share link', () => {
		const submit = render( {
			status: 'finished',
			isPreview: true,
			previewUrl: 'https://preview.example/?share=x',
		} );

		expect( submit ).toHaveBeenCalledTimes( 1 );
		expect( submit ).toHaveBeenCalledWith( {
			action: 'finished',
			previewUrl: 'https://preview.example/?share=x',
		} );
	} );

	it( 'waits while it looks for a share link', () => {
		const submit = render( { status: 'finished', isPreview: true } );

		expect( submit ).not.toHaveBeenCalled();
		expect( mockCreateLink ).not.toHaveBeenCalled();
	} );

	it( 'submits a finished preview with the share link it already has', () => {
		mockLinks = { data: [ { code: 'abc' } ] };
		const submit = render( { status: 'finished', isPreview: true } );

		expect( mockCreateLink ).not.toHaveBeenCalled();
		expect( submit ).toHaveBeenCalledWith( {
			action: 'finished',
			previewUrl: 'https://preview.wpcomstaging.com/?share=abc',
		} );
	} );

	it( 'makes a share link for a finished preview without one, and waits for it', () => {
		mockLinks = { data: [] };
		const submit = render( { status: 'finished', isPreview: true } );

		expect( mockCreateLink ).toHaveBeenCalledTimes( 1 );
		expect( submit ).not.toHaveBeenCalled();
	} );

	it( 'submits a finished preview with the share link it made', () => {
		mockLinks = { data: [] };
		mockCreated = { data: { code: 'new' } };
		const submit = render( { status: 'finished', isPreview: true } );

		expect( submit ).toHaveBeenCalledWith( {
			action: 'finished',
			previewUrl: 'https://preview.wpcomstaging.com/?share=new',
		} );
	} );

	it.each( [
		[ 'its share links can’t be read', () => ( mockLinks = { isError: true } ) ],
		[
			'a share link can’t be made',
			() => {
				mockLinks = { data: [] };
				mockCreated = { isError: true };
			},
		],
	] )( 'submits a finished preview without a share link when %s', ( _name, setUp ) => {
		setUp();
		const submit = render( { status: 'finished', isPreview: true } );

		expect( submit ).toHaveBeenCalledWith( { action: 'finished' } );
	} );

	it( 'submits a finished move without a share link when the preview has no address', () => {
		const submit = render(
			{ status: 'finished', isPreview: true },
			{ siteId: 456, importSessionId: 'abc123' }
		);

		expect( submit ).toHaveBeenCalledWith( { action: 'finished' } );
	} );

	it.each( [
		[ 'failed', { status: 'failed' } ],
		[ 'was refused', { status: 'failed', isRefused: true } ],
		[ 'stalled', { status: 'stalled' } ],
		[ 'is unavailable', { status: 'unavailable' } ],
	] as const )( 'submits a move that %s as stopped', ( _name, siteImport ) => {
		const submit = render( siteImport );

		expect( submit ).toHaveBeenCalledWith( { action: 'stopped' } );
	} );

	it( 'submits as stopped without a move to show', () => {
		const submit = render( null, { siteId: 456 } );

		expect( submit ).toHaveBeenCalledWith( { action: 'stopped' } );
	} );
} );
