/**
 * @vitest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { vi } from 'vitest';
import { createToolProvider } from '../agent-provider';
import { deliverPicks } from '../picks-store';

vi.mock( '@automattic/calypso-router', () => ( { default: vi.fn() } ) );
vi.mock( '@wordpress/abilities', () => {
	const abilities = new Map();
	return {
		registerAbilityCategory: vi.fn(),
		registerAbility: vi.fn( ( ability ) => abilities.set( ability.name, ability ) ),
		getAbilities: () => Array.from( abilities.values() ),
		executeAbility: ( name: string, args: unknown ) => abilities.get( name ).callback( args ),
	};
} );

it( 'delivers normalized recommendations to the marketplace and opens Describe', async () => {
	const onPicks = vi.fn( ( picks ) => deliverPicks( picks, 'example.com' ) );
	const provider = createToolProvider( { onPicks } );
	const [ ability ] = await provider.getAbilities();
	expect( ability.callback ).toEqual( expect.any( Function ) );
	await expect(
		ability.callback( {
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
	const firstOnPicks = vi.fn();
	const secondOnPicks = vi.fn();
	const firstProvider = createToolProvider( { onPicks: firstOnPicks } );
	const secondProvider = createToolProvider( { onPicks: secondOnPicks } );
	await firstProvider.getAbilities();
	const [ ability ] = await secondProvider.getAbilities();
	const picks = [ { slug: 'woocommerce', why: 'Sell products.' } ];

	await ability.callback( { picks } );

	expect( secondOnPicks ).toHaveBeenCalledWith( picks );
	expect( firstOnPicks ).not.toHaveBeenCalled();
} );

it( 'trims product URLs while preserving query parameters', async () => {
	const onPicks = vi.fn();
	const provider = createToolProvider( { onPicks } );
	const [ ability ] = await provider.getAbilities();
	expect( ability.input_schema?.properties.picks.items.properties.url ).toMatchObject( {
		type: 'string',
	} );
	expect( ability.output_schema?.properties.picks.items.properties.url ).toMatchObject( {
		type: 'string',
	} );
	const url =
		'https://wordpress.com/plugins/woocommerce/example.com?wp-agent-chat=session-123&wp-agent-site=42';
	await expect(
		provider.executeAbility( 'wpcom/render-plugin-recommendations', {
			picks: [ { slug: 'woocommerce', why: 'Sell products.', url: ` ${ url } ` } ],
		} )
	).resolves.toEqual( {
		rendered: true,
		count: 1,
		picks: [ { slug: 'woocommerce', why: 'Sell products.', url } ],
	} );
	expect( onPicks ).toHaveBeenCalledWith( [ { slug: 'woocommerce', why: 'Sell products.', url } ] );
} );

it.each( [ '', '   ', 123, true, { href: 'https://example.com' } ] )(
	'omits an empty or non-string product URL without dropping the recommendation: %o',
	async ( url ) => {
		const onPicks = vi.fn();
		const provider = createToolProvider( { onPicks } );

		await expect(
			provider.executeAbility( 'wpcom/render-plugin-recommendations', {
				picks: [ { slug: 'woocommerce', why: 'Sell products.', url } ],
			} )
		).resolves.toEqual( {
			rendered: true,
			count: 1,
			picks: [ { slug: 'woocommerce', why: 'Sell products.' } ],
		} );
		expect( onPicks ).toHaveBeenCalledWith( [ { slug: 'woocommerce', why: 'Sell products.' } ] );
	}
);
