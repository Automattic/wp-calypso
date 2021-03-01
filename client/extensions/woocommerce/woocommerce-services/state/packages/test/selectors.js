/**
 * External dependencies
 */
import { expect } from 'chai';
import { set } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getAllSelectedPackages,
	getCurrentlyEditingPredefinedPackages,
	getPredefinedPackagesChangesSummary,
	getPackageGroupsForLabelPurchase,
} from '../selectors';
import initialPackagesState from './data/initial-state';

const siteId = 123;
const orderId = 8;

const getState = ( packagesState = initialPackagesState ) => {
	return {
		extensions: {
			woocommerce: {
				woocommerceServices: {
					[ siteId ]: {
						packages: packagesState,
						shippingLabel: {
							[ orderId ]: {
								form: {
									origin: {
										values: {
											country: 'US',
										},
									},
									destination: {
										values: {
											country: 'US',
										},
									},
								},
							},
						},
					},
				},
			},
		},
	};
};

const setOrderAsInternational = ( state ) => {
	const newState = Object.assign( {}, state );
	set(
		newState,
		[
			'extensions',
			'woocommerce',
			'woocommerceServices',
			siteId,
			'shippingLabel',
			orderId,
			'form',
			'destination',
			'values',
			'country',
		],
		'FR'
	);
	return newState;
};

const getStateWithInternationalOrder = () => {
	return setOrderAsInternational( getState() );
};

describe( 'Packages selectors', () => {
	test( 'getAllSelectedPackages when there are custom and predefined packages selected', () => {
		const state = getState();

		const result = getAllSelectedPackages( state, siteId );
		expect( result ).to.eql( [
			{ index: 0, name: '1' },
			{ index: 1, name: '2' },
			{ id: 'box1', name: 'aBox', serviceId: 'service', can_ship_international: false },
			{ id: 'box', name: 'bBox', serviceId: 'service', can_ship_international: true },
			{
				id: 'envelope',
				name: 'envelope',
				serviceId: 'otherService',
				can_ship_international: false,
			},
			{ index: 2, name: 'zBox' },
		] );
	} );

	test( 'getAllSelectedPackages when there are only custom packages selected', () => {
		const state = getState( {
			...initialPackagesState,
			packages: {
				custom: initialPackagesState.packages.custom,
			},
		} );

		const result = getAllSelectedPackages( state, siteId );
		expect( result ).to.eql( [
			{ index: 0, name: '1' },
			{ index: 1, name: '2' },
			{ index: 2, name: 'zBox' },
		] );
	} );

	test( 'getAllSelectedPackages when there are only predefined packages selected', () => {
		const state = getState( {
			...initialPackagesState,
			packages: {
				predefined: initialPackagesState.packages.predefined,
			},
		} );

		const result = getAllSelectedPackages( state, siteId );
		expect( result ).to.eql( [
			{ id: 'box1', name: 'aBox', serviceId: 'service', can_ship_international: false },
			{ id: 'box', name: 'bBox', serviceId: 'service', can_ship_international: true },
			{
				id: 'envelope',
				name: 'envelope',
				serviceId: 'otherService',
				can_ship_international: false,
			},
		] );
	} );

	test( 'getCurrentlyEditingPredefinedPackages', () => {
		const state = getState( {
			...initialPackagesState,
			currentlyEditingPredefinedPackages: initialPackagesState.packages.predefined,
		} );
		const result = getCurrentlyEditingPredefinedPackages( state, siteId );

		expect( result ).to.eql( {
			'service-priority': {
				groupId: 'priority',
				selected: 2,
				total: 3,
				serviceId: 'service',
				title: 'Priority',
				packages: [
					{
						id: 'box',
						name: 'bBox',
						selected: true,
						serviceId: 'service',
						can_ship_international: true,
					},
					{
						id: 'box1',
						name: 'aBox',
						selected: true,
						serviceId: 'service',
						can_ship_international: false,
					},
					{
						id: 'box2',
						name: 'cBox',
						selected: false,
						serviceId: 'service',
						can_ship_international: true,
					},
				],
			},
			'otherService-express': {
				groupId: 'express',
				selected: 1,
				total: 1,
				serviceId: 'otherService',
				title: 'Express',
				packages: [
					{
						id: 'envelope',
						name: 'envelope',
						selected: true,
						serviceId: 'otherService',
						can_ship_international: false,
					},
				],
			},
		} );
	} );

	test( 'getPredefinedPackagesChangesSummary - no changes', () => {
		const state = getState( {
			...initialPackagesState,
			currentlyEditingPredefinedPackages: initialPackagesState.packages.predefined,
		} );
		const result = getPredefinedPackagesChangesSummary( state, siteId );

		expect( result ).to.eql( {
			added: 0,
			removed: 0,
		} );
	} );

	test( 'getPredefinedPackagesChangesSummary - no preexisting packages', () => {
		const state = getState( {
			...initialPackagesState,
			packages: {
				...initialPackagesState.packages,
				predefined: {},
			},
			currentlyEditingPredefinedPackages: initialPackagesState.packages.predefined,
		} );

		const result = getPredefinedPackagesChangesSummary( state, siteId );

		expect( result ).to.eql( {
			added: 3,
			removed: 0,
		} );
	} );

	test( 'getPredefinedPackagesChangesSummary - all packages removed', () => {
		const state = getState( {
			...initialPackagesState,
			currentlyEditingPredefinedPackages: {},
		} );

		const result = getPredefinedPackagesChangesSummary( state, siteId );

		expect( result ).to.eql( {
			added: 0,
			removed: 3,
		} );
	} );

	test( 'getPredefinedPackagesChangesSummary - some packages removed, some added', () => {
		const state = getState( {
			...initialPackagesState,
			currentlyEditingPredefinedPackages: { service: [ 'box2' ] },
		} );

		const result = getPredefinedPackagesChangesSummary( state, siteId );

		expect( result ).to.eql( {
			added: 1,
			removed: 3,
		} );
	} );

	describe( 'getPackageGroupsForLabelPurchase()', () => {
		test( 'the package list for international orders should use only packages that can be shipped internationally, and only the groups that contains those packages', () => {
			const state = getStateWithInternationalOrder();

			const result = getPackageGroupsForLabelPurchase( state, orderId, siteId );

			expect( result ).to.eql( {
				custom: {
					title: 'Custom Packages',
					definitions: [ { name: '1' }, { name: '2' }, { name: 'zBox' } ],
				},
				priority: {
					title: 'Priority',
					definitions: [ { id: 'box', name: 'bBox', can_ship_international: true } ],
				},
			} );
		} );

		test( 'the package list for domestic orders should use all packages', () => {
			const state = getState();

			const result = getPackageGroupsForLabelPurchase( state, orderId, siteId );

			expect( result ).to.eql( {
				custom: {
					title: 'Custom Packages',
					definitions: [ { name: '1' }, { name: '2' }, { name: 'zBox' } ],
				},
				priority: {
					title: 'Priority',
					definitions: [
						{ id: 'box', name: 'bBox', can_ship_international: true },
						{ id: 'box1', name: 'aBox', can_ship_international: false },
					],
				},
				express: {
					title: 'Express',
					definitions: [ { id: 'envelope', name: 'envelope', can_ship_international: false } ],
				},
			} );
		} );
	} );
} );
