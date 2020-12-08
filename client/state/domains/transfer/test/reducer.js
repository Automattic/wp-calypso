/**
 * Internal dependencies
 */
import reducer, { items } from '../reducer';
import { DOMAIN_TRANSFER_UPDATE } from 'calypso/state/action-types';

const selectedRegistrar = {
	tag: 'UNIT-TEST-TAG',
	registrarName: 'Unit Test',
	registrarUrl: 'https://automattic.com',
};

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).toEqual( {
			items: {},
		} );
	} );

	test( 'should build a IPS tag transfer payload', () => {
		const response = items( undefined, {
			type: DOMAIN_TRANSFER_UPDATE,
			domain: 'unit-test-transfer-reducer.com',
			options: { selectedRegistrar, saveStatus: 'saving' },
		} );

		expect( response ).toMatchObject( {
			'unit-test-transfer-reducer.com': {
				selectedRegistrar,
				saveStatus: 'saving',
			},
		} );
	} );
} );
