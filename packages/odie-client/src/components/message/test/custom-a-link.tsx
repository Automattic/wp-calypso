/**
 * @jest-environment jsdom
 */
/// <reference types="vitest/jsdom" />
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import CustomALink from '../custom-a-link';

vi.mock( '@automattic/urls', () => ( {
	isThisASupportArticleLink: () => false,
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

	/** A link to another site in the same tab replaced the page the chat is on. */
	it( 'opens a link to another site in a new tab', () => {
		render( <CustomALink href="https://jetpack.com/upgrade/backup/">Jetpack Backup</CustomALink> );

		expect(
			screen.getByRole( 'link', { name: 'Jetpack Backup (opens in a new tab)' } )
		).toHaveAttribute( 'target', '_blank' );
	} );

	/** On WooCommerce.com, Woo doc links are on the same site and still replaced the page. */
	it( 'opens a WooCommerce.com link in a new tab on WooCommerce.com', () => {
		jsdom.reconfigure( { url: 'https://woocommerce.com/my-account/' } );
		render( <CustomALink href={ WOO_DOC_URL }>Managing Orders</CustomALink> );

		const link = screen.getByRole( 'link', { name: 'Managing Orders (opens in a new tab)' } );
		expect( link ).toHaveAttribute( 'href', WOO_DOC_URL );
		expect( link ).toHaveAttribute( 'target', '_blank' );
	} );

	/** Links within Calypso keep navigating in the same tab. */
	it( 'keeps a link to the same site in the same tab', () => {
		render( <CustomALink href={ `${ window.location.origin }/plans/` }>Plans</CustomALink> );

		expect( screen.getByRole( 'link', { name: 'Plans' } ) ).toHaveAttribute( 'target', '_self' );
	} );
} );
