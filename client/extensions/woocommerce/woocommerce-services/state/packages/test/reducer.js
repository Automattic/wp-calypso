/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	addPackage,
	removePackage,
	editPackage,
	dismissModal,
	setSelectedPreset,
	updatePackagesField,
	toggleOuterDimensions,
	savePackage,
	setModalErrors,
	setIsSaving,
} from '../actions';

const siteId = 123;

const initialState = {
	showModal: false,
	packageData: null,
	packages: { custom: [ 1, 2, 3 ] },
	pristine: true,
	isSaving: false,
};

describe( 'Packages form reducer', () => {
	afterEach( () => {
		// make sure the state hasn't been mutated
		// after each test
		expect( initialState ).to.eql( {
			showModal: false,
			packageData: null,
			packages: { custom: [ 1, 2, 3 ] },
			pristine: true,
			isSaving: false,
		} );
	} );

	it( 'ADD_PACKAGE preserves form data', () => {
		const existingAddState = {
			showModal: false,
			mode: 'add',
			packageData: {
				name: 'Package name here',
			},
		};
		const action = addPackage( siteId );
		const state = reducer( existingAddState, action );

		expect( state ).to.eql( {
			showModal: true,
			mode: 'add',
			packageData: existingAddState.packageData,
		} );
	} );

	it( "ADD_PACKAGE clears previous 'edit' data", () => {
		const existingEditState = {
			showModal: false,
			mode: 'edit',
			packageData: {
				index: 1,
				name: 'Package name here',
			},
		};
		const action = addPackage( siteId );
		const state = reducer( existingEditState, action );

		expect( state ).to.eql( {
			showModal: true,
			mode: 'add',
			packageData: { is_user_defined: true },
		} );
	} );

	it( 'EDIT_PACKAGE', () => {
		const packageData = {
			index: 1,
			name: 'Test Box',
		};
		const initialStateVisibleOuterDimensions = Object.assign( {}, initialState, {
			showOuterDimensions: true,
		} );
		const action = editPackage( siteId, packageData );
		const state = reducer( initialStateVisibleOuterDimensions, action );

		expect( state.packageData ).to.eql( {
			index: 1,
			name: 'Test Box',
		} );
		expect( state.showModal ).to.eql( true );
		expect( state.modalReadOnly ).to.eql( false );
		expect( state.mode ).to.eql( 'edit' );
		expect( state.showOuterDimensions ).to.eql( false );
		expect( state.pristine ).to.eql( true );
	} );

	it( 'DISMISS_MODAL', () => {
		const visibleModalState = {
			showModal: true,
		};
		const action = dismissModal( siteId );
		const state = reducer( visibleModalState, action );

		expect( state ).to.eql( {
			modalErrors: {},
			showModal: false,
			showOuterDimensions: false,
		} );
	} );

	it( 'SET_SELECTED_PRESET', () => {
		let state = {};

		state = reducer( state, setSelectedPreset( siteId, 'a' ) );
		expect( state ).to.eql( {
			selectedPreset: 'a',
		} );

		state = reducer( state, setSelectedPreset( siteId, 'aaa' ) );
		expect( state ).to.eql( {
			selectedPreset: 'aaa',
		} );

		state = reducer( state, setSelectedPreset( siteId, '1112' ) );
		expect( state ).to.eql( {
			selectedPreset: '1112',
		} );
	} );

	it( 'UPDATE_PACKAGES_FIELD', () => {
		const packageData = {
			name: 'Test Box',
			is_letter: false,
			index: 1,
		};
		const action = updatePackagesField( siteId, {
			name: 'Box Test',
			max_weight: '300',
			index: null,
		} );
		const state = reducer( { packageData }, action );

		expect( state ).to.eql( {
			packageData: {
				name: 'Box Test',
				max_weight: '300',
				is_letter: false,
			},
			pristine: false,
		} );
	} );

	it( 'TOGGLE_OUTER_DIMENSIONS', () => {
		const visibleModalState = {
			showModal: true,
		};
		const action = toggleOuterDimensions( siteId );
		const state = reducer( visibleModalState, action );

		expect( state ).to.eql( {
			showModal: true,
			showOuterDimensions: true,
		} );
	} );

	it( 'SAVE_PACKAGE adds new package', () => {
		const packageData = {
			is_user_defined: true,
			name: 'Test Box',
		};
		const initialSavePackageState = {
			showModal: true,
			mode: 'add',
			packageData,
			showOuterDimensions: false,
			packages: { custom: [ 1, 2, 3 ] },
		};
		const action = savePackage( siteId, packageData );
		const state = reducer( initialSavePackageState, action );

		expect( state.packages.custom[ 3 ] ).to.eql( {
			is_user_defined: true,
			name: 'Test Box',
		} );
	} );

	it( 'SAVE_PACKAGE updates an exisitng package', () => {
		const packageData = {
			is_user_defined: true,
			index: 1,
			name: 'Test Box',
		};
		const initialSavePackageState = {
			showModal: true,
			mode: 'edit',
			packageData,
			showOuterDimensions: false,
			packages: { custom: [ 1, 2, 3 ] },
		};
		const action = savePackage( siteId, packageData );
		const state = reducer( initialSavePackageState, action );

		expect( state.packages.custom[ 1 ] ).to.eql( {
			is_user_defined: true,
			name: 'Test Box',
		} );
	} );

	it( 'SAVE_PACKAGE', () => {
		const packageData = {
			is_user_defined: true,
			index: 1,
			name: 'Test Box',
		};
		const initialSavePackageState = {
			showModal: true,
			mode: 'edit',
			packageData,
			showOuterDimensions: false,
			packages: { custom: [ 1, 2, 3 ] },
		};
		const action = savePackage( siteId, packageData );
		const state = reducer( initialSavePackageState, action );

		expect( state.showModal ).to.eql( false );
		expect( state.packageData ).to.eql( {
			is_user_defined: true,
		} );
		expect( state.mode ).to.eql( 'add' );
		expect( state.packages.custom[ 1 ] ).to.eql( {
			is_user_defined: true,
			name: 'Test Box',
		} );
		expect( state.showOuterDimensions ).to.eql( false );
		expect( state.selectedPreset ).to.eql( null );
		expect( state.pristine ).to.eql( false );
	} );

	it( 'SET_MODAL_ERROR', () => {
		const initialSavePackageState = {
			showModal: true,
			mode: 'edit',
			showOuterDimensions: false,
		};
		const action = setModalErrors( siteId, true );

		const state = reducer( initialSavePackageState, action );
		expect( state ).to.eql( {
			showModal: true,
			mode: 'edit',
			showOuterDimensions: false,
			modalErrors: true,
		} );

		const newState = reducer( initialSavePackageState, setModalErrors( siteId, { any: true } ) );
		expect( newState ).to.eql( {
			showModal: true,
			mode: 'edit',
			showOuterDimensions: false,
			modalErrors: { any: true },
		} );
	} );

	it( 'REMOVE_PACKAGE', () => {
		const action = removePackage( siteId, 1 );

		const state = reducer( initialState, action );
		expect( state.packages.custom ).to.eql( [ 1, 3 ] );
		expect( state.pristine ).to.eql( false );
		expect( state.showModal ).to.eql( false );
	} );

	it( 'SET_IS_SAVING', () => {
		const action = setIsSaving( siteId, false );

		const state = reducer( initialState, action );
		expect( state.isSaving ).to.eql( false );
		expect( state.pristine ).to.eql( true );
	} );
} );
