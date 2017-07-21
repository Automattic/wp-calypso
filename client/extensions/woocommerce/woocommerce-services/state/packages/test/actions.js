/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	addPackage,
	removePackage,
	editPackage,
	dismissModal,
	setSelectedPreset,
	savePackage,
	updatePackagesField,
	toggleOuterDimensions,
	setModalErrors,
	setIsSaving,
	ADD_PACKAGE,
	REMOVE_PACKAGE,
	EDIT_PACKAGE,
	DISMISS_MODAL,
	SET_IS_SAVING,
	SET_SELECTED_PRESET,
	SAVE_PACKAGE,
	UPDATE_PACKAGES_FIELD,
	TOGGLE_OUTER_DIMENSIONS,
	SET_MODAL_ERRORS,
} from '../actions';

describe( 'Packages state actions', () => {
	it( '#addPackage()', () => {
		expect( addPackage() ).to.eql( {
			type: ADD_PACKAGE,
		} );
	} );

	it( '#editPackage()', () => {
		const packageToEdit = {
			name: 'Test box',
			dimensions: '10 x 13 x 6',
			is_letter: false,
		};
		expect( editPackage( packageToEdit ) ).to.eql( {
			type: EDIT_PACKAGE,
			'package': packageToEdit,
		} );
	} );

	it( '#dismissModal()', () => {
		expect( dismissModal() ).to.eql( {
			type: DISMISS_MODAL,
		} );
	} );

	it( '#setSelectedPreset()', () => {
		expect( setSelectedPreset( 'a' ) ).to.eql( {
			type: SET_SELECTED_PRESET,
			value: 'a',
		} );

		expect( setSelectedPreset( 'ab' ) ).to.eql( {
			type: SET_SELECTED_PRESET,
			value: 'ab',
		} );
	} );

	it( '#savePackage()', () => {
		const packageData = {
			name: 'Test box',
			dimensions: '10 x 13 x 6',
			is_letter: false,
		};

		const state = savePackage( packageData );

		expect( state ).to.eql( {
			type: SAVE_PACKAGE,
			packageData,
		} );
	} );

	it( '#updatePackagesField()', () => {
		const fieldsToUpdate = {
			name: 'Test box',
			dimensions: '10 x 13 x 6',
			is_letter: false,
		};
		expect( updatePackagesField( fieldsToUpdate ) ).to.eql( {
			type: UPDATE_PACKAGES_FIELD,
			values: fieldsToUpdate,
		} );
	} );

	it( '#toggleOuterDimensions()', () => {
		expect( toggleOuterDimensions() ).to.eql( {
			type: TOGGLE_OUTER_DIMENSIONS,
		} );
	} );

	it( '#setModalErrors()', () => {
		expect( setModalErrors( true ) ).to.eql( {
			type: SET_MODAL_ERRORS,
			value: true,
		} );

		expect( setModalErrors( false ) ).to.eql( {
			type: SET_MODAL_ERRORS,
			value: false,
		} );

		expect( setModalErrors( { any: true } ) ).to.eql( {
			type: SET_MODAL_ERRORS,
			value: { any: true },
		} );
	} );

	it( '#removePackage', () => {
		expect( removePackage( 0 ) ).to.eql( {
			type: REMOVE_PACKAGE,
			index: 0,
		} );
	} );

	it( '#setIsSaving', () => {
		expect( setIsSaving( true ) ).to.eql( {
			type: SET_IS_SAVING,
			isSaving: true,
		} );
	} );
} );
