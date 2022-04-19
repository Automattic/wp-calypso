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
import { render, screen } from '@testing-library/react';
import { assert } from 'chai';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { PlanStorage } from '../index';

const siteId = 123;

function renderComponent( component, additionalState = {}, planSlug = 'free_plan' ) {
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
	return render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ component }</Provider>
		</QueryClientProvider>
	);
}

describe( 'PlanStorage basic tests', () => {
	beforeAll( () => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.get( '/rest/v1.1/sites/123/media-storage' )
			.reply( 200 );
	} );

	test( 'should not blow up and have class .plan-storage', () => {
		const { container } = renderComponent( <PlanStorage siteId={ siteId } /> );
		assert.lengthOf( container.getElementsByClassName( 'plan-storage' ), 1 );
	} );

	test( 'should render a PlanStorageBar', () => {
		renderComponent( <PlanStorage siteId={ siteId } /> );
		const progressBar = screen.queryByRole( 'progressbar' );
		assert.isDefined( progressBar );
	} );

	test( 'should render when storage is limited', () => {
		const { container: premContainer } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_PREMIUM
		);
		assert.lengthOf( premContainer.getElementsByClassName( 'plan-storage' ), 1 );

		const { container: prem2Container } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_PREMIUM_2_YEARS
		);
		assert.lengthOf( prem2Container.getElementsByClassName( 'plan-storage' ), 1 );

		const { container: persContainer } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_PERSONAL
		);
		assert.lengthOf( persContainer.getElementsByClassName( 'plan-storage' ), 1 );

		const { container: pers2Container } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_PERSONAL_2_YEARS
		);
		assert.lengthOf( pers2Container.getElementsByClassName( 'plan-storage' ), 1 );

		const { container: freeContainer } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_FREE
		);
		assert.lengthOf( freeContainer.getElementsByClassName( 'plan-storage' ), 1 );

		const { container: busContainer } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_BUSINESS
		);
		assert.lengthOf( busContainer.getElementsByClassName( 'plan-storage' ), 1 );

		const { container: bus2Container } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_BUSINESS_2_YEARS
		);
		assert.lengthOf( bus2Container.getElementsByClassName( 'plan-storage' ), 1 );

		const { container: ecomContainer } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_ECOMMERCE
		);
		assert.lengthOf( ecomContainer.getElementsByClassName( 'plan-storage' ), 1 );

		const { container: ecom2Container } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_ECOMMERCE_2_YEARS
		);
		assert.lengthOf( ecom2Container.getElementsByClassName( 'plan-storage' ), 1 );
	} );

	test( 'should render for atomic sites', () => {
		const { container } = renderComponent( <PlanStorage siteId={ siteId } />, {
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
		assert.lengthOf( container.getElementsByClassName( 'plan-storage' ), 1 );
	} );

	test( 'should not render for jetpack sites', () => {
		const { container } = renderComponent( <PlanStorage siteId={ siteId } />, {
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
		assert.lengthOf( container.getElementsByClassName( 'plan-storage' ), 0 );
	} );

	test( 'should not render for contributors', () => {
		const { container } = renderComponent( <PlanStorage siteId={ siteId } />, {
			currentUser: {
				capabilities: {
					[ siteId ]: {
						publish_posts: false,
					},
				},
			},
		} );
		assert.lengthOf( container.getElementsByClassName( 'plan-storage' ), 0 );
	} );

	test( 'should not render when site plan slug is empty', () => {
		const { container } = renderComponent( <PlanStorage siteId={ siteId } />, {}, null );
		assert.lengthOf( container.getElementsByClassName( '.plan-storage' ), 0 );
	} );
} );
