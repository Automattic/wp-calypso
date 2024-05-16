/**
 * @jest-environment jsdom
 */

const translate = ( x ) => x;

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
import { PlanStorageBar } from '../bar';

describe( 'PlanStorageBar basic tests', () => {
	const props = {
		translate,
		mediaStorage: {
			storageUsedBytes: 100,
			maxStorageBytes: 1000,
		},
		siteSlug: 'example.com',
		sitePlanSlug: PLAN_FREE,
	};

	test( 'should not blow up and have class .plan-storage-bar', () => {
		const { container } = render( <PlanStorageBar { ...props } /> );
		expect( container.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 1 );
	} );

	test( 'should render ProgressBar', () => {
		render( <PlanStorageBar { ...props } /> );
		const progressBar = screen.queryByRole( 'progressbar' );
		expect( progressBar ).toBeDefined();
		expect( progressBar ).toHaveAttribute( 'aria-valuenow', '10' );
	} );

	test( 'should render when storage is limited', () => {
		const { container: premContainer } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_PREMIUM } />
		);
		expect( premContainer.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 1 );

		const { container: prem2Container } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_PREMIUM_2_YEARS } />
		);
		expect( prem2Container.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 1 );

		const { container: persContailer } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_PERSONAL } />
		);
		expect( persContailer.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 1 );

		const { container: pers2Container } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_PERSONAL_2_YEARS } />
		);
		expect( pers2Container.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 1 );

		const { container: freeContainer } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_FREE } />
		);
		expect( freeContainer.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 1 );

		const { container: busContainer } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_BUSINESS } />
		);
		expect( busContainer.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 1 );

		const { container: bus2Container } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_BUSINESS_2_YEARS } />
		);
		expect( bus2Container.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 1 );

		const { container: ecomContainer } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_ECOMMERCE } />
		);
		expect( ecomContainer.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 1 );

		const { container: ecom2Container } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_ECOMMERCE_2_YEARS } />
		);
		expect( ecom2Container.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 1 );
	} );

	test( 'should not render when storage has valid maxStorageBytes', () => {
		const { container: storage1 } = render(
			<PlanStorageBar { ...props } mediaStorage={ { maxStorageBytes: 1 } } />
		);
		expect( storage1.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 1 );

		const { container: storage0 } = render(
			<PlanStorageBar { ...props } mediaStorage={ { maxStorageBytes: 0 } } />
		);
		expect( storage0.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 1 );

		const { container: storage50 } = render(
			<PlanStorageBar { ...props } mediaStorage={ { maxStorageBytes: 50 } } />
		);
		expect( storage50.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 1 );
	} );

	test( 'should not render when storage is falsey or -1', () => {
		const { container: storage0 } = render( <PlanStorageBar { ...props } mediaStorage={ 0 } /> );
		expect( storage0.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 0 );

		const { container: storageFalse } = render(
			<PlanStorageBar { ...props } mediaStorage={ false } />
		);
		expect( storageFalse.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 0 );

		const { container: storageNull } = render(
			<PlanStorageBar { ...props } mediaStorage={ null } />
		);
		expect( storageNull.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 0 );

		const { container: storageUnlimited } = render(
			<PlanStorageBar { ...props } mediaStorage={ { maxStorageBytes: -1 } } />
		);
		expect( storageUnlimited.getElementsByClassName( 'plan-storage__bar' ) ).toHaveLength( 0 );
	} );

	test( 'should include upgrade link when displayUpgradeLink is true', () => {
		const { container } = render( <PlanStorageBar { ...props } displayUpgradeLink /> );
		expect( container.getElementsByClassName( 'plan-storage__storage-link' ) ).toHaveLength( 1 );
	} );

	test( 'should not include upgrade link when displayUpgradeLink is false', () => {
		const { container } = render( <PlanStorageBar { ...props } displayUpgradeLink={ false } /> );
		expect( container.getElementsByClassName( 'plan-storage__storage-link' ) ).toHaveLength( 0 );
	} );
} );
