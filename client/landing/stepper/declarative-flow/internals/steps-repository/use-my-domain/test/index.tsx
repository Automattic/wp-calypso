/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import UseMyDomain from '../index';

let mockUseMyDomainProps: Record< string, ( ...args: unknown[] ) => void > = {};
jest.mock(
	'calypso/components/domains/use-my-domain',
	() => ( props: typeof mockUseMyDomainProps ) => {
		mockUseMyDomainProps = props;
		return null;
	}
);
jest.mock( 'calypso/components/data/query-products-list', () => () => null );
jest.mock(
	'calypso/my-sites/checkout/calypso-shopping-cart-provider',
	() =>
		( { children }: { children: React.ReactNode } ) =>
			children
);
jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( { site: { ID: 123, slug: 'example.wordpress.com' } } ),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams(),
} ) );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: () => undefined,
} ) );
jest.mock( 'react-router', () => ( {
	...jest.requireActual( 'react-router' ),
	useLocation: () => ( { pathname: '/setup/domain/use-my-domain', search: '' } ),
} ) );

test( 'submits a domain already connected to the site as an existing mapping', () => {
	const submit = jest.fn();
	render(
		<UseMyDomain
			flow="domain"
			stepName="use-my-domain"
			navigation={ { submit, goBack: jest.fn(), goNext: jest.fn() } }
		/>
	);

	mockUseMyDomainProps.onAlreadyConnected( { domain: 'example.com' } );

	expect( submit ).toHaveBeenCalledWith( {
		ownershipVerificationCompleted: true,
		domain: 'example.com',
	} );
} );
