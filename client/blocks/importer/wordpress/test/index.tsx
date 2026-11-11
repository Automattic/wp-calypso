/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import { WordpressImporter } from '..';
import type { SiteDetails } from '@automattic/data-stores';

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: object ) => unknown ) => selector( {} ),
} ) );

jest.mock( 'calypso/state/imports/url-analyzer/selectors', () => ( {
	getUrlData: () => null,
} ) );

jest.mock( '../import-content-only', () => () => <div>Import content</div> );

const atomicSite = {
	ID: 123,
	jetpack: true,
	options: { is_automated_transfer: true, is_wpcom_atomic: true },
} as SiteDetails;

const jetpackSite = {
	ID: 123,
	jetpack: true,
	options: {},
} as SiteDetails;

describe( 'WordpressImporter', () => {
	it( 'renders without waiting for the complete sites list', () => {
		render(
			<WordpressImporter
				site={ atomicSite }
				siteId={ 123 }
				siteSlug="example.wordpress.com"
				renderHeading={ false }
			/>
		);

		expect( screen.getByText( 'Import content' ) ).toBeVisible();
	} );

	it( 'does not render punctuation next to the loading indicator', () => {
		const { container } = render(
			<WordpressImporter
				site={ jetpackSite }
				siteId={ 123 }
				siteSlug="example.wordpress.com"
				renderHeading={ false }
			/>
		);

		expect( container.querySelector( '.wpcom__loading-ellipsis' ) ).toBeInTheDocument();
		expect( container ).not.toHaveTextContent( ';' );
	} );
} );
