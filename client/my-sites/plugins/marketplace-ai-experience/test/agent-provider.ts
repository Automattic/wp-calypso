/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { createToolProvider } from '../agent-provider';
import { deliverPicks } from '../picks-store';

jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( '@wordpress/abilities', () => {
	const abilities = new Map();
	return {
		registerAbilityCategory: jest.fn(),
		registerAbility: jest.fn( ( ability ) => abilities.set( ability.name, ability ) ),
		getAbilities: () => Array.from( abilities.values() ),
		executeAbility: ( name: string, args: unknown ) => abilities.get( name ).callback( args ),
	};
} );

it( 'delivers normalized recommendations to the marketplace and opens Describe', async () => {
	const onPicks = jest.fn( ( picks ) => deliverPicks( picks, 'example.com' ) );
	const provider = createToolProvider( { onPicks } );
	await provider.getAbilities();
	await expect(
		provider.executeAbility( 'wpcom/render-plugin-recommendations', {
			picks: [ { slug: ' SEO-BY-RANK-MATH ', why: ' SEO tools. ', source: 'wporg' } ],
		} )
	).resolves.toEqual( { rendered: true, count: 1 } );
	expect( onPicks ).toHaveBeenCalledWith( [
		{ slug: 'seo-by-rank-math', why: 'SEO tools.', source: 'wporg' },
	] );
	expect( page ).toHaveBeenCalledWith( '/plugins/browse/describe/example.com' );
} );
