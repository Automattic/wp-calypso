/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getAllSelectedPackages, getCurrentlyEditingPredefinedPackages, getPredefinedPackagesChangesSummary } from '../selectors';
import initialPackagesState from './initial-state';

const siteId = 123;

const getState = ( packagesState = initialPackagesState ) => {
	return {
		extensions: {
			woocommerce: {
				woocommerceServices: {
					[ siteId ]: {
						packages: packagesState,
					},
				},
			},
		},
	};
};

describe( 'Packages selectors', () => {
	it( 'getAllSelectedPackages when there are custom and predefined packages selected', () => {
		const state = getState();

		const result = getAllSelectedPackages( state, siteId );
		expect( result ).to.eql( [
			{ index: 0, name: '1' },
			{ index: 1, name: '2' },
			{ id: 'box1', name: 'aBox', serviceId: 'service' },
			{ id: 'box', name: 'bBox', serviceId: 'service' },
			{ id: 'envelope', name: 'envelope', serviceId: 'otherService' },
			{ index: 2, name: 'zBox' },
		] );
	} );

	it( 'getAllSelectedPackages when there are only custom packages selected', () => {
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

	it( 'getAllSelectedPackages when there are only predefined packages selected', () => {
		const state = getState( {
			...initialPackagesState,
			packages: {
				predefined: initialPackagesState.packages.predefined,
			},
		} );

		const result = getAllSelectedPackages( state, siteId );
		expect( result ).to.eql( [
			{ id: 'box1', name: 'aBox', serviceId: 'service' },
			{ id: 'box', name: 'bBox', serviceId: 'service' },
			{ id: 'envelope', name: 'envelope', serviceId: 'otherService' },
		] );
	} );

	it( 'getCurrentlyEditingPredefinedPackages', () => {
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
					},
					{
						id: 'box1',
						name: 'aBox',
						selected: true,
						serviceId: 'service',
					},
					{
						id: 'box2',
						name: 'cBox',
						selected: false,
						serviceId: 'service',
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
					},
				],
			},
		} );
	} );

	it( 'getPredefinedPackagesChangesSummary - no changes', () => {
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

	it( 'getPredefinedPackagesChangesSummary - no preexisting packages', () => {
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

	it( 'getPredefinedPackagesChangesSummary - all packages removed', () => {
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

	it( 'getPredefinedPackagesChangesSummary - some packages removed, some added', () => {
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
} );
