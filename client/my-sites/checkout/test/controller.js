/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import * as page from 'page';
import configureStore from 'redux-mock-store';
import {
	PLAN_JETPACK_PERSONAL,
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_BACKUP_DAILY,
} from '@automattic/calypso-products';

/**
 * Internal dependencies
 */
import { redirectJetpackLegacyPlans } from '../controller';
import * as utils from '../utils';
import { COMPARE_PLANS_QUERY_PARAM } from '../../plans/jetpack-plans/plan-upgrade/constants';

jest.mock( 'page' );
jest.mock( '../utils' );

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
	let next;

	beforeEach( () => {
		spy = jest.spyOn( page, 'default' );
		next = jest.fn();
	} );

	afterEach( () => {
		spy.mockRestore();
		next.mockRestore();
	} );

	it( 'should not redirect if the plan is not a Jetpack legacy plan', () => {
		utils.getDomainOrProductFromContext.mockReturnValue( PRODUCT_JETPACK_BACKUP_DAILY );

		redirectJetpackLegacyPlans( {}, next );

		expect( spy ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );

	it( 'should redirect if the plan is a Jetpack legacy plan', () => {
		utils.getDomainOrProductFromContext.mockReturnValue( PLAN_JETPACK_PERSONAL );

		redirectJetpackLegacyPlans( { store }, next );

		const redirectUrl = `/plans/${ siteSlug }?${ COMPARE_PLANS_QUERY_PARAM }=${ PLAN_JETPACK_PERSONAL },${ PRODUCT_JETPACK_BACKUP_DAILY },${ PRODUCT_JETPACK_ANTI_SPAM }`;

		expect( spy ).toHaveBeenCalledWith( redirectUrl );
		expect( next ).not.toHaveBeenCalled();
	} );
} );
