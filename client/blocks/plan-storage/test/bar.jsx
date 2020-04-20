jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

const translate = ( x ) => x;
jest.mock( 'i18n-calypso', () => ( {
	localize: ( Comp ) => ( props ) => (
		<Comp
			{ ...props }
			translate={ function ( x ) {
				return x;
			} }
		/>
	),
	numberFormat: ( x ) => x,
	translate: ( x ) => x,
} ) );

/**
 * External dependencies
 */
import { assert } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
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
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
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

	test( 'should not blow up and have class .plan-storage-bar ', () => {
		const bar = shallow( <PlanStorageBar { ...props } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 1 );
	} );

	test( 'should render ProgressBar', () => {
		const bar = shallow( <PlanStorageBar { ...props } /> );
		const progressBar = bar.find( 'ProgressBar' );
		assert.lengthOf( progressBar, 1 );
		assert.equal( progressBar.props().value, 10 );
	} );

	test( 'should render when storage is limited', () => {
		let bar;

		bar = shallow( <PlanStorageBar { ...props } sitePlanSlug={ PLAN_PREMIUM } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 1 );

		bar = shallow( <PlanStorageBar { ...props } sitePlanSlug={ PLAN_PREMIUM_2_YEARS } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 1 );

		bar = shallow( <PlanStorageBar { ...props } sitePlanSlug={ PLAN_PERSONAL } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 1 );

		bar = shallow( <PlanStorageBar { ...props } sitePlanSlug={ PLAN_PERSONAL_2_YEARS } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 1 );

		bar = shallow( <PlanStorageBar { ...props } sitePlanSlug={ PLAN_FREE } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 1 );

		bar = shallow( <PlanStorageBar { ...props } sitePlanSlug={ PLAN_BUSINESS } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 1 );

		bar = shallow( <PlanStorageBar { ...props } sitePlanSlug={ PLAN_BUSINESS_2_YEARS } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 1 );

		bar = shallow( <PlanStorageBar { ...props } sitePlanSlug={ PLAN_ECOMMERCE } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 1 );

		bar = shallow( <PlanStorageBar { ...props } sitePlanSlug={ PLAN_ECOMMERCE_2_YEARS } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 1 );
	} );

	test( 'should not render when storage has valid max_storage_bytes', () => {
		let bar;

		bar = shallow( <PlanStorageBar { ...props } mediaStorage={ { max_storage_bytes: 1 } } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 1 );

		bar = shallow( <PlanStorageBar { ...props } mediaStorage={ { max_storage_bytes: 0 } } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 1 );

		bar = shallow( <PlanStorageBar { ...props } mediaStorage={ { max_storage_bytes: 50 } } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 1 );
	} );

	test( 'should not render when storage is falsey or -1', () => {
		let bar;

		bar = shallow( <PlanStorageBar { ...props } mediaStorage={ 0 } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 0 );

		bar = shallow( <PlanStorageBar { ...props } mediaStorage={ false } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 0 );

		bar = shallow( <PlanStorageBar { ...props } mediaStorage={ null } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 0 );

		bar = shallow( <PlanStorageBar { ...props } mediaStorage={ { max_storage_bytes: -1 } } /> );
		assert.lengthOf( bar.find( '.plan-storage__bar' ), 0 );
	} );

	test( 'should include upgrade link when displayUpgradeLink is true', () => {
		const bar = shallow( <PlanStorageBar { ...props } displayUpgradeLink={ true } /> );
		assert.lengthOf( bar.find( '.plan-storage__storage-link' ), 1 );
	} );

	test( 'should not include upgrade link when displayUpgradeLink is false', () => {
		const bar = shallow( <PlanStorageBar { ...props } displayUpgradeLink={ false } /> );
		assert.lengthOf( bar.find( '.plan-storage__storage-link' ), 0 );
	} );
} );
