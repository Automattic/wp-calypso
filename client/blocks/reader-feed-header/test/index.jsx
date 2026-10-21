/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import ReaderFeedHeader from '..';

// Render a lightweight stand-in for SiteIcon that exposes the icon URL the
// header resolved, so we can assert on the fallback logic without pulling in
// SiteIcon's Redux dependencies.
jest.mock( 'calypso/blocks/site-icon', () => ( props ) => {
	const img = props?.site?.icon?.img;
	return img ? <img alt="site-icon" src={ img } /> : <span data-testid="default-site-icon" />;
} );

// Connected/query children that are irrelevant to icon resolution.
jest.mock( 'calypso/components/data/query-user-settings', () => () => null );
jest.mock( 'calypso/blocks/blog-stickers', () => () => null );
jest.mock( '../follow', () => () => null );
jest.mock( '../badge', () => () => null );

const feedImage = 'https://example.com/rss-channel-image.png';

describe( 'ReaderFeedHeader icon fallback', () => {
	it( 'falls back to the feed image when the subscription site_icon is an empty string', () => {
		// A followed feed whose site has no WordPress Site Icon returns site_icon: ''
		// (coerced from null by the follows adapter). The feed still has an RSS
		// channel image, which should be used.
		render( <ReaderFeedHeader feed={ { site_icon: '', image: feedImage } } /> );

		expect( screen.getByRole( 'img', { name: 'site-icon' } ) ).toBeVisible();
		expect( screen.queryByTestId( 'default-site-icon' ) ).not.toBeInTheDocument();
	} );

	it( 'falls back to the feed image when the subscription site_icon is null', () => {
		render( <ReaderFeedHeader feed={ { site_icon: null, image: feedImage } } /> );

		expect( screen.getByRole( 'img', { name: 'site-icon' } ) ).toBeVisible();
	} );

	it( 'prefers the site_icon over the feed image when both are present', () => {
		const siteIcon = 'https://example.com/site-icon.png';
		render( <ReaderFeedHeader feed={ { site_icon: siteIcon, image: feedImage } } /> );

		const img = screen.getByRole( 'img', { name: 'site-icon' } );
		expect( img ).toBeVisible();
		expect( img.getAttribute( 'src' ) ).toContain( 'site-icon.png' );
	} );

	it( 'renders the default icon when neither site_icon nor feed image are available', () => {
		render( <ReaderFeedHeader feed={ { site_icon: '', image: '' } } /> );

		expect( screen.getByTestId( 'default-site-icon' ) ).toBeVisible();
		expect( screen.queryByRole( 'img', { name: 'site-icon' } ) ).not.toBeInTheDocument();
	} );
} );
