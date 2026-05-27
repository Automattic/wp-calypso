/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useReaderSite } from '../use-reader-site';
import { withReaderSite, type WithReaderSiteProps } from '../with-reader-site';

jest.mock( '../use-reader-site', () => ( {
	useReaderSite: jest.fn(),
} ) );

describe( 'withReaderSite', () => {
	beforeEach( () => {
		jest.mocked( useReaderSite ).mockReturnValue( {
			site: undefined,
			siteError: undefined,
			isLoading: false,
			isError: false,
			isSuccess: false,
		} );
	} );

	it( 'uses the optional siteId selector when provided', () => {
		type Props = WithReaderSiteProps & {
			post: { is_external?: boolean; site_ID: number };
		};
		const Component = ( { site }: Props ) => <div>{ site?.ID ?? 'no-site' }</div>;
		const Wrapped = withReaderSite< Props >( Component, ( props ) =>
			props.post.is_external ? undefined : props.post.site_ID
		);

		render( <Wrapped post={ { is_external: true, site_ID: 123 } } siteId={ 999 } /> );

		expect( useReaderSite ).toHaveBeenCalledWith( undefined );
		expect( screen.getByText( 'no-site' ) ).toBeInTheDocument();
	} );
} );
