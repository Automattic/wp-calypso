/**
 * @jest-environment jsdom
 */

import {
	PLAN_JETPACK_PERSONAL,
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
} from '@automattic/calypso-products';
import * as page from '@automattic/calypso-router';
import configureStore from 'redux-mock-store';
import { COMPARE_PLANS_QUERY_PARAM } from '../../plans/jetpack-plans/plan-upgrade/constants';
import { redirectJetpackLegacyPlans } from '../controller';
import * as utils from '../utils';

jest.mock( '@automattic/calypso-router' );
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
		utils.getProductSlugFromContext.mockReturnValue( PRODUCT_JETPACK_BACKUP_T1_YEARLY );

		redirectJetpackLegacyPlans( { store }, next );

		expect( spy ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );

	it( 'should redirect if the plan is a Jetpack legacy plan', () => {
		utils.getProductSlugFromContext.mockReturnValue( PLAN_JETPACK_PERSONAL );

		redirectJetpackLegacyPlans( { store }, next );

		const redirectUrl = `/plans/${ siteSlug }?${ COMPARE_PLANS_QUERY_PARAM }=${ PLAN_JETPACK_PERSONAL },${ PRODUCT_JETPACK_BACKUP_T1_YEARLY },${ PRODUCT_JETPACK_ANTI_SPAM }`;

		expect( spy ).toHaveBeenCalledWith( redirectUrl );
		expect( next ).not.toHaveBeenCalled();
	} );
} );
