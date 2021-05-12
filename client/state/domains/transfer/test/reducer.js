/**
 * Internal dependencies
 */
import reducer, { items } from '../reducer';
import {
	acceptDomainTransfer,
	acceptDomainTransferCompleted,
	cancelDomainTransferRequest,
	cancelDomainTransferRequestCompleted,
	cancelDomainTransferRequestFailed,
	declineDomainTransferCompleted,
	fetchWapiDomainInfo,
	fetchWapiDomainInfoFailure,
	fetchWapiDomainInfoSuccess,
	requestDomainTransferCode,
	requestDomainTransferCodeCompleted,
	requestDomainTransferCodeFailed,
	updateDomainTransfer,
} from '../actions';
import { createDomainObject } from '../assembler';

const selectedRegistrar = {
	tag: 'UNIT-TEST-TAG',
	registrarName: 'Unit Test',
	registrarUrl: 'https://automattic.com',
};
const testDomain = 'unit-test-transfer-reducer.com';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).toEqual( {
			items: {},
		} );
	} );

	test( 'should build a IPS tag transfer payload', () => {
		const options = { selectedRegistrar, saveStatus: 'saving' };
		const response = items( undefined, updateDomainTransfer( testDomain, options ) );

		expect( response ).toMatchObject( {
			[ testDomain ]: options,
		} );
	} );

	test( 'should mark requesting transfer code as true when requesting a transfer code', () => {
		const state = items( undefined, requestDomainTransferCode( testDomain, {} ) );

		expect( state[ testDomain ].isRequestingTransferCode ).toBe( true );
	} );

	test( 'should mark requesting transfer code as false when requesting a transfer code succeeded', () => {
		const initialState = {
			[ testDomain ]: {
				isRequestingTransferCode: true,
				data: {},
			},
		};
		const state = items( initialState, requestDomainTransferCodeCompleted( testDomain, {} ) );

		expect( state[ testDomain ].isRequestingTransferCode ).toBe( false );
	} );

	test( 'should mark requesting transfer code as false when requesting a transfer code failed', () => {
		const initialState = {
			[ testDomain ]: {
				isRequestingTransferCode: true,
			},
		};
		const state = items( initialState, requestDomainTransferCodeFailed( testDomain ) );

		expect( state[ testDomain ].isRequestingTransferCode ).toBe( false );
	} );

	test( 'should set needsUpdate to true when requesting a transfer code succeeded', () => {
		const initialState = {
			[ testDomain ]: {
				data: {},
			},
		};
		const state = items( initialState, requestDomainTransferCodeCompleted( testDomain, {} ) );

		expect( state[ testDomain ].needsUpdate ).toBe( true );
	} );

	test( 'should update locked state when requesting a transfer code succeeded and unlock requested', () => {
		const initialState = {
			[ testDomain ]: {
				data: {
					locked: true,
				},
			},
		};
		const state = items(
			initialState,
			requestDomainTransferCodeCompleted( testDomain, { unlock: true } )
		);

		expect( state[ testDomain ].data.locked ).toBe( false );
	} );

	test( 'should mark canceling transfer as true when canceling a transfer', () => {
		const state = items( undefined, cancelDomainTransferRequest( testDomain, {} ) );

		expect( state[ testDomain ].isCancelingTransfer ).toBe( true );
	} );

	test( 'should mark canceling transfer as true when canceling a transfer succeeded', () => {
		const initialState = {
			[ testDomain ]: {
				isCancelingTransfer: true,
				data: {},
			},
		};
		const state = items( initialState, cancelDomainTransferRequestCompleted( testDomain, {} ) );

		expect( state[ testDomain ].isCancelingTransfer ).toBe( false );
	} );

	test( 'should mark canceling transfer as false when canceling a transfer failed', () => {
		const initialState = {
			[ testDomain ]: {
				isCancelingTransfer: true,
			},
		};
		const state = items( initialState, cancelDomainTransferRequestFailed( testDomain ) );

		expect( state[ testDomain ].isCancelingTransfer ).toBe( false );
	} );

	test( 'should update locked and pendingTransfer state when canceling a transfer succeeded', () => {
		const initialState = {
			[ testDomain ]: {
				data: {
					locked: true,
				},
			},
		};
		const state = items(
			initialState,
			cancelDomainTransferRequestCompleted( testDomain, { locked: false } )
		);

		expect( state[ testDomain ].data.locked ).toBe( false );
		expect( state[ testDomain ].data.pendingTransfer ).toBe( false );
	} );

	test( 'should mark accepting transfer as true when accepting a transfer', () => {
		const state = items( undefined, acceptDomainTransfer( testDomain ) );

		expect( state[ testDomain ].isAcceptingTransfer ).toBe( true );
	} );

	test( 'should mark accepting transfer as false when accepting a transfer succeeded', () => {
		const initialState = {
			[ testDomain ]: {
				isAcceptingTransfer: true,
			},
		};
		const state = items( initialState, acceptDomainTransferCompleted( testDomain ) );

		expect( state[ testDomain ].isAcceptingTransfer ).toBe( false );
	} );

	test( 'should mark pending transfer as false when accepting a transfer succeeded', () => {
		const initialState = {
			[ testDomain ]: {
				isAcceptingTransfer: true,
			},
		};
		const state = items( initialState, acceptDomainTransferCompleted( testDomain ) );

		expect( state[ testDomain ].data.pendingTransfer ).toBe( false );
	} );

	test( 'should mark pending transfer as false when declining a transfer succeeded', () => {
		const initialState = {
			[ testDomain ]: {},
		};
		const state = items( initialState, declineDomainTransferCompleted( testDomain ) );

		expect( state[ testDomain ].data.pendingTransfer ).toBe( false );
	} );

	test( 'should set needsUpdate to false when requesting domain information', () => {
		const state = items( {}, fetchWapiDomainInfo( testDomain ) );

		expect( state[ testDomain ].needsUpdate ).toBe( false );
	} );

	test( 'should set needsUpdate to false when domain information request failed', () => {
		const state = items( {}, fetchWapiDomainInfoFailure( testDomain ) );

		expect( state[ testDomain ].needsUpdate ).toBe( false );
	} );

	test( 'should disable needsUpdate, enable hasLoadedFromServer and set domain status when domain info request succeeded', () => {
		const status = {
			locked: false,
			pending_transfer: false,
			transfer_prohibited: false,
		};
		const state = items( {}, fetchWapiDomainInfoSuccess( testDomain, status ) );

		expect( state[ testDomain ].hasLoadedFromServer ).toBe( true );
		expect( state[ testDomain ].data ).toEqual( createDomainObject( status ) );
		expect( state[ testDomain ].needsUpdate ).toBe( false );
	} );
} );
