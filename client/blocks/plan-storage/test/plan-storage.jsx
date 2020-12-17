jest.mock( 'calypso/lib/abtest', () => ( {
	abtest: () => '',
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
} from 'calypso/lib/plans/constants';

/**
 * Internal dependencies
 */
import { PlanStorage } from '../index';

describe( 'PlanStorage basic tests', () => {
	const props = {
		canViewBar: true,
		mediaStorage: {
			max_storage_bytes: 1000,
		},
		siteId: 123,
		siteSlug: 'example.com',
		sitePlanSlug: PLAN_FREE,
	};

	test( 'should not blow up and have class .plan-storage ', () => {
		const storage = shallow( <PlanStorage { ...props } /> );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );
	} );

	test( 'should render a PlanStorageBar', () => {
		const storage = shallow( <PlanStorage { ...props } /> );
		const bar = storage.find( 'Localized(PlanStorageBar)' );
		assert.lengthOf( bar, 1 );
		assert.equal( bar.props().sitePlanSlug, props.sitePlanSlug );
		assert.equal( bar.props().mediaStorage, props.mediaStorage );
	} );

	test( 'should render when storage is limited', () => {
		let storage;

		storage = shallow( <PlanStorage { ...props } sitePlanSlug={ PLAN_PREMIUM } /> );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );

		storage = shallow( <PlanStorage { ...props } sitePlanSlug={ PLAN_PREMIUM_2_YEARS } /> );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );

		storage = shallow( <PlanStorage { ...props } sitePlanSlug={ PLAN_PERSONAL } /> );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );

		storage = shallow( <PlanStorage { ...props } sitePlanSlug={ PLAN_PERSONAL_2_YEARS } /> );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );

		storage = shallow( <PlanStorage { ...props } sitePlanSlug={ PLAN_FREE } /> );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );

		storage = shallow( <PlanStorage { ...props } sitePlanSlug={ PLAN_BUSINESS } /> );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );

		storage = shallow( <PlanStorage { ...props } sitePlanSlug={ PLAN_BUSINESS_2_YEARS } /> );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );

		storage = shallow( <PlanStorage { ...props } sitePlanSlug={ PLAN_ECOMMERCE } /> );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );

		storage = shallow( <PlanStorage { ...props } sitePlanSlug={ PLAN_ECOMMERCE_2_YEARS } /> );
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );
	} );

	test( 'should render for atomic sites', () => {
		const storage = shallow(
			<PlanStorage
				{ ...props }
				sitePlanSlug={ PLAN_BUSINESS }
				jetpackSite={ true }
				atomicSite={ true }
			/>
		);
		assert.lengthOf( storage.find( '.plan-storage' ), 1 );
	} );

	test( 'should not render for jetpack sites', () => {
		const storage = shallow(
			<PlanStorage { ...props } jetpackSite={ true } atomicSite={ false } />
		);
		assert.lengthOf( storage.find( '.plan-storage' ), 0 );
	} );

	test( 'should not render for contributors', () => {
		const storage = shallow( <PlanStorage { ...props } canViewBar={ false } /> );
		assert.lengthOf( storage.find( '.plan-storage' ), 0 );
	} );

	test( 'should not render when site plan slug is empty', () => {
		const storage = shallow( <PlanStorage { ...props } sitePlanSlug={ null } /> );
		assert.lengthOf( storage.find( '.plan-storage' ), 0 );
	} );
} );
