/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { useDispatch } from 'react-redux';
import CelebrateLaunchModal from '../celebrate-launch-modal';

jest.mock( 'react-redux', () => ( {
	useDispatch: jest.fn(),
} ) );

jest.mock( '@automattic/i18n-utils', () => ( {
	...jest.requireActual( 'i18n-utils' ),
	useHasEnTranslation: jest.fn( () => ( key ) => key ),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useRtl: jest.fn(),
	localize: ( x ) => x,
} ) );

describe( 'CelebrateLaunchModal', () => {
	const setModalIsOpen = jest.fn();
	const dispatch = jest.fn();
	useDispatch.mockReturnValue( dispatch );

	const site = {
		slug: 'example-site',
		URL: 'https://example.com',
		plan: { is_free: false, product_slug: 'pro-monthly' },
	};

	it( 'renders the primary domain content if a custom domain is set', () => {
		const allDomains = [
			{ wpcom_domain: false, primary_domain: true, domain: 'example.com' },
			{ wpcom_domain: true, primary_domain: false, domain: 'subdomain.wordpress.com' },
		];

		render(
			<CelebrateLaunchModal
				setModalIsOpen={ setModalIsOpen }
				site={ site }
				allDomains={ allDomains }
			/>
		);
		expect(
			screen.getByText( 'Now you can head over to your site and share it with the world.' )
		).toBeInTheDocument();
	} );

	it( 'renders the custom domain content if a custom domain is not yet as primary', () => {
		const allDomains = [
			{ wpcom_domain: false, primary_domain: false, domain: 'example.com' },
			{ wpcom_domain: true, primary_domain: true, domain: 'subdomain.wordpress.com' },
		];

		render(
			<CelebrateLaunchModal
				setModalIsOpen={ setModalIsOpen }
				site={ site }
				allDomains={ allDomains }
			/>
		);
		expect( screen.getByText( /We're setting up your domain/i ) ).toBeInTheDocument();
	} );

	it( 'renders the multiple custom domain content if a custom domain is not yet as primary', () => {
		const allDomains = [
			{ wpcom_domain: false, primary_domain: false, domain: 'example.com' },
			{ wpcom_domain: false, primary_domain: false, domain: 'exampletwo.com' },
			{ wpcom_domain: true, primary_domain: true, domain: 'subdomain.wordpress.com' },
		];

		render(
			<CelebrateLaunchModal
				setModalIsOpen={ setModalIsOpen }
				site={ site }
				allDomains={ allDomains }
			/>
		);
		expect( screen.getByText( /We're setting up your domains/i ) ).toBeInTheDocument();
	} );
} );
