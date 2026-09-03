/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { translate } from 'i18n-calypso';
import JetpackProductInfo from '../index';
import type { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => jest.fn(),
} ) );

jest.mock( 'react-redux', () => ( {
	useDispatch: () => jest.fn(),
} ) );

jest.mock( '../hooks/use-included-product-description-map', () => ( {
	useIncludedProductDescriptionMap: () => ( {} ),
} ) );

jest.mock( 'calypso/jetpack-cloud/sections/partner-portal/lib/is-woocommerce-product', () => ( {
	__esModule: true,
	default: () => false,
} ) );

jest.mock( 'calypso/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon', () => ( {
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
		Element.prototype.scrollIntoView = jest.fn();
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
