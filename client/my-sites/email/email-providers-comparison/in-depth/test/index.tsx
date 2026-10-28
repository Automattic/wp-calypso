/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSelector } from 'calypso/state';
import EmailProvidersInDepthComparison from '..';
import type { ReactNode } from 'react';

jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( '@automattic/shopping-cart', () => ( {
	useShoppingCart: () => ( { responseCart: {} } ),
} ) );
jest.mock( '@automattic/viewport-react', () => ( { useMobileBreakpoint: () => false } ) );
jest.mock( 'calypso/components/data/query-products-list', () => () => null );
jest.mock( 'calypso/components/main', () => ( { children }: { children: ReactNode } ) => (
	<main>{ children }</main>
) );
jest.mock( 'calypso/lib/cart-values/cart-items', () => ( { hasDomainInCart: () => true } ) );
jest.mock( 'calypso/my-sites/checkout/use-cart-key', () => () => 123 );
jest.mock(
	'calypso/my-sites/email/email-providers-comparison/email-forwarding-link',
	() => () => null
);
jest.mock( 'calypso/my-sites/email/email-providers-comparison/in-depth/data', () => ( {
	professionalEmailFeatures: {},
	googleWorkspaceFeatures: {},
} ) );
jest.mock( 'calypso/my-sites/email/email-providers-comparison/billing-interval-toggle', () => ( {
	BillingIntervalToggle: ( {
		onIntervalChange,
	}: {
		onIntervalChange: ( interval: string ) => void;
	} ) => <button onClick={ () => onIntervalChange( 'monthly' ) }>Pay monthly</button>,
} ) );
jest.mock(
	'calypso/my-sites/email/email-providers-comparison/in-depth/comparison-table',
	() =>
		( { onSelectEmailProvider }: { onSelectEmailProvider: ( provider: string ) => void } ) => (
			<button onClick={ () => onSelectEmailProvider( 'titan' ) }>Select Professional Email</button>
		)
);
jest.mock(
	'calypso/my-sites/email/email-providers-comparison/in-depth/comparison-list',
	() => () => null
);
jest.mock(
	'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/email-upsell-navigation',
	() =>
		( { backUrl, skipUrl }: { backUrl: string; skipUrl?: string } ) => (
			<nav>
				<a href={ backUrl }>Back</a>
				{ skipUrl && <a href={ skipUrl }>Skip</a> }
			</nav>
		)
);
jest.mock( 'calypso/state', () => ( { useSelector: jest.fn(), useDispatch: () => jest.fn() } ) );
jest.mock( 'calypso/state/ui/selectors', () => ( { getSelectedSite: jest.fn() } ) );
jest.mock( 'calypso/state/analytics/actions', () => ( { recordTracksEvent: jest.fn() } ) );

const renderComparison = () => {
	jest.mocked( useSelector ).mockReturnValue( { ID: 123, slug: 'example.wordpress.com' } );
	return render(
		<EmailProvidersInDepthComparison
			referrer="/domains/add/example.com/email/example.wordpress.com"
			selectedDomainName="example.com"
			source="domain-upsell"
		/>
	);
};

describe( 'In-depth comparison email intent', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		window.history.replaceState( {}, '', '/?emailIntent=true' );
	} );

	it( 'hides Skip and retains email intent in the Back link', () => {
		renderComparison();
		expect( screen.queryByRole( 'link', { name: 'Skip' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Back' } ) ).toHaveAttribute(
			'href',
			'/domains/add/example.com/email/example.wordpress.com?emailIntent=true'
		);
	} );

	it( 'retains Skip for ordinary domain purchases', () => {
		window.history.replaceState( {}, '', '/' );
		renderComparison();
		expect( screen.getByRole( 'link', { name: 'Skip' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Back' } ) ).toHaveAttribute(
			'href',
			'/domains/add/example.com/email/example.wordpress.com'
		);
	} );

	it.each( [ 'Pay monthly', 'Select Professional Email' ] )(
		'preserves email intent after %s',
		async ( label ) => {
			renderComparison();
			await userEvent.click( screen.getByRole( 'button', { name: label } ) );
			expect( page ).toHaveBeenCalledWith( expect.stringContaining( 'emailIntent=true' ) );
		}
	);
} );
