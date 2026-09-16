/**
 * @jest-environment jsdom
 */
import { render, screen, act, fireEvent } from '@testing-library/react';
import { refreshCountryCodeCookieGdpr, useDoNotSell } from 'calypso/lib/analytics/utils';
import { GlobalFooter } from '../global-footer';
import type { ReactNode } from 'react';

jest.mock( '@automattic/wpcom-template-parts', () => ( {
	UniversalNavbarFooter: ( {
		showCaliforniaNotice,
		additionalCompanyLinks,
	}: {
		showCaliforniaNotice?: boolean;
		additionalCompanyLinks?: ReactNode;
	} ) => (
		<div>
			{ showCaliforniaNotice && <a href="https://automattic.com/privacy/">California notice</a> }
			{ additionalCompanyLinks }
		</div>
	),
} ) );
jest.mock( 'calypso/lib/analytics/utils', () => ( {
	refreshCountryCodeCookieGdpr: jest.fn(),
	useDoNotSell: jest.fn(),
} ) );
jest.mock(
	'calypso/blocks/do-not-sell-dialog',
	() =>
		( { isOpen, onClose }: { isOpen: boolean; onClose: () => void } ) =>
			isOpen && (
				<div role="dialog">
					<button onClick={ onClose }>Close</button>
				</div>
			)
);

describe( 'GlobalFooter privacy controls', () => {
	beforeEach( () => {
		jest.mocked( refreshCountryCodeCookieGdpr ).mockResolvedValue( undefined );
		jest.mocked( useDoNotSell ).mockReturnValue( {
			shouldSeeDoNotSell: false,
			isDoNotSell: false,
			onSetDoNotSell: jest.fn(),
			setUserAdvertisingOptOut: jest.fn(),
		} );
	} );

	test.each( [
		[ 'US', 'California', true ],
		[ 'US', 'Virginia', false ],
		[ 'US', 'New York', false ],
		[ 'RO', 'California', false ],
	] )( 'California notice for %s / %s: %s', async ( country, region, visible ) => {
		document.cookie = `country_code=${ country }`;
		document.cookie = `region=${ encodeURIComponent( region ) }`;
		await act( async () => {
			render( <GlobalFooter colorway="white" /> );
		} );
		expect( Boolean( screen.queryByText( 'California notice' ) ) ).toBe( visible );
	} );

	test( 'the eligible visitor can open and close the opt-out dialog', async () => {
		jest.mocked( useDoNotSell ).mockReturnValue( {
			shouldSeeDoNotSell: true,
			isDoNotSell: false,
			onSetDoNotSell: jest.fn(),
			setUserAdvertisingOptOut: jest.fn(),
		} );
		await act( async () => {
			render( <GlobalFooter colorway="white" /> );
		} );
		fireEvent.click(
			screen.getByRole( 'button', { name: 'Do not sell or share my personal information' } )
		);
		expect( screen.getByRole( 'dialog' ) ).toBeVisible();
		fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	test( 'does not add regional controls to the legacy footer', () => {
		render( <GlobalFooter /> );
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'California notice' ) ).not.toBeInTheDocument();
	} );
} );
