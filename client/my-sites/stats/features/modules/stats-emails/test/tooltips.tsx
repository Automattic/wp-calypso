/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { OpensTooltipContent, ClicksTooltipContent, type EmailStatsItem } from '../tooltips';

const baseItem: EmailStatsItem = {
	unique_opens: 0,
	opens: 0,
	opens_rate: 0,
	unique_clicks: 0,
	clicks: 0,
	clicks_rate: 0,
	total_sends: 0,
};

describe( 'OpensTooltipContent', () => {
	it( 'shows the unique line with the rate when uniques are tracked', () => {
		render(
			<OpensTooltipContent
				item={ { ...baseItem, total_sends: 100, opens: 26, unique_opens: 11, opens_rate: 11 } }
			/>
		);
		expect( screen.getByText( 'Recipients: 100' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Unique opens: 11 (11%)' ) ).toBeInTheDocument();
	} );

	it( 'shows a zero unique line for a true zero (sent, no opens at all)', () => {
		render( <OpensTooltipContent item={ { ...baseItem, total_sends: 100 } } /> );
		expect( screen.getByText( 'Unique opens: 0 (0%)' ) ).toBeInTheDocument();
	} );

	it( 'explains the unknown state and omits the unique line', () => {
		render( <OpensTooltipContent item={ { ...baseItem, total_sends: 100, opens: 26 } } /> );
		expect( screen.getByText( "Opens weren't linked to recipients." ) ).toBeInTheDocument();
		expect( screen.queryByText( /Unique opens/ ) ).not.toBeInTheDocument();
	} );

	it( 'explains missing delivery data when there are no recorded sends', () => {
		render( <OpensTooltipContent item={ { ...baseItem, opens: 5, unique_opens: 2 } } /> );
		expect( screen.getByText( 'No delivery data for this email.' ) ).toBeInTheDocument();
		expect( screen.queryByText( /Unique opens/ ) ).not.toBeInTheDocument();
	} );
} );

describe( 'ClicksTooltipContent', () => {
	it( 'shows the unique line with the rate when uniques are tracked', () => {
		render(
			<ClicksTooltipContent
				item={ { ...baseItem, total_sends: 100, clicks: 5, unique_clicks: 3, clicks_rate: 3 } }
			/>
		);
		expect( screen.getByText( 'Unique clicks: 3 (3%)' ) ).toBeInTheDocument();
	} );

	it( 'explains the unknown state and omits the unique line', () => {
		render( <ClicksTooltipContent item={ { ...baseItem, total_sends: 100, clicks: 107 } } /> );
		expect( screen.getByText( "Clicks weren't linked to recipients." ) ).toBeInTheDocument();
		expect( screen.queryByText( /Unique clicks/ ) ).not.toBeInTheDocument();
	} );

	it( 'explains missing delivery data when there are no recorded sends', () => {
		render( <ClicksTooltipContent item={ { ...baseItem, clicks: 1 } } /> );
		expect( screen.getByText( 'No delivery data for this email.' ) ).toBeInTheDocument();
		expect( screen.queryByText( /Unique clicks/ ) ).not.toBeInTheDocument();
	} );
} );
