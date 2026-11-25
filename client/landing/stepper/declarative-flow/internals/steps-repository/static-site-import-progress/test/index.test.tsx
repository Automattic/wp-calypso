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

jest.mock( 'calypso/dashboard/sites/static-site-import/use-static-site-import', () => ( {
	...jest.requireActual( 'calypso/dashboard/sites/static-site-import/use-static-site-import' ),
	useStaticSiteImport: jest.fn(),
} ) );

const MOVE = {
	siteId: 456,
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

	it( 'keeps the colliding cards up in place of the page list and screenshot', () => {
		render( {
			status: 'moving',
			session: {
				state: 'building',
				preview_image_url: 'https://preview.example/shot.png',
				progress: { pages: [ { path: '/', captured: true } ] },
			},
		} as StaticSiteImport );

		expect( document.querySelector( '.static-site-import-colliding-cards' ) ).toBeVisible();
		expect(
			document.querySelector( '.static-site-import-snapshot__pages' )
		).not.toBeInTheDocument();
		expect(
			document.querySelector( '.static-site-import-snapshot__image' )
		).not.toBeInTheDocument();
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

	it( 'waits for WordPress.com to report a finished preview’s share link', () => {
		const submit = render( { status: 'finished', isPreview: true } );

		expect( submit ).not.toHaveBeenCalled();
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
