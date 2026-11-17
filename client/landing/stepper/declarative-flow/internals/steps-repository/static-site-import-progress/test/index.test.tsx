/**
 * @jest-environment jsdom
 */
import { act, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { useStaticSiteImport } from 'calypso/dashboard/sites/overview-static-site-import/use-static-site-import';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import StaticSiteImportProgressStep from '..';
import { mockStepProps } from '../../test/helpers';
import type { StaticSiteImport } from 'calypso/dashboard/sites/overview-static-site-import/use-static-site-import';

jest.mock( 'calypso/dashboard/sites/overview-static-site-import/use-static-site-import', () => ( {
	...jest.requireActual(
		'calypso/dashboard/sites/overview-static-site-import/use-static-site-import'
	),
	useStaticSiteImport: jest.fn(),
} ) );

const MOVE = { siteId: 456, importSessionId: 'abc123', from: 'source.example.com' };

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
		jest.useRealTimers();
	} );

	it( 'shows the dashboard’s progress while the site moves', () => {
		const submit = render( { status: 'moving' } );

		expect(
			screen.getByRole( 'heading', { name: 'We’re bringing your site to WordPress.com' } )
		).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'We’re moving your site' } ) ).toBeVisible();
		expect(
			screen.getByText(
				'We’re rebuilding source.example.com here. Your current site stays live and unchanged.'
			)
		).toBeVisible();
		expect( useStaticSiteImport ).toHaveBeenCalledWith( 456, 'abc123' );
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

	it( 'waits for a finished preview’s share link before going on without it', () => {
		jest.useFakeTimers();
		const submit = render( { status: 'finished', isPreview: true } );

		expect( submit ).not.toHaveBeenCalled();
		act( () => {
			jest.advanceTimersByTime( 30_000 );
		} );
		expect( submit ).toHaveBeenCalledWith( { action: 'finished', previewUrl: undefined } );
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
