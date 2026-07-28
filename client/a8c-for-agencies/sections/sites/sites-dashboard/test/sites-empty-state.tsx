/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import SitesEmptyState, { getSitesEmptyStateCopy, getSitesViewName } from '../sites-empty-state';
import type { Filter } from '@wordpress/dataviews';

const statusFilter = ( value: number ): Filter => ( {
	field: 'status',
	operator: 'is',
	value,
} );

const ALL_ISSUES = statusFilter( 1 );
const BACKUP_FAILED = statusFilter( 2 );

describe( 'getSitesViewName', () => {
	it( 'defaults to the All view', () => {
		expect( getSitesViewName( {} ) ).toBe( 'all' );
	} );

	it( 'detects the Needs attention view from the all_issues filter', () => {
		expect( getSitesViewName( { filters: [ ALL_ISSUES ] } ) ).toBe( 'needs-attention' );
	} );

	it( 'detects the Development and Favorites views from their flags', () => {
		expect( getSitesViewName( { showOnlyDevelopmentSites: true } ) ).toBe( 'development' );
		expect( getSitesViewName( { showOnlyFavorites: true } ) ).toBe( 'favorites' );
	} );

	it( 'keeps the Favorites view when a status filter is applied inside it', () => {
		expect( getSitesViewName( { showOnlyFavorites: true, filters: [ ALL_ISSUES ] } ) ).toBe(
			'favorites'
		);
	} );
} );

describe( 'getSitesEmptyStateCopy', () => {
	it( 'teaches what each view is for when nothing is searched or filtered', () => {
		expect( getSitesEmptyStateCopy( {} ).title ).toBe( 'Your sites will show up here' );
		expect( getSitesEmptyStateCopy( { filters: [ ALL_ISSUES ] } ).title ).toBe(
			'Nothing needs your attention'
		);
		expect( getSitesEmptyStateCopy( { showOnlyDevelopmentSites: true } ).title ).toBe(
			'No sites in development'
		);
		expect( getSitesEmptyStateCopy( { showOnlyFavorites: true } ).title ).toBe(
			'No favorites yet'
		);
	} );

	it( 'shows the no-matches state instead of the teaching copy when a search is active', () => {
		expect( getSitesEmptyStateCopy( { filters: [ ALL_ISSUES ], search: 'aa' } ) ).toEqual( {
			title: 'No sites match your search',
			description: 'Try a different search term.',
		} );
	} );

	it( 'ignores whitespace-only searches', () => {
		expect( getSitesEmptyStateCopy( { showOnlyFavorites: true, search: '  ' } ).title ).toBe(
			'No favorites yet'
		);
	} );

	it( 'treats the all_issues filter as the view itself, not as a refinement', () => {
		expect( getSitesEmptyStateCopy( { filters: [ ALL_ISSUES ] } ).title ).toBe(
			'Nothing needs your attention'
		);
		expect( getSitesEmptyStateCopy( { filters: [ BACKUP_FAILED ] } ).title ).toBe(
			'No sites match your filters'
		);
		expect(
			getSitesEmptyStateCopy( { showOnlyFavorites: true, filters: [ ALL_ISSUES ] } ).title
		).toBe( 'No sites match your filters' );
	} );

	it( 'mentions both when a search and a filter are active together', () => {
		expect( getSitesEmptyStateCopy( { filters: [ BACKUP_FAILED ], search: 'aa' } ) ).toEqual( {
			title: 'No sites match your search',
			description: 'Try a different search term, or clear your filters.',
		} );
	} );
} );

describe( 'SitesEmptyState', () => {
	it( 'renders the heading and copy without any call to action', () => {
		const { container } = render( <SitesEmptyState showOnlyFavorites /> );

		expect( screen.getByText( 'No favorites yet' ) ).toBeVisible();
		expect(
			screen.getByText(
				'Select the star on any site to add it here, so the ones you check most often stay together.'
			)
		).toBeVisible();
		expect( container.querySelector( 'button, a' ) ).toBeNull();
	} );
} );
