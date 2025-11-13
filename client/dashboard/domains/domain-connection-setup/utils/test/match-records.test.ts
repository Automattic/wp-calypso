/**
 * @jest-environment jsdom
 */
import { matchCurrentToTargetValues } from '../match-records';

describe( 'matchCurrentToTargetValues', () => {
	test( 'returns exact matches when current and target values are identical', () => {
		const current = [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ];
		const target = [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ];

		const result = matchCurrentToTargetValues( current, target );

		expect( result ).toEqual( [
			{ currentValue: 'ns1.wordpress.com', updateTo: 'ns1.wordpress.com' },
			{ currentValue: 'ns2.wordpress.com', updateTo: 'ns2.wordpress.com' },
			{ currentValue: 'ns3.wordpress.com', updateTo: 'ns3.wordpress.com' },
		] );
	} );

	test( 'pairs unmatched current values with target values', () => {
		const current = [ 'ns1.other.com', 'ns2.other.com', 'ns3.other.com' ];
		const target = [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ];

		const result = matchCurrentToTargetValues( current, target );

		expect( result ).toEqual( [
			{ currentValue: 'ns1.other.com', updateTo: 'ns1.wordpress.com' },
			{ currentValue: 'ns2.other.com', updateTo: 'ns2.wordpress.com' },
			{ currentValue: 'ns3.other.com', updateTo: 'ns3.wordpress.com' },
		] );
	} );

	test( 'uses "-" when current values are fewer than target values', () => {
		const current = [ 'ns1.other.com', 'ns2.other.com' ];
		const target = [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ];

		const result = matchCurrentToTargetValues( current, target );

		expect( result ).toEqual( [
			{ currentValue: 'ns1.other.com', updateTo: 'ns1.wordpress.com' },
			{ currentValue: 'ns2.other.com', updateTo: 'ns2.wordpress.com' },
			{ currentValue: '-', updateTo: 'ns3.wordpress.com' },
		] );
	} );

	test( 'handles empty current values array', () => {
		const current: string[] = [];
		const target = [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ];

		const result = matchCurrentToTargetValues( current, target );

		expect( result ).toEqual( [
			{ currentValue: '-', updateTo: 'ns1.wordpress.com' },
			{ currentValue: '-', updateTo: 'ns2.wordpress.com' },
			{ currentValue: '-', updateTo: 'ns3.wordpress.com' },
		] );
	} );

	test( 'prioritizes matched values over unmatched ones', () => {
		const current = [ 'ns1.wordpress.com', 'ns2.other.com', 'ns3.other.com' ];
		const target = [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ];

		const result = matchCurrentToTargetValues( current, target );

		// ns1.wordpress.com should be matched first (same value)
		expect( result[ 0 ] ).toEqual( {
			currentValue: 'ns1.wordpress.com',
			updateTo: 'ns1.wordpress.com',
		} );

		// Remaining unmatched values should be paired in order
		expect( result[ 1 ] ).toEqual( {
			currentValue: 'ns2.other.com',
			updateTo: 'ns2.wordpress.com',
		} );
		expect( result[ 2 ] ).toEqual( {
			currentValue: 'ns3.other.com',
			updateTo: 'ns3.wordpress.com',
		} );
	} );

	test( 'handles more current values than target values', () => {
		const current = [ 'ns1.other.com', 'ns2.other.com', 'ns3.other.com', 'ns4.other.com' ];
		const target = [ 'ns1.wordpress.com', 'ns2.wordpress.com' ];

		const result = matchCurrentToTargetValues( current, target );

		// First two current values are paired with targets, extras shown with '-' in updateTo
		expect( result ).toEqual( [
			{ currentValue: 'ns1.other.com', updateTo: 'ns1.wordpress.com' },
			{ currentValue: 'ns2.other.com', updateTo: 'ns2.wordpress.com' },
			{ currentValue: 'ns3.other.com', updateTo: '-' },
			{ currentValue: 'ns4.other.com', updateTo: '-' },
		] );
	} );

	test( 'handles empty target values array', () => {
		const current = [ 'ns1.other.com', 'ns2.other.com' ];
		const target: string[] = [];

		const result = matchCurrentToTargetValues( current, target );

		// All current values should be shown with '-' as updateTo (should be removed)
		expect( result ).toEqual( [
			{ currentValue: 'ns1.other.com', updateTo: '-' },
			{ currentValue: 'ns2.other.com', updateTo: '-' },
		] );
	} );

	test( 'works with IP addresses (A records)', () => {
		const current = [ '192.0.78.24', '185.230.63.186' ];
		const target = [ '192.0.78.24', '192.0.78.25' ];

		const result = matchCurrentToTargetValues( current, target );

		// First IP matches, second doesn't
		expect( result ).toEqual( [
			{ currentValue: '192.0.78.24', updateTo: '192.0.78.24' },
			{ currentValue: '185.230.63.186', updateTo: '192.0.78.25' },
		] );
	} );

	test( 'works with partial matches in different order', () => {
		const current = [ 'ns3.wordpress.com', 'ns1.other.com', 'ns2.wordpress.com' ];
		const target = [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ];

		const result = matchCurrentToTargetValues( current, target );

		// Should prioritize exact matches regardless of order
		expect( result ).toEqual( [
			{ currentValue: 'ns1.other.com', updateTo: 'ns1.wordpress.com' },
			{ currentValue: 'ns2.wordpress.com', updateTo: 'ns2.wordpress.com' },
			{ currentValue: 'ns3.wordpress.com', updateTo: 'ns3.wordpress.com' },
		] );
	} );

	test( 'shows extra values with "-" even when some values match', () => {
		const current = [ 'ns1.wordpress.com', 'ns2.other.com', 'ns3.other.com', 'ns4.extra.com' ];
		const target = [ 'ns1.wordpress.com', 'ns2.wordpress.com' ];

		const result = matchCurrentToTargetValues( current, target );

		// First value matches, second is paired, extras shown with '-'
		expect( result ).toEqual( [
			{ currentValue: 'ns1.wordpress.com', updateTo: 'ns1.wordpress.com' },
			{ currentValue: 'ns2.other.com', updateTo: 'ns2.wordpress.com' },
			{ currentValue: 'ns3.other.com', updateTo: '-' },
			{ currentValue: 'ns4.extra.com', updateTo: '-' },
		] );
	} );
} );
