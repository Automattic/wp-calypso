/**
 * @jest-environment jsdom
 */
import { render, screen, within } from '@testing-library/react';
import { useSelector } from 'react-redux';
import {
	getEmailStatsNormalizedData,
	isRequestingEmailStats,
} from 'calypso/state/stats/emails/selectors';
import StatsEmailTopRow from '..';

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn( ( selector ) => selector( {} ) ),
} ) );

jest.mock( 'calypso/state/stats/emails/selectors' );

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: () => ( text: string ) => text,
} ) );

const mockedUseSelector = useSelector as unknown as jest.Mock;
const mockedGetEmailStatsNormalizedData = getEmailStatsNormalizedData as jest.Mock;
const mockedIsRequestingEmailStats = isRequestingEmailStats as jest.Mock;

function renderClickStats( counts: Record< string, number | undefined > ) {
	mockedGetEmailStatsNormalizedData.mockReturnValue( counts );
	mockedIsRequestingEmailStats.mockReturnValue( false );

	render( <StatsEmailTopRow siteId={ 1 } postId={ 2 } statType="clicks" /> );

	const card = screen.getByText( 'Click rate' ).closest( '.highlight-card' );
	if ( ! card ) {
		throw new Error( 'Click rate card was not rendered' );
	}

	return within( card ).getByText( /%|-/ );
}

describe( 'StatsEmailTopRow click rate', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockedUseSelector.mockImplementation( ( selector ) => selector( {} ) );
	} );

	it( 'calculates 25% from unique clicks and sends instead of a stale API rate', () => {
		expect(
			renderClickStats( {
				total_sends: 52,
				total_clicks: 20,
				unique_clicks: 13,
				clicks_rate: 0.01,
			} )
		).toHaveTextContent( '25%' );
	} );

	it( 'shows useful precision for a fractional click rate', () => {
		expect(
			renderClickStats( {
				total_sends: 17,
				total_clicks: 4,
				unique_clicks: 2,
				clicks_rate: 0.01,
			} )
		).toHaveTextContent( '11.76%' );
	} );

	it( 'uses total clicks for a legacy payload without unique attribution', () => {
		expect(
			renderClickStats( {
				total_sends: 209,
				total_clicks: 15,
				clicks_rate: 0.01,
			} )
		).toHaveTextContent( '7.18%' );
	} );

	it( 'shows zero when sends are positive and there are no clicks', () => {
		expect(
			renderClickStats( {
				total_sends: 52,
				total_clicks: 0,
				unique_clicks: 0,
				clicks_rate: 0.25,
			} )
		).toHaveTextContent( '0%' );
	} );

	it( 'shows the unknown state without a usable send denominator', () => {
		expect(
			renderClickStats( {
				total_sends: 0,
				total_clicks: 20,
				unique_clicks: 13,
				clicks_rate: 0.25,
			} )
		).toHaveTextContent( /^-$/ );
	} );
} );
