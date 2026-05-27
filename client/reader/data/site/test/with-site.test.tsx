/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useSite } from '../use-site';
import { withSite, type WithSiteProps } from '../with-site';

jest.mock( '../use-site', () => ( {
	useSite: jest.fn(),
} ) );

describe( 'withSite', () => {
	beforeEach( () => {
		jest.mocked( useSite ).mockReturnValue( {
			site: undefined,
			siteError: undefined,
			isLoading: false,
			isError: false,
			isSuccess: false,
		} );
	} );

	it( 'uses the optional siteId selector when provided', () => {
		type Props = WithSiteProps & {
			post: { is_external?: boolean; site_ID: number };
		};
		const Component = ( { site }: Props ) => <div>{ site?.ID ?? 'no-site' }</div>;
		const Wrapped = withSite< Props >( Component, ( props ) =>
			props.post.is_external ? undefined : props.post.site_ID
		);

		render( <Wrapped post={ { is_external: true, site_ID: 123 } } siteId={ 999 } /> );

		expect( useSite ).toHaveBeenCalledWith( undefined );
		expect( screen.getByText( 'no-site' ) ).toBeInTheDocument();
	} );
} );
