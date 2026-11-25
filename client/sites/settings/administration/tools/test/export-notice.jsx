/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ExportNotice from '../export-notice';

vi.mock( 'i18n-calypso', async () => ( {
	...( await vi.importActual( 'i18n-calypso' ) ),
	translate: vi.fn( ( key ) => key ),
} ) );

describe( 'ExportNotice', () => {
	const defaultProps = {
		siteId: 123,
		siteSlug: 'example-site',
		warningText: 'This is a warning.',
	};

	it( 'renders the warning notice with the correct text', () => {
		render( <ExportNotice { ...defaultProps } /> );
		expect( screen.getByText( 'This is a warning.' ) ).toBeInTheDocument();
	} );

	it( 'has the correct href for the export link', () => {
		render( <ExportNotice { ...defaultProps } /> );
		const link = screen.getByRole( 'link', { name: 'Export content' } );
		expect( link ).toHaveAttribute( 'href', '/export/example-site' );
	} );

	it( 'prevents navigation when siteId is missing', () => {
		render( <ExportNotice { ...defaultProps } siteId={ 0 } /> );
		const link = screen.getByRole( 'link', { name: 'Export content' } );
		const clickEvent = fireEvent.click( link );
		expect( clickEvent ).toBe( false );
	} );

	it( 'allows navigation when siteId is provided', () => {
		render( <ExportNotice { ...defaultProps } /> );
		const link = screen.getByRole( 'link', { name: 'Export content' } );
		const clickEvent = fireEvent.click( link );
		expect( clickEvent ).toBe( true );
	} );
} );
