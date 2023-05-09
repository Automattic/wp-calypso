/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { NoSitesMessage } from '../no-sites-message';

describe( '<NoSitesMessage>', () => {
	test( '"Create your first site" message when status filter shows "all" sites', () => {
		render( <NoSitesMessage status="all" statusSiteCount={ 0 } /> );
		expect( screen.getByRole( 'link' ) ).toHaveTextContent( 'Create your first site' );
	} );

	test( '"You haven\'t launched a site" message when status filter shows "public" sites', () => {
		render( <NoSitesMessage status="public" statusSiteCount={ 0 } /> );
		expect( screen.getByText( "You haven't launched a site" ) ).toBeInTheDocument();
	} );

	test( '"You have no private sites" message when status filter shows "private" sites', () => {
		render( <NoSitesMessage status="private" statusSiteCount={ 0 } /> );
		expect( screen.getByText( 'You have no private sites' ) ).toBeInTheDocument();
	} );

	test( '"You have no coming soon sites" message when status filter shows "coming-soon" sites', () => {
		render( <NoSitesMessage status="coming-soon" statusSiteCount={ 0 } /> );
		expect( screen.getByText( 'You have no coming soon sites' ) ).toBeInTheDocument();
	} );

	test( '"No sites match your search." message when user has sites, but none match', () => {
		render( <NoSitesMessage status="all" statusSiteCount={ 100 } /> );
		expect( screen.getByText( 'No sites match your search.' ) ).toBeInTheDocument();
	} );
} );
