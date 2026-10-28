/**
 * @jest-environment jsdom
 */
import {
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_GROWTH_MONTHLY,
	PLAN_JETPACK_GROWTH_YEARLY,
	PLAN_JETPACK_PRO_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	TERM_ANNUALLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { getPlansToDisplay } from '../utils';

const slugsOnSale =
	( ...slugs: string[] ) =>
	( productSlug: string ) =>
		slugs.includes( productSlug );

const displayedSlugs = ( ...args: Parameters< typeof getPlansToDisplay > ) =>
	getPlansToDisplay( ...args ).map( ( { productSlug } ) => productSlug );

describe( 'getPlansToDisplay', () => {
	it( 'shows today’s bundles while Pro is off sale', () => {
		expect(
			displayedSlugs( {
				duration: TERM_ANNUALLY,
				currentPlanSlug: null,
				isOnSale: slugsOnSale(
					PLAN_JETPACK_SECURITY_T1_YEARLY,
					PLAN_JETPACK_GROWTH_YEARLY,
					PLAN_JETPACK_COMPLETE
				),
			} )
		).toEqual( [
			PLAN_JETPACK_SECURITY_T1_YEARLY,
			PLAN_JETPACK_GROWTH_YEARLY,
			PLAN_JETPACK_COMPLETE,
		] );
	} );

	it( 'shows Pro and Complete, and hides retired bundles, after launch', () => {
		expect(
			displayedSlugs( {
				duration: TERM_ANNUALLY,
				currentPlanSlug: null,
				isOnSale: slugsOnSale( PLAN_JETPACK_PRO_YEARLY, PLAN_JETPACK_COMPLETE ),
			} )
		).toEqual( [ PLAN_JETPACK_PRO_YEARLY, PLAN_JETPACK_COMPLETE ] );
	} );

	it( 'offers only Complete monthly on the monthly view after launch', () => {
		expect(
			displayedSlugs( {
				duration: TERM_MONTHLY,
				currentPlanSlug: null,
				isOnSale: slugsOnSale(
					PLAN_JETPACK_PRO_YEARLY,
					PLAN_JETPACK_COMPLETE,
					PLAN_JETPACK_COMPLETE_MONTHLY
				),
			} )
		).toEqual( [ PLAN_JETPACK_COMPLETE_MONTHLY ] );
	} );

	it( 'shows no bundle when product data is missing', () => {
		expect(
			displayedSlugs( { duration: TERM_ANNUALLY, currentPlanSlug: null, isOnSale: () => false } )
		).toEqual( [] );
	} );

	it.each( [ PLAN_JETPACK_SECURITY_T1_MONTHLY, PLAN_JETPACK_GROWTH_MONTHLY ] )(
		'keeps a retired %s subscription visible to its owner',
		( currentPlanSlug ) => {
			expect(
				displayedSlugs( {
					duration: TERM_MONTHLY,
					currentPlanSlug,
					isOnSale: slugsOnSale( PLAN_JETPACK_COMPLETE_MONTHLY ),
				} )
			).toEqual( [ currentPlanSlug, PLAN_JETPACK_COMPLETE_MONTHLY ] );
		}
	);
	it( 'shows a retired T2 subscription once to its owner', () => {
		expect(
			displayedSlugs( {
				duration: TERM_ANNUALLY,
				currentPlanSlug: PLAN_JETPACK_SECURITY_T2_YEARLY,
				isOnSale: slugsOnSale( PLAN_JETPACK_PRO_YEARLY, PLAN_JETPACK_COMPLETE ),
			} )
		).toEqual( [
			PLAN_JETPACK_SECURITY_T2_YEARLY,
			PLAN_JETPACK_PRO_YEARLY,
			PLAN_JETPACK_COMPLETE,
		] );
	} );
} );
