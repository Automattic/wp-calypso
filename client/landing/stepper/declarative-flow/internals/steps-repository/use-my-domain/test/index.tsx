/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import UseMyDomain from '../index';

let mockUseMyDomainProps: Record< string, ( ...args: unknown[] ) => void > = {};
vi.mock( 'calypso/components/domains/use-my-domain', () => ( {
	default: ( props: typeof mockUseMyDomainProps ) => {
		mockUseMyDomainProps = props;
		return null;
	},
} ) );
vi.mock( 'calypso/components/data/query-products-list', () => ( { default: () => null } ) );
vi.mock( 'calypso/my-sites/checkout/calypso-shopping-cart-provider', () => ( {
	default: ( { children }: { children: React.ReactNode } ) => children,
} ) );
vi.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( { site: { ID: 123, slug: 'example.wordpress.com' } } ),
} ) );
vi.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams(),
} ) );
vi.mock( 'react-redux', async () => ( {
	...( await vi.importActual< typeof import( 'react-redux' ) >( 'react-redux' ) ),
	useSelector: () => undefined,
} ) );
vi.mock( 'react-router', async () => ( {
	...( await vi.importActual< typeof import( 'react-router' ) >( 'react-router' ) ),
	useLocation: () => ( { pathname: '/setup/domain/use-my-domain', search: '' } ),
} ) );

test( 'submits a domain already connected to the site as an existing mapping', () => {
	const submit = vi.fn();
	render(
		<UseMyDomain
			flow="domain"
			stepName="use-my-domain"
			navigation={ { submit, goBack: vi.fn(), goNext: vi.fn() } }
		/>
	);

	mockUseMyDomainProps.onAlreadyConnected( { domain: 'example.com' } );

	expect( submit ).toHaveBeenCalledWith( {
		ownershipVerificationCompleted: true,
		domain: 'example.com',
	} );
} );
