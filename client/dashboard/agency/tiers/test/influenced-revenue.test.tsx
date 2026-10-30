/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import InfluencedRevenue from '../influenced-revenue';

describe( '<InfluencedRevenue>', () => {
	test( 'shows what is left to the next tier', () => {
		render(
			<InfluencedRevenue currentAgencyTierId="emerging-partner" totalInfluencedRevenue={ 0 } />
		);

		expect( screen.getByText( '$1,200 more to reach Agency Partner' ) ).toBeVisible();
		expect( screen.getByText( '$0 of $1,200' ) ).toBeVisible();
		expect(
			screen.getByRole( 'progressbar', {
				name: '$0 of $1,200 influenced revenue for Agency Partner.',
			} )
		).toHaveAttribute( 'value', '0' );
	} );

	test( 'measures Pro toward Premier', () => {
		render(
			<InfluencedRevenue
				currentAgencyTierId="pro-agency-partner"
				totalInfluencedRevenue={ 125000 }
			/>
		);

		expect( screen.getByText( '$125,000 more to reach Premier Partner' ) ).toBeVisible();
		expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '50' );
	} );

	test( 'says when the next tier target is reached before the tier changes', () => {
		render(
			<InfluencedRevenue currentAgencyTierId="agency-partner" totalInfluencedRevenue={ 6000 } />
		);

		expect( screen.getByText( 'You’ve reached the target for Pro Agency Partner' ) ).toBeVisible();
		expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '100' );
	} );

	test( 'says when the top tier is reached', () => {
		render(
			<InfluencedRevenue currentAgencyTierId="premier-partner" totalInfluencedRevenue={ 300000 } />
		);

		expect( screen.getByText( 'Premier Partner is the top tier' ) ).toBeVisible();
		expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '100' );
	} );
} );
