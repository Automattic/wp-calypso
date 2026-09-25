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
	).resolves.toEqual( {
		rendered: true,
		count: 1,
		picks: [ { slug: 'seo-by-rank-math', why: 'SEO tools.', source: 'wporg' } ],
	} );
	expect( onPicks ).toHaveBeenCalledWith( [
		{ slug: 'seo-by-rank-math', why: 'SEO tools.', source: 'wporg' },
	] );
	expect( page ).toHaveBeenCalledWith( '/plugins/browse/describe/example.com' );
} );

it( 'delivers recommendations only to the provider executing the ability', async () => {
	const firstOnPicks = jest.fn();
	const secondOnPicks = jest.fn();
	const firstProvider = createToolProvider( { onPicks: firstOnPicks } );
	const secondProvider = createToolProvider( { onPicks: secondOnPicks } );
	await firstProvider.getAbilities();
	const picks = [ { slug: 'woocommerce', why: 'Sell products.' } ];

	await secondProvider.executeAbility( 'wpcom/render-plugin-recommendations', { picks } );

	expect( secondOnPicks ).toHaveBeenCalledWith( picks );
	expect( firstOnPicks ).not.toHaveBeenCalled();
} );

it( 'passes product URLs through unchanged', async () => {
	const onPicks = jest.fn();
	const provider = createToolProvider( { onPicks } );
	const [ ability ] = await provider.getAbilities();
	expect( ability.input_schema?.properties.picks.items.properties.url ).toMatchObject( {
		type: 'string',
	} );
	expect( ability.output_schema?.properties.picks.items.properties.url ).toMatchObject( {
		type: 'string',
	} );
	const url =
		' https://wordpress.com/plugins/woocommerce/example.com?wp-agent-chat=session-123&wp-agent-site=42 ';
	await expect(
		provider.executeAbility( 'wpcom/render-plugin-recommendations', {
			picks: [ { slug: 'woocommerce', why: 'Sell products.', url } ],
		} )
	).resolves.toEqual( {
		rendered: true,
		count: 1,
		picks: [ { slug: 'woocommerce', why: 'Sell products.', url } ],
	} );
	expect( onPicks ).toHaveBeenCalledWith( [ { slug: 'woocommerce', why: 'Sell products.', url } ] );
} );
