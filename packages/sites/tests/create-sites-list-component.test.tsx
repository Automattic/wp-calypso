/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { createSitesListComponent } from '../src';
import { MinimumSite } from '../src/site-type';
import { createMockSite } from './create-mock-site';

const publicSite1 = createMockSite( { name: 'Publiccc' } );
const publicSite2 = createMockSite( { name: 'Publicccor' } );
const publicSite3 = createMockSite( { name: 'Publik' } );
const privateSite = createMockSite( { name: 'Private', is_private: true } );

const renderSites = < T extends MinimumSite >( { sites }: { sites: T[] } ) => {
	return (
		<ul>
			{ sites.map( ( site ) => (
				<li data-testid="site" key={ site.title }>
					{ site.name }
				</li>
			) ) }
		</ul>
	);
};

describe( 'createSitesListComponent', () => {
	it( 'inherits all pipes by default', () => {
		const SitesList = createSitesListComponent();

		render(
			<SitesList
				sites={ [ publicSite2, publicSite1, publicSite3, privateSite ] }
				filtering={ { search: 'licc' } }
				sorting={ { sortKey: 'alphabetically', sortOrder: 'asc' } }
				grouping={ { status: 'public', showHidden: false } }
			>
				{ renderSites }
			</SitesList>
		);

		// Filter
		const allSites = screen.getAllByTestId( 'site' );

		expect( allSites.length ).toBe( 2 );
		expect( screen.queryByText( 'Publiccc' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Publik' ) ).not.toBeInTheDocument();

		// Group
		expect( screen.queryByText( 'Private' ) ).not.toBeInTheDocument();

		// Order
		const [ site1, site2 ] = allSites;

		expect( site1.textContent ).toBe( 'Publiccc' );
		expect( site2.textContent ).toBe( 'Publicccor' );
	} );

	it( 'is possible to disable a pipe', () => {
		const SitesList = createSitesListComponent( { grouping: false } );

		render(
			<SitesList
				sites={ [ publicSite3, privateSite ] }
				sorting={ { sortKey: 'alphabetically', sortOrder: 'asc' } }
				filtering={ { search: '' } }
			>
				{ renderSites }
			</SitesList>
		);

		// Notice how public _and_ private sites are rendered by alphabetical order.
		const [ site1, site2 ] = screen.getAllByTestId( 'site' );
		expect( site1.textContent ).toBe( 'Private' );
		expect( site2.textContent ).toBe( 'Publik' );
	} );

	it( 'is possible to disable all pipes', () => {
		const SitesList = createSitesListComponent( {
			filtering: false,
			grouping: false,
			sorting: false,
		} );

		// No additional props required.
		render( <SitesList sites={ [ publicSite3, privateSite ] }>{ renderSites }</SitesList> );

		// Notice how public and private sites are rendered, but the original order is maintained.
		const [ site1, site2 ] = screen.getAllByTestId( 'site' );
		expect( site1.textContent ).toBe( 'Publik' );
		expect( site2.textContent ).toBe( 'Private' );
	} );
} );
