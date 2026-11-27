/// <reference types="vitest/jsdom" />
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import CustomALink from '../custom-a-link';

let mockIsSupportArticleLink = false;

vi.mock( '@automattic/urls', () => ( {
	isThisASupportArticleLink: () => mockIsSupportArticleLink,
} ) );

vi.mock( 'react-router-dom', () => ( {
	useNavigate: () => vi.fn(),
} ) );

vi.mock( '../../../context', () => ( {
	useOdieAssistantContext: () => ( { trackEvent: vi.fn() } ),
} ) );

const BLOB_URL = 'blob:http://calypso.localhost:3000/0b6f1d2e-7c3a-4b8e-9f10-2a3b4c5d6e7f';
const WOO_DOC_URL = 'https://woocommerce.com/document/managing-orders/';
const PAGE_URL = window.location.href;

describe( 'CustomALink', () => {
	afterEach( () => {
		jsdom.reconfigure( { url: PAGE_URL } );
		mockIsSupportArticleLink = false;
	} );

	it( 'saves a file the user just sent under its name', () => {
		render( <CustomALink href={ BLOB_URL }>report (1).zip</CustomALink> );

		const link = screen.getByRole( 'link', { name: 'report (1).zip' } );
		expect( link ).toHaveAttribute( 'href', BLOB_URL );
		expect( link ).toHaveAttribute( 'download', 'report (1).zip' );
	} );

	it( 'opens other links without downloading them', () => {
		render( <CustomALink href="https://example.com/report.zip">report.zip</CustomALink> );

		expect( screen.getByRole( 'link', { name: /^report\.zip/ } ) ).not.toHaveAttribute(
			'download'
		);
	} );

	it( 'opens an image the user just sent in a new tab', () => {
		render(
			<CustomALink href={ BLOB_URL }>
				<img src={ BLOB_URL } alt="Screenshot" />
			</CustomALink>
		);

		const link = screen.getByRole( 'link', { name: 'Screenshot' } );
		expect( link ).not.toHaveAttribute( 'download' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
	} );

	/** Outside WooCommerce.com, links open as they always have, in WordPress.com and wp-admin alike. */
	it( 'keeps a link to another site in the same tab outside WooCommerce.com', () => {
		jsdom.reconfigure( { url: 'https://example.wordpress.com/wp-admin/' } );
		render( <CustomALink href="https://wordpress.com/plans/">Plans</CustomALink> );

		expect( screen.getByRole( 'link', { name: 'Plans' } ) ).toHaveAttribute( 'target', '_self' );
	} );

	/** On WooCommerce.com, and on a local copy of it, Woo doc links still replaced the page. */
	it.each( [
		[ 'WooCommerce.com', 'https://woocommerce.com/my-account/' ],
		[ 'a local WooCommerce.com', 'https://woocommerce.test/my-account/' ],
	] )( 'opens a WooCommerce.com link in a new tab on %s', ( _site, pageUrl ) => {
		jsdom.reconfigure( { url: pageUrl } );
		render( <CustomALink href={ WOO_DOC_URL }>Managing Orders</CustomALink> );

		const link = screen.getByRole( 'link', { name: 'Managing Orders (opens in a new tab)' } );
		expect( link ).toHaveAttribute( 'href', WOO_DOC_URL );
		expect( link ).toHaveAttribute( 'target', '_blank' );
	} );

	/** WordPress.com support articles keep opening in the Help Center article view. */
	it( 'keeps a support article in the article view on WooCommerce.com', () => {
		jsdom.reconfigure( { url: 'https://woocommerce.com/my-account/' } );
		mockIsSupportArticleLink = true;
		render( <CustomALink href="https://wordpress.com/support/domains/">Domains</CustomALink> );

		expect( screen.getByRole( 'link', { name: 'Domains' } ) ).toHaveAttribute( 'target', '_self' );
	} );
} );
