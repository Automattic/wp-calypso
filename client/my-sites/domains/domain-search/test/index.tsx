/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSelector } from 'calypso/state';
import DomainSearch from '..';
import type { ReactNode } from 'react';

jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( '@automattic/components', () => ( { Gridicon: () => null } ) );
jest.mock( '@automattic/onboarding', () => ( {
	BackButton: ( { children, href }: { children: ReactNode; href: string } ) => (
		<a href={ href }>{ children }</a>
	),
} ) );
jest.mock( '@automattic/shopping-cart', () => ( {
	useShoppingCart: () => ( { responseCart: {} } ),
} ) );
jest.mock( 'calypso/components/domains/wpcom-domain-search', () => ( {
	WPCOMDomainSearch: ( {
		events,
	}: {
		events: { onContinue: ( items: { meta: string }[] ) => void };
	} ) => (
		<button onClick={ () => events.onContinue( [ { meta: 'example.com' } ] ) }>Continue</button>
	),
} ) );
jest.mock( 'calypso/components/domains/wpcom-domain-search/use-query-handler', () => ( {
	useQueryHandler: () => ( { query: '', setQuery: jest.fn(), clearQuery: jest.fn() } ),
} ) );
jest.mock( 'calypso/components/data/query-products-list', () => () => null );
jest.mock( 'calypso/components/data/query-site-domains', () => () => null );
jest.mock( 'calypso/components/formatted-header', () => () => null );
jest.mock( 'calypso/components/main', () => ( { children }: { children: ReactNode } ) => (
	<main>{ children }</main>
) );
jest.mock( 'calypso/layout/body-section-css-class', () => () => null );
jest.mock( 'calypso/lib/cart-values/cart-items', () => ( { hasPlan: () => true } ) );
jest.mock( 'calypso/lib/domains/suggestions', () => ( { getSuggestionsVendor: () => undefined } ) );
jest.mock( 'calypso/my-sites/checkout/use-cart-key', () => () => 123 );
jest.mock(
	'calypso/my-sites/domains/domain-management/components/domain/new-domains-redirection-notice-upsell',
	() => () => null
);
jest.mock( 'calypso/state', () => ( { useSelector: jest.fn() } ) );
jest.mock(
	'calypso/state/selectors/get-current-query-arguments',
	() => ( state: { query: object } ) => state.query
);
jest.mock(
	'calypso/state/selectors/get-current-route',
	() => () => '/domains/add/example.wordpress.com'
);
jest.mock( 'calypso/state/ui/selectors/get-selected-site', () => () => ( {
	ID: 123,
	slug: 'example.wordpress.com',
	URL: 'https://example.wordpress.com',
} ) );

describe( 'DomainSearch email intent', () => {
	afterEach( () => jest.clearAllMocks() );

	it.each( [ true, false ] )(
		'preserves the email-intent marker when present: %s',
		async ( hasEmailIntent ) => {
			jest.mocked( useSelector ).mockImplementation( ( selector ) =>
				selector( {
					query: hasEmailIntent ? { emailIntent: 'true' } : {},
				} )
			);
			render( <DomainSearch /> );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			expect( page ).toHaveBeenCalledWith(
				'/domains/add/example.com/email/example.wordpress.com' +
					( hasEmailIntent ? '?emailIntent=true' : '' )
			);
		}
	);
} );
