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
import { assert } from 'chai';
import '@testing-library/jest-dom';
import { PlanStorageBar } from '../bar';

describe( 'PlanStorageBar basic tests', () => {
	const props = {
		translate,
		mediaStorage: {
			storage_used_bytes: 100,
			max_storage_bytes: 1000,
		},
		siteSlug: 'example.com',
		sitePlanSlug: PLAN_FREE,
	};

	test( 'should not blow up and have class .plan-storage-bar', () => {
		const { container } = render( <PlanStorageBar { ...props } /> );
		assert.lengthOf( container.getElementsByClassName( 'plan-storage__bar' ), 1 );
	} );

	test( 'should render ProgressBar', () => {
		render( <PlanStorageBar { ...props } /> );
		const progressBar = screen.queryByRole( 'progressbar' );
		assert.isDefined( progressBar );
		expect( progressBar ).toHaveAttribute( 'aria-valuenow', '10' );
	} );

	test( 'should render when storage is limited', () => {
		const { container: premContainer } = render( <PlanStorageBar { ...props } /> );
		render( <PlanStorageBar { ...props } sitePlanSlug={ PLAN_PREMIUM } /> );
		assert.lengthOf( premContainer.getElementsByClassName( 'plan-storage__bar' ), 1 );

		const { container: prem2Container } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_PREMIUM_2_YEARS } />
		);
		assert.lengthOf( prem2Container.getElementsByClassName( 'plan-storage__bar' ), 1 );

		const { container: persContailer } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_PERSONAL } />
		);
		assert.lengthOf( persContailer.getElementsByClassName( 'plan-storage__bar' ), 1 );

		const { container: pers2Container } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_PERSONAL_2_YEARS } />
		);
		assert.lengthOf( pers2Container.getElementsByClassName( 'plan-storage__bar' ), 1 );

		const { container: freeContainer } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_FREE } />
		);
		assert.lengthOf( freeContainer.getElementsByClassName( 'plan-storage__bar' ), 1 );

		const { container: busContainer } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_BUSINESS } />
		);
		assert.lengthOf( busContainer.getElementsByClassName( 'plan-storage__bar' ), 1 );

		const { container: bus2Container } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_BUSINESS_2_YEARS } />
		);
		assert.lengthOf( bus2Container.getElementsByClassName( 'plan-storage__bar' ), 1 );

		const { container: ecomContainer } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_ECOMMERCE } />
		);
		assert.lengthOf( ecomContainer.getElementsByClassName( 'plan-storage__bar' ), 1 );

		const { container: ecom2Container } = render(
			<PlanStorageBar { ...props } sitePlanSlug={ PLAN_ECOMMERCE_2_YEARS } />
		);
		assert.lengthOf( ecom2Container.getElementsByClassName( 'plan-storage__bar' ), 1 );
	} );

	test( 'should not render when storage has valid max_storage_bytes', () => {
		const { container: storage1 } = render(
			<PlanStorageBar { ...props } mediaStorage={ { max_storage_bytes: 1 } } />
		);
		assert.lengthOf( storage1.getElementsByClassName( 'plan-storage__bar' ), 1 );

		const { container: storage0 } = render(
			<PlanStorageBar { ...props } mediaStorage={ { max_storage_bytes: 0 } } />
		);
		assert.lengthOf( storage0.getElementsByClassName( 'plan-storage__bar' ), 1 );

		const { container: storage50 } = render(
			<PlanStorageBar { ...props } mediaStorage={ { max_storage_bytes: 50 } } />
		);
		assert.lengthOf( storage50.getElementsByClassName( 'plan-storage__bar' ), 1 );
	} );

	test( 'should not render when storage is falsey or -1', () => {
		const { container: storage0 } = render( <PlanStorageBar { ...props } mediaStorage={ 0 } /> );
		assert.lengthOf( storage0.getElementsByClassName( 'plan-storage__bar' ), 0 );

		const { container: storageFalse } = render(
			<PlanStorageBar { ...props } mediaStorage={ false } />
		);
		assert.lengthOf( storageFalse.getElementsByClassName( 'plan-storage__bar' ), 0 );

		const { container: storageNull } = render(
			<PlanStorageBar { ...props } mediaStorage={ null } />
		);
		assert.lengthOf( storageNull.getElementsByClassName( 'plan-storage__bar' ), 0 );

		const { container: storageUnlimited } = render(
			<PlanStorageBar { ...props } mediaStorage={ { max_storage_bytes: -1 } } />
		);
		assert.lengthOf( storageUnlimited.getElementsByClassName( 'plan-storage__bar' ), 0 );
	} );

	test( 'should include upgrade link when displayUpgradeLink is true', () => {
		const { container } = render( <PlanStorageBar { ...props } displayUpgradeLink={ true } /> );
		assert.lengthOf( container.getElementsByClassName( 'plan-storage__storage-link' ), 1 );
	} );

	test( 'should not include upgrade link when displayUpgradeLink is false', () => {
		const { container } = render( <PlanStorageBar { ...props } displayUpgradeLink={ false } /> );
		assert.lengthOf( container.getElementsByClassName( 'plan-storage__storage-link' ), 0 );
	} );
} );
