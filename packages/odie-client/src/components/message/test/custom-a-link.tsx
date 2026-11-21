/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import CustomALink from '../custom-a-link';

let mockIsSupportArticleLink = false;
let mockOpenLinksInNewTab = false;
const mockNavigate = vi.fn();

vi.mock( '@automattic/urls', () => ( {
	isThisASupportArticleLink: () => mockIsSupportArticleLink,
} ) );

vi.mock( 'react-router-dom', () => ( {
	useNavigate: () => mockNavigate,
} ) );

vi.mock( '../../../context', () => ( {
	useOdieAssistantContext: () => ( {
		trackEvent: vi.fn(),
		openLinksInNewTab: mockOpenLinksInNewTab,
	} ),
} ) );

const BLOB_URL = 'blob:http://calypso.localhost:3000/0b6f1d2e-7c3a-4b8e-9f10-2a3b4c5d6e7f';
const DOC_URL = 'https://woocommerce.com/document/managing-orders/';
const SUPPORT_ARTICLE_URL = 'https://wordpress.com/support/domains/';

describe( 'CustomALink', () => {
	beforeEach( () => {
		mockIsSupportArticleLink = false;
		mockOpenLinksInNewTab = false;
		mockNavigate.mockClear();
	} );

	it( 'saves a file the user just sent under its name', () => {
		render( <CustomALink href={ BLOB_URL }>report (1).zip</CustomALink> );

		const link = screen.getByRole( 'link', { name: 'report (1).zip' } );
		expect( link ).toHaveAttribute( 'href', BLOB_URL );
		expect( link ).toHaveAttribute( 'download', 'report (1).zip' );
	} );

	it( 'opens other links without downloading them', () => {
		render( <CustomALink href="https://example.com/report.zip">report.zip</CustomALink> );

		expect( screen.getByRole( 'link', { name: 'report.zip' } ) ).not.toHaveAttribute( 'download' );
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

	it( 'opens a link in the same tab by default', () => {
		render( <CustomALink href={ DOC_URL }>Managing Orders</CustomALink> );

		const link = screen.getByRole( 'link', { name: 'Managing Orders' } );
		expect( link ).toHaveAttribute( 'href', DOC_URL );
		expect( link ).toHaveAttribute( 'target', '_self' );
	} );

	it( 'opens a link in a new tab when openLinksInNewTab is on', async () => {
		mockOpenLinksInNewTab = true;
		render( <CustomALink href={ DOC_URL }>Managing Orders</CustomALink> );

		const link = screen.getByRole( 'link', { name: 'Managing Orders (opens in a new tab)' } );
		expect( link ).toHaveAttribute( 'href', DOC_URL );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );

		await userEvent.click( link );

		expect( mockNavigate ).not.toHaveBeenCalled();
	} );

	it( 'keeps a support article in the article view when openLinksInNewTab is on', async () => {
		mockOpenLinksInNewTab = true;
		mockIsSupportArticleLink = true;
		render( <CustomALink href={ SUPPORT_ARTICLE_URL }>Domains</CustomALink> );

		const link = screen.getByRole( 'link', { name: 'Domains' } );
		expect( link ).toHaveAttribute( 'target', '_self' );

		await userEvent.click( link );

		expect( mockNavigate ).toHaveBeenCalledWith(
			expect.stringContaining( `/post?link=${ SUPPORT_ARTICLE_URL }` )
		);
	} );

	it( 'leaves mailto links and sent files alone when openLinksInNewTab is on', () => {
		mockOpenLinksInNewTab = true;
		render(
			<>
				<CustomALink href="mailto:help@example.com">Email us</CustomALink>
				<CustomALink href={ BLOB_URL }>report.zip</CustomALink>
			</>
		);

		expect( screen.getByRole( 'link', { name: 'Email us' } ) ).toHaveAttribute( 'target', '_self' );
		expect( screen.getByRole( 'link', { name: 'report.zip' } ) ).toHaveAttribute(
			'target',
			'_self'
		);
	} );
} );
