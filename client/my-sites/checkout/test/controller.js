/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import * as page from 'page';
import configureStore from 'redux-mock-store';

/**
 * Internal dependencies
 */
import { redirectJetpackLegacyPlans } from '../controller';
import * as utils from '../utils';
import { PRODUCT_JETPACK_BACKUP, PLAN_JETPACK_PERSONAL } from '@automattic/calypso-products';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

jest.mock( 'page' );
jest.mock( '../utils' );
jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud' );

const mockStore = configureStore();

describe( 'redirectJetpackLegacyPlans', () => {
	const siteId = 1;
	const siteSlug = 'example.com';
	const store = mockStore( {
		ui: {
			selectedSiteId: siteId,
		},
		sites: {
			items: {
				[ siteId ]: {
					slug: siteSlug,
				},
			},
		},
	} );

	let spy;

	beforeEach( () => {
		spy = jest.spyOn( page, 'default' );
	} );

	afterEach( () => {
		spy.mockRestore();
	} );

	it( 'should not redirect if the plan is not a Jetpack legacy plan', () => {
		utils.getDomainOrProductFromContext.mockReturnValue( PRODUCT_JETPACK_BACKUP );

		redirectJetpackLegacyPlans();

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should redirect if the plan is a Jetpack legacy plan', () => {
		utils.getDomainOrProductFromContext.mockReturnValue( PLAN_JETPACK_PERSONAL );
		isJetpackCloud.mockReturnValue( false );

		redirectJetpackLegacyPlans( { store } );

		expect( spy ).toHaveBeenCalledWith( `/plans/${ siteSlug }` );
	} );

	it( 'should redirect to the pricing page in Jetpack cloud', () => {
		utils.getDomainOrProductFromContext.mockReturnValue( PLAN_JETPACK_PERSONAL );
		isJetpackCloud.mockReturnValue( true );

		redirectJetpackLegacyPlans( { store } );

		expect( spy ).toHaveBeenCalledWith( `/pricing/${ siteSlug }` );
	} );
} );
