/**
 * External dependencies
 */
import { expect } from 'chai';
import { cloneDeep } from 'lodash';

/**
 * Internal dependencies
 */
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
	setIsFetching,
	removePredefinedPackage,
	savePredefinedPackages,
	toggleAll,
	togglePackage,
	setAddMode,
} from '../actions';
import reducer from '../reducer';
import initialState from './data/initial-state';

const siteId = 123;

describe( 'Packages form reducer', () => {
	const expectedEndState = cloneDeep( initialState );

	afterEach( () => {
		// make sure the state hasn't been mutated
		// after each test
		// eslint-disable-next-line jest/no-standalone-expect
		expect( initialState ).to.eql( expectedEndState );
	} );

	test( 'ADD_PACKAGE preserves form data', () => {
		const existingAddState = {
			showModal: false,
			mode: 'add-custom',
			packageData: {
				name: 'Package name here',
			},
		};
		const action = addPackage( siteId );
		const state = reducer( existingAddState, action );

		expect( state ).to.eql( {
			showModal: true,
			mode: 'add-custom',
			packageData: existingAddState.packageData,
			currentlyEditingPredefinedPackages: {},
		} );
	} );

	test( "ADD_PACKAGE clears previous 'edit' data", () => {
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
			mode: 'add-custom',
			currentlyEditingPredefinedPackages: {},
			packageData: { is_user_defined: true },
		} );
	} );

	test( 'EDIT_PACKAGE', () => {
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

	test( 'DISMISS_MODAL', () => {
		const visibleModalState = {
			showModal: true,
		};
		const action = dismissModal( siteId );
		const state = reducer( visibleModalState, action );

		expect( state ).to.eql( {
			modalErrors: {},
			showModal: false,
			showOuterDimensions: false,
			currentlyEditingPredefinedPackages: null,
		} );
	} );

	test( 'UPDATE_PACKAGES_FIELD', () => {
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

	test( 'TOGGLE_OUTER_DIMENSIONS', () => {
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

	test( 'SAVE_PACKAGE adds new package', () => {
		const packageData = {
			is_user_defined: true,
			name: 'Test Box',
		};
		const initialSavePackageState = {
			showModal: true,
			mode: 'add-custom',
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

	test( 'SAVE_PACKAGE updates an exisitng package', () => {
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

	test( 'SAVE_PACKAGE', () => {
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
		expect( state.mode ).to.eql( 'add-custom' );
		expect( state.packages.custom[ 1 ] ).to.eql( {
			is_user_defined: true,
			name: 'Test Box',
		} );
		expect( state.showOuterDimensions ).to.eql( false );
		expect( state.pristine ).to.eql( false );
	} );

	test( 'SET_MODAL_ERROR', () => {
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

	test( 'REMOVE_PACKAGE', () => {
		const action = removePackage( siteId, 1 );

		const state = reducer( initialState, action );
		expect( state.packages.custom ).to.eql( [ { name: '1' }, { name: 'zBox' } ] );
		expect( state.pristine ).to.eql( false );
		expect( state.showModal ).to.eql( false );
	} );

	test( 'SET_IS_SAVING', () => {
		const action = setIsSaving( siteId, false );

		const state = reducer( initialState, action );
		expect( state.isSaving ).to.eql( false );
		expect( state.pristine ).to.eql( true );
	} );

	test( 'SET_IS_FETCHING', () => {
		const action = setIsFetching( siteId, true );

		const state = reducer( initialState, action );
		expect( state.isFetching ).to.eql( true );
	} );

	test( 'REMOVE_PREDEF', () => {
		const action = removePredefinedPackage( siteId, 'service', 'box' );

		const state = reducer( initialState, action );
		expect( state.packages.predefined ).to.eql( {
			service: [ 'box1' ],
			otherService: [ 'envelope' ],
		} );
	} );

	test( 'SAVE_PREDEF', () => {
		const state = {
			...initialState,
			showModal: true,
			pristine: true,
			currentlyEditingPredefinedPackages: { service: [ 'box', 'box1', 'box2' ], otherService: [] },
		};

		const action = savePredefinedPackages( siteId );

		const result = reducer( state, action );
		expect( result.packages.predefined ).to.eql( {
			service: [ 'box', 'box1', 'box2' ],
			otherService: [],
		} );
		expect( result.currentlyEditingPredefinedPackages ).to.eql( null );
		expect( result.pristine ).to.eql( false );
		expect( result.showModal ).to.eql( false );
	} );

	test( 'TOGGLE_ALL selects all when none was selected', () => {
		const state = {
			...initialState,
			currentlyEditingPredefinedPackages: { service: [], otherService: [] },
		};

		const action = toggleAll( siteId, 'service', 'priority', true );

		const result = reducer( state, action );
		expect( result.currentlyEditingPredefinedPackages ).to.eql( {
			service: [ 'box', 'box1', 'box2' ],
			otherService: [],
		} );
	} );

	test( 'TOGGLE_ALL selects all when some were selected', () => {
		const state = {
			...initialState,
			currentlyEditingPredefinedPackages: { service: [ 'box1' ], otherService: [] },
		};

		const action = toggleAll( siteId, 'service', 'priority', true );

		const result = reducer( state, action );
		expect( result.currentlyEditingPredefinedPackages ).to.eql( {
			service: [ 'box1', 'box', 'box2' ],
			otherService: [],
		} );
	} );

	test( 'TOGGLE_ALL deselects all when all were selected', () => {
		const state = {
			...initialState,
			currentlyEditingPredefinedPackages: { service: [ 'box', 'box1', 'box2' ], otherService: [] },
		};

		const action = toggleAll( siteId, 'service', 'priority', false );

		const result = reducer( state, action );
		expect( result.currentlyEditingPredefinedPackages ).to.eql( { service: [], otherService: [] } );
	} );

	test( 'TOGGLE_ALL deselects all when some were selected', () => {
		const state = {
			...initialState,
			currentlyEditingPredefinedPackages: { service: [ 'box1' ], otherService: [] },
		};

		const action = toggleAll( siteId, 'service', 'priority', false );

		const result = reducer( state, action );
		expect( result.currentlyEditingPredefinedPackages ).to.eql( { service: [], otherService: [] } );
	} );

	test( 'TOGGLE_PACKAGE selects a package', () => {
		const state = {
			...initialState,
			currentlyEditingPredefinedPackages: { service: [], otherService: [] },
		};
		const action = togglePackage( siteId, 'service', 'box2' );

		const result = reducer( state, action );
		expect( result.currentlyEditingPredefinedPackages ).to.eql( {
			service: [ 'box2' ],
			otherService: [],
		} );
	} );

	test( 'TOGGLE_PACKAGE deselects a package', () => {
		const state = {
			...initialState,
			currentlyEditingPredefinedPackages: { service: [ 'box' ], otherService: [] },
		};
		const action = togglePackage( siteId, 'service', 'box' );

		const result = reducer( state, action );
		expect( result.currentlyEditingPredefinedPackages ).to.eql( { service: [], otherService: [] } );
	} );

	test( 'SET_ADD_MODE', () => {
		const action = setAddMode( siteId, 'add-predefined' );

		const state = reducer( initialState, action );
		expect( state.mode ).to.eql( 'add-predefined' );
	} );
} );
