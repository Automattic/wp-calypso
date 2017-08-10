/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SERVICES_PACKAGES_ADD_PACKAGE,
	WOOCOMMERCE_SERVICES_PACKAGES_REMOVE_PACKAGE,
	WOOCOMMERCE_SERVICES_PACKAGES_EDIT_PACKAGE,
	WOOCOMMERCE_SERVICES_PACKAGES_DISMISS_MODAL,
	WOOCOMMERCE_SERVICES_PACKAGES_SET_IS_SAVING,
	WOOCOMMERCE_SERVICES_PACKAGES_SAVE_PACKAGE,
	WOOCOMMERCE_SERVICES_PACKAGES_UPDATE_PACKAGES_FIELD,
	WOOCOMMERCE_SERVICES_PACKAGES_TOGGLE_OUTER_DIMENSIONS,
	WOOCOMMERCE_SERVICES_PACKAGES_SET_MODAL_ERRORS,
} from '../../action-types';
import {
	addPackage,
	removePackage,
	editPackage,
	dismissModal,
	savePackage,
	updatePackagesField,
	toggleOuterDimensions,
	setModalErrors,
	setIsSaving,
} from '../actions';

const siteId = 123;

describe( 'Packages state actions', () => {
	it( '#addPackage()', () => {
		expect( addPackage( siteId ) ).to.eql( {
			type: WOOCOMMERCE_SERVICES_PACKAGES_ADD_PACKAGE,
			siteId,
		} );
	} );

	it( '#editPackage()', () => {
		const packageToEdit = {
			name: 'Test box',
			dimensions: '10 x 13 x 6',
			is_letter: false,
		};
		expect( editPackage( siteId, packageToEdit ) ).to.eql( {
			type: WOOCOMMERCE_SERVICES_PACKAGES_EDIT_PACKAGE,
			'package': packageToEdit,
			siteId,
		} );
	} );

	it( '#dismissModal()', () => {
		expect( dismissModal( siteId ) ).to.eql( {
			type: WOOCOMMERCE_SERVICES_PACKAGES_DISMISS_MODAL,
			siteId,
		} );
	} );

	it( '#savePackage()', () => {
		const packageData = {
			name: 'Test box',
			dimensions: '10 x 13 x 6',
			is_letter: false,
		};

		const state = savePackage( siteId, packageData );

		expect( state ).to.eql( {
			type: WOOCOMMERCE_SERVICES_PACKAGES_SAVE_PACKAGE,
			packageData,
			siteId,
		} );
	} );

	it( '#updatePackagesField()', () => {
		const fieldsToUpdate = {
			name: 'Test box',
			dimensions: '10 x 13 x 6',
			is_letter: false,
		};
		expect( updatePackagesField( siteId, fieldsToUpdate ) ).to.eql( {
			type: WOOCOMMERCE_SERVICES_PACKAGES_UPDATE_PACKAGES_FIELD,
			values: fieldsToUpdate,
			siteId,
		} );
	} );

	it( '#toggleOuterDimensions()', () => {
		expect( toggleOuterDimensions( siteId ) ).to.eql( {
			type: WOOCOMMERCE_SERVICES_PACKAGES_TOGGLE_OUTER_DIMENSIONS,
			siteId,
		} );
	} );

	it( '#setModalErrors()', () => {
		expect( setModalErrors( siteId, true ) ).to.eql( {
			type: WOOCOMMERCE_SERVICES_PACKAGES_SET_MODAL_ERRORS,
			value: true,
			siteId,
		} );

		expect( setModalErrors( siteId, false ) ).to.eql( {
			type: WOOCOMMERCE_SERVICES_PACKAGES_SET_MODAL_ERRORS,
			value: false,
			siteId,
		} );

		expect( setModalErrors( siteId, { any: true } ) ).to.eql( {
			type: WOOCOMMERCE_SERVICES_PACKAGES_SET_MODAL_ERRORS,
			value: { any: true },
			siteId,
		} );
	} );

	it( '#removePackage', () => {
		expect( removePackage( siteId, 0 ) ).to.eql( {
			type: WOOCOMMERCE_SERVICES_PACKAGES_REMOVE_PACKAGE,
			index: 0,
			siteId,
		} );
	} );

	it( '#setIsSaving', () => {
		expect( setIsSaving( siteId, true ) ).to.eql( {
			type: WOOCOMMERCE_SERVICES_PACKAGES_SET_IS_SAVING,
			isSaving: true,
			siteId,
		} );
	} );
} );
