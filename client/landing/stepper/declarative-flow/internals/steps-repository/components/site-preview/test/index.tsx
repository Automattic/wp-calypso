/**
 * @jest-environment jsdom
 */
import { SiteThumbnail } from '@automattic/components';
import { render, screen } from '@testing-library/react';
import { SitePreview } from '..';
import { createSitePreviewScreenshot, SITE_PREVIEW_MSHOT } from '../mshot';

jest.mock( '../mshot', () => ( {
	...jest.requireActual( '../mshot' ),
	createSitePreviewScreenshot: jest.fn(),
} ) );
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
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'previews the source from the address at desktop size', () => {
		render( <SitePreview /> );

		expect( screen.getByText( 'Mocked Site Preview Image' ).parentElement ).toHaveClass(
			'site-migration-preview__screenshot'
		);
		expect( screen.getByText( 'Mocked Spinner' ) ).toBeInTheDocument();
		expect( jest.mocked( SiteThumbnail ).mock.calls[ 0 ][ 0 ] ).toMatchObject( {
			mShotsUrl: 'https://example.com',
			alt: 'Preview of the site being imported',
			mshotsOption: SITE_PREVIEW_MSHOT,
			width: SITE_PREVIEW_MSHOT.w,
			height: SITE_PREVIEW_MSHOT.h,
		} );
		expect( createSitePreviewScreenshot ).toHaveBeenCalledWith( 'https://example.com' );
	} );

	it( 'uses the supplied URL and label', () => {
		render(
			<SitePreview url="https://destination.wordpress.com" label="Current destination site" />
		);

		expect( jest.mocked( SiteThumbnail ).mock.calls[ 0 ][ 0 ] ).toMatchObject( {
			mShotsUrl: 'https://destination.wordpress.com',
			alt: 'Current destination site',
			'aria-label': 'Current destination site',
		} );
		expect( createSitePreviewScreenshot ).toHaveBeenCalledWith(
			'https://destination.wordpress.com'
		);
	} );
} );
