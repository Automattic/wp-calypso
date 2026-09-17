/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FreeDomainForAYearPromo } from '../free-domain-for-a-year-promo';

jest.mock( '@automattic/domain-search', () => ( {
	useDomainSuggestionContainer: () => ( {
		containerRef: { current: null },
		activeQuery: 'large',
	} ),
} ) );

describe( 'FreeDomainForAYearPromo', () => {
	describe( 'default render', () => {
		it( 'uses the canonical title and subtitle when no overrides are passed', () => {
			render( <FreeDomainForAYearPromo /> );

			expect( screen.getByText( /Claim your first domain—Free!/ ) ).toBeVisible();
			expect( screen.getByText( /your first year's domain registration is on us/i ) ).toBeVisible();
		} );

		it( 'uses the CIAB subtitle when isCiab is true and no override is passed', () => {
			render( <FreeDomainForAYearPromo isCiab /> );

			expect(
				screen.getByText( /With your annual plan purchase, the first year of domain registration/i )
			).toBeVisible();
		} );
	} );

	describe( 'title prop', () => {
		it( 'overrides the title when a string is passed', () => {
			render( <FreeDomainForAYearPromo title="Get your free .com on us" /> );

			expect( screen.getByText( 'Get your free .com on us' ) ).toBeVisible();
			expect( screen.queryByText( /Claim your first domain—Free!/ ) ).not.toBeInTheDocument();
		} );

		it( 'leaves the subtitle untouched when only title is overridden', () => {
			render( <FreeDomainForAYearPromo title="Custom title" /> );

			expect( screen.getByText( 'Custom title' ) ).toBeVisible();
			expect( screen.getByText( /your first year's domain registration is on us/i ) ).toBeVisible();
		} );
	} );

	describe( 'subtitle prop', () => {
		it( 'overrides the subtitle when a string is passed', () => {
			render(
				<FreeDomainForAYearPromo subtitle="Pick any annual plan and the domain is on us." />
			);

			expect( screen.getByText( 'Pick any annual plan and the domain is on us.' ) ).toBeVisible();
			expect(
				screen.queryByText( /your first year's domain registration is on us/i )
			).not.toBeInTheDocument();
		} );

		it( 'leaves the title untouched when only subtitle is overridden', () => {
			render( <FreeDomainForAYearPromo subtitle="Custom subtitle" /> );

			expect( screen.getByText( /Claim your first domain—Free!/ ) ).toBeVisible();
			expect( screen.getByText( 'Custom subtitle' ) ).toBeVisible();
		} );
	} );

	describe( 'title + subtitle together', () => {
		it( 'overrides both when both are passed', () => {
			render( <FreeDomainForAYearPromo title="Custom title" subtitle="Custom subtitle" /> );

			expect( screen.getByText( 'Custom title' ) ).toBeVisible();
			expect( screen.getByText( 'Custom subtitle' ) ).toBeVisible();
			expect( screen.queryByText( /Claim your first domain—Free!/ ) ).not.toBeInTheDocument();
			expect(
				screen.queryByText( /your first year's domain registration is on us/i )
			).not.toBeInTheDocument();
		} );
	} );

	describe( 'textOnly variant', () => {
		it( 'ignores title and subtitle overrides (textOnly uses a single-paragraph layout)', () => {
			render(
				<FreeDomainForAYearPromo
					textOnly
					title="Custom title that should not appear"
					subtitle="Custom subtitle that should not appear"
				/>
			);

			// The textOnly variant renders the canonical short text, not the override.
			expect(
				screen.getByText(
					/Get your free domain when you check out and purchase any paid annual plan./
				)
			).toBeVisible();
			expect( screen.queryByText( 'Custom title that should not appear' ) ).not.toBeInTheDocument();
			expect(
				screen.queryByText( 'Custom subtitle that should not appear' )
			).not.toBeInTheDocument();
		} );
	} );
} );
