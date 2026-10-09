/**
 * @jest-environment jsdom
 */
import { SiteThumbnail } from '@automattic/components';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SitePreview } from '..';
import { useSitePreviewMShotImageHandler } from '../hooks/use-site-preview-mshot-image-handler';

jest.mock( '../hooks/use-site-preview-mshot-image-handler' );
jest.mock( '@automattic/components', () => ( {
	SiteThumbnail: jest.fn( ( props ) => {
		const { className, alt } = props;
		return (
			<div { ...{ className, alt } }>
				<div>Mocked Site Preview Image</div>
				{ props.children }
			</div>
		);
	} ),
	Spinner: () => <div>Mocked Spinner</div>,
} ) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => jest.fn( ( key ) => key ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => ( {
		get: jest.fn( () => 'https://example.com' ),
	} ),
} ) );

describe( 'SitePreview', () => {
	const mockUpdateDimensions = jest.fn();
	const mockUseSitePreviewMShotImageHandler = useSitePreviewMShotImageHandler as jest.Mock;

	beforeEach( () => {
		mockUseSitePreviewMShotImageHandler.mockReturnValue( {
			mShotsOption: { w: 800, h: 600, vpw: 800, vph: 600, screen_height: 600, scale: 2 },
			updateDimensions: mockUpdateDimensions,
		} );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render the SitePreview component', () => {
		render( <SitePreview /> );

		expect( screen.getByText( 'Mocked Site Preview Image' ) ).toBeInTheDocument();
	} );

	it( 'should pass the correct props to SiteThumbnail', () => {
		render( <SitePreview /> );

		expect( screen.getByText( 'Mocked Site Preview Image' ).parentElement ).toHaveClass(
			'migration-instructions-from-preview__screenshot'
		);
		expect( screen.getByText( 'Mocked Site Preview Image' ).parentElement ).toHaveAttribute(
			'alt',
			'Preview of the site being imported'
		);
		expect( screen.getByText( 'Mocked Spinner' ) ).toBeInTheDocument();
	} );

	it( 'keeps the source URL and label as defaults', () => {
		render( <SitePreview /> );
		expect( jest.mocked( SiteThumbnail ).mock.calls[ 0 ][ 0 ] ).toMatchObject( {
			mShotsUrl: 'https://example.com',
			alt: 'Preview of the site being imported',
		} );
	} );

	it( 'uses the supplied URL and label for a destination preview', () => {
		render(
			<SitePreview url="https://destination.wordpress.com" label="Current destination site" />
		);
		expect( mockUseSitePreviewMShotImageHandler ).toHaveBeenCalledWith(
			'https://destination.wordpress.com',
			undefined
		);
		expect( jest.mocked( SiteThumbnail ).mock.calls[ 0 ][ 0 ] ).toMatchObject( {
			mShotsUrl: 'https://destination.wordpress.com',
			alt: 'Current destination site',
			'aria-label': 'Current destination site',
		} );
	} );

	it( 'uses matching capture dimensions for the thumbnail and its responsive image candidates', () => {
		const options = { vpw: 1200, vph: 800, w: 1200, h: 800, screen_height: 800, scale: 2 };
		mockUseSitePreviewMShotImageHandler.mockReturnValue( { mShotsOption: options } );
		render( <SitePreview mshotsOptions={ options } /> );
		expect( mockUseSitePreviewMShotImageHandler ).toHaveBeenCalledWith(
			'https://example.com',
			options
		);
		expect( jest.mocked( SiteThumbnail ).mock.calls[ 0 ][ 0 ] ).toMatchObject( {
			mshotsOption: options,
			width: 1200,
			height: 800,
		} );
	} );
} );
