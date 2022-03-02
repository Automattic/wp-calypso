/**
 * @jest-environment jsdom
 */
import {
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_FREE,
} from '@automattic/calypso-products';
import { assert } from 'chai';
import { mount } from 'enzyme';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { PlanStorage } from '../index';

const siteId = 123;

function render( component, additionalState = {}, planSlug = 'free_plan' ) {
	const queryClient = new QueryClient();
	const store = {
		getState: () => ( {
			currentUser: {
				capabilities: {
					[ siteId ]: {
						publish_posts: true,
					},
				},
			},
			sites: {
				items: {
					[ siteId ]: {
						name: 'yourjetpack.blog',
						plan: {
							product_slug: planSlug,
						},
					},
				},
			},
			...additionalState,
		} ),
		subscribe: () => {},
		dispatch: () => {},
	};
	return mount(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ component }</Provider>
		</QueryClientProvider>
	);
}

describe( 'PlanStorage basic tests', () => {
	test( 'should not blow up and have class .plan-storage', () => {
		const storage = render( <PlanStorage siteId={ siteId } /> );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );
	} );

	test( 'should render a PlanStorageBar', () => {
		const storage = render( <PlanStorage siteId={ siteId } /> );
		const bar = storage.find( 'Localized(PlanStorageBar)' );
		assert.lengthOf( bar, 1 );
	} );

	test( 'should render when storage is limited', () => {
		let storage;

		storage = render( <PlanStorage siteId={ siteId } />, {}, PLAN_PREMIUM );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );

		storage = render( <PlanStorage siteId={ siteId } />, {}, PLAN_PREMIUM_2_YEARS );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );

		storage = render( <PlanStorage siteId={ siteId } />, {}, PLAN_PERSONAL );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );

		storage = render( <PlanStorage siteId={ siteId } />, {}, PLAN_PERSONAL_2_YEARS );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );

		storage = render( <PlanStorage siteId={ siteId } />, {}, PLAN_FREE );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );

		storage = render( <PlanStorage siteId={ siteId } />, {}, PLAN_BUSINESS );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );

		storage = render( <PlanStorage siteId={ siteId } />, {}, PLAN_BUSINESS_2_YEARS );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );

		storage = render( <PlanStorage siteId={ siteId } />, {}, PLAN_ECOMMERCE );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );

		storage = render( <PlanStorage siteId={ siteId } />, {}, PLAN_ECOMMERCE_2_YEARS );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );
	} );

	test( 'should render for atomic sites', () => {
		const storage = render( <PlanStorage siteId={ siteId } />, {
			sites: {
				items: {
					[ siteId ]: {
						name: 'yourjetpack.blog',
						jetpack: true,
						plan: {
							product_slug: PLAN_BUSINESS,
						},
						options: {
							is_automated_transfer: true,
						},
					},
				},
			},
		} );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );
	} );

	test( 'should not render for jetpack sites', () => {
		const storage = render( <PlanStorage siteId={ siteId } />, {
			sites: {
				items: {
					[ siteId ]: {
						name: 'yourjetpack.blog',
						jetpack: true,
						plan: {
							product_slug: 'free_plan',
						},
					},
				},
			},
		} );
		assert.lengthOf( storage.find( '.plan-storage' ), 0 );
	} );

	test( 'should not render for contributors', () => {
		const storage = render( <PlanStorage siteId={ siteId } />, {
			currentUser: {
				capabilities: {
					[ siteId ]: {
						publish_posts: false,
					},
				},
			},
		} );
		assert.lengthOf( storage.find( '.plan-storage' ), 0 );
	} );

	test( 'should not render when site plan slug is empty', () => {
		const storage = render( <PlanStorage siteId={ siteId } />, {}, null );
		assert.lengthOf( storage.find( '.plan-storage' ), 0 );
	} );
} );
