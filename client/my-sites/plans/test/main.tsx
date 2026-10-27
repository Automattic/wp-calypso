/**
 * @jest-environment jsdom
 */
jest.mock( '@automattic/calypso-config' );
jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/components/data/query-site-purchases', () => jest.fn() );
jest.mock( 'calypso/components/data/query-products-list', () => jest.fn() );
jest.mock( '@automattic/data-stores/src/plans/hooks/use-current-plan', () => jest.fn() );
jest.mock( 'calypso/my-sites/plans-features-main', () => jest.fn( () => null ) );

import { isEnabled } from '@automattic/calypso-config';
import { PLAN_STUDENT } from '@automattic/calypso-products';
import { useCurrentPlan } from '@automattic/data-stores/src/plans';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import purchasesReducer from 'calypso/state/purchases/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import PlansWrapper from '../main';

const SITE_ID = 1;

const initialState = {
	sites: {
		items: {
			[ SITE_ID ]: {
				ID: SITE_ID,
				slug: 'example.wordpress.com',
				plan: { product_slug: PLAN_STUDENT, user_is_owner: true },
			},
		},
	},
	ui: { selectedSiteId: SITE_ID },
	currentUser: { capabilities: { [ SITE_ID ]: { manage_options: true } } },
};

describe( 'Plans page on a student-plan site', () => {
	beforeAll( () => {
		window.scrollTo = jest.fn();
	} );

	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( isEnabled ).mockReturnValue( false );
		jest.mocked( useCurrentPlan ).mockReturnValue( { productSlug: PLAN_STUDENT } as never );
	} );

	it( 'passes the checkout attribution to the student plans grid', () => {
		renderWithProvider(
			<PlansWrapper
				context={ { path: '/plans/example.wordpress.com' } as never }
				checkoutAttribution={ { source: 'wp_ai_credits', aiSessionId: 'abc123' } }
			/>,
			{ initialState, reducers: { ui: uiReducer, purchases: purchasesReducer } }
		);

		expect( PlansFeaturesMain ).toHaveBeenCalled();
		expect( jest.mocked( PlansFeaturesMain ).mock.lastCall?.[ 0 ] ).toMatchObject( {
			intent: 'plans-student',
			checkoutAttribution: { source: 'wp_ai_credits', aiSessionId: 'abc123' },
		} );
	} );
} );
