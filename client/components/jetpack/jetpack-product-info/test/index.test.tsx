/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { translate } from 'i18n-calypso';
import { vi } from 'vitest';
import JetpackProductInfo from '../index';
import type { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

vi.mock( 'i18n-calypso', async () => ( {
	...( await vi.importActual< typeof import( 'i18n-calypso' ) >( 'i18n-calypso' ) ),
	useTranslate: () => ( text: string ) => text,
} ) );

vi.mock( 'calypso/state', () => ( {
	useDispatch: () => vi.fn(),
} ) );

vi.mock( 'react-redux', () => ( {
	useDispatch: () => vi.fn(),
} ) );

vi.mock( '../hooks/use-included-product-description-map', () => ( {
	useIncludedProductDescriptionMap: () => ( {} ),
} ) );

vi.mock( 'calypso/jetpack-cloud/sections/partner-portal/lib/is-woocommerce-product', () => ( {
	__esModule: true,
	default: () => false,
} ) );

vi.mock( 'calypso/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon', () => ( {
	__esModule: true,
	default: () => '/test-icon.svg',
} ) );

const product = {
	productSlug: 'jetpack-security-t1-monthly',
	iconSlug: 'jetpack-security',
	lightboxDescription: 'Security for your site.',
	faqs: [
		{
			id: 'backup-storage-limits-lightbox',
			question: 'How do backup storage limits work?',
			answer: 'Backup storage limit details.',
		},
	],
	disclaimer: translate( 'Subject to your usage and storage limit. {{link}}Learn more{{/link}}.', {
		components: {
			link: <a href="#backup-storage-limits-lightbox-faq" />,
		},
	} ),
} as SelectorProduct;

describe( 'JetpackProductInfo', () => {
	beforeEach( () => {
		Element.prototype.scrollIntoView = vi.fn();
	} );

	it( 'opens an internal disclaimer FAQ without navigating', async () => {
		const user = userEvent.setup();
		render( <JetpackProductInfo title="Security 10GB" product={ product } /> );

		const faqButton = screen.getByRole( 'button', {
			name: 'How do backup storage limits work?',
		} );

		expect( faqButton ).toHaveAttribute( 'aria-expanded', 'false' );

		await user.click( screen.getByRole( 'link', { name: 'Learn more' } ) );

		expect( faqButton ).toHaveAttribute( 'aria-expanded', 'true' );
		expect( faqButton.scrollIntoView ).toHaveBeenCalledWith( {
			behavior: 'smooth',
			block: 'nearest',
		} );
		expect( window.location.hash ).toBe( '' );
	} );
} );
