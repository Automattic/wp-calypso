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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import PlanStorage from 'calypso/blocks/plan-storage';

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
		expect( container.getElementsByClassName( 'plan-storage' ) ).toHaveLength( 1 );
	} );

	test( 'should render a PlanStorageBar', () => {
		renderComponent( <PlanStorage siteId={ siteId } /> );
		const progressBar = screen.queryByRole( 'progressbar' );
		expect( progressBar ).toBeDefined();
	} );

	test( 'should render when storage is limited', () => {
		const { container: premContainer } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_PREMIUM
		);
		expect( premContainer.getElementsByClassName( 'plan-storage' ) ).toHaveLength( 1 );

		const { container: prem2Container } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_PREMIUM_2_YEARS
		);
		expect( prem2Container.getElementsByClassName( 'plan-storage' ) ).toHaveLength( 1 );

		const { container: persContainer } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_PERSONAL
		);
		expect( persContainer.getElementsByClassName( 'plan-storage' ) ).toHaveLength( 1 );

		const { container: pers2Container } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_PERSONAL_2_YEARS
		);
		expect( pers2Container.getElementsByClassName( 'plan-storage' ) ).toHaveLength( 1 );

		const { container: freeContainer } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_FREE
		);
		expect( freeContainer.getElementsByClassName( 'plan-storage' ) ).toHaveLength( 1 );

		const { container: busContainer } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_BUSINESS
		);
		expect( busContainer.getElementsByClassName( 'plan-storage' ) ).toHaveLength( 1 );

		const { container: bus2Container } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_BUSINESS_2_YEARS
		);
		expect( bus2Container.getElementsByClassName( 'plan-storage' ) ).toHaveLength( 1 );

		const { container: ecomContainer } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_ECOMMERCE
		);
		expect( ecomContainer.getElementsByClassName( 'plan-storage' ) ).toHaveLength( 1 );

		const { container: ecom2Container } = renderComponent(
			<PlanStorage siteId={ siteId } />,
			{},
			PLAN_ECOMMERCE_2_YEARS
		);
		expect( ecom2Container.getElementsByClassName( 'plan-storage' ) ).toHaveLength( 1 );
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
							wpcom_staging_blog_ids: [],
						},
					},
				},
			},
		} );
		expect( container.getElementsByClassName( 'plan-storage' ) ).toHaveLength( 1 );
		expect( container.getElementsByClassName( 'plan-storage__shared_quota' ) ).toHaveLength( 0 );
	} );

	test( 'should render for an atomic site with a staging site', () => {
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
							wpcom_staging_blog_ids: [ 456 ],
						},
					},
				},
			},
		} );
		expect( container.getElementsByClassName( 'plan-storage' ) ).toHaveLength( 1 );
		expect( container.getElementsByClassName( 'plan-storage__shared_quota' ) ).toHaveLength( 1 );
	} );

	test( 'should render for a staging site', () => {
		const { container } = renderComponent( <PlanStorage siteId={ siteId } />, {
			sites: {
				items: {
					[ siteId ]: {
						name: 'staging-4e35-awesomesite.wpcomstaging.com',
						is_wpcom_staging_site: true,
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
		expect( container.getElementsByClassName( 'plan-storage' ) ).toHaveLength( 1 );
		expect( container.getElementsByClassName( 'plan-storage__shared_quota' ) ).toHaveLength( 1 );
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
		expect( container.getElementsByClassName( 'plan-storage' ) ).toHaveLength( 0 );
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
		expect( container.getElementsByClassName( 'plan-storage' ) ).toHaveLength( 0 );
	} );

	test( 'should not render when site plan slug is empty', () => {
		const { container } = renderComponent( <PlanStorage siteId={ siteId } />, {}, null );
		expect( container.getElementsByClassName( '.plan-storage' ) ).toHaveLength( 0 );
	} );
} );
