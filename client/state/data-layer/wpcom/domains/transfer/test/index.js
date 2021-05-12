/**
 * Internal dependencies
 */
import {
	saveDomainIpsTag as doSaveDomainIpsTag,
	handleIpsTagSaveSuccess,
	handleIpsTagSaveFailure,
} from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { saveDomainIpsTag, updateDomainTransfer } from 'calypso/state/domains/transfer/actions';

const domain = 'domain-transfer-unit-test.uk';
const selectedRegistrar = {
	tag: 'UNIT-TEST-TAG',
	registrarName: 'Unit Test',
	registrarUrl: 'https://automattic.com',
};
const action = saveDomainIpsTag( domain, selectedRegistrar );

describe( 'wpcom-api', () => {
	describe( 'domain transfer ips tag save', () => {
		describe( '#ipsTagSave', () => {
			test( 'should dispatch HTTP action to transfer endpoint', () => {
				expect( doSaveDomainIpsTag( action ) ).toEqual( [
					updateDomainTransfer( domain, { saveStatus: 'saving' } ),
					http(
						{
							apiVersion: '1',
							method: 'POST',
							path: '/domains/' + domain + '/transfer/',
							body: {
								domainStatus: JSON.stringify( {
									command: 'set-ips-tag',
									payload: { ips_tag: selectedRegistrar.tag },
								} ),
							},
						},
						action
					),
				] );
			} );
		} );

		describe( '#ipsTagSaveSuccess', () => {
			test( 'should return ips success payload', () => {
				expect( handleIpsTagSaveSuccess( action ) ).toEqual(
					updateDomainTransfer( domain, {
						selectedRegistrar,
						saveStatus: 'success',
					} )
				);
			} );
		} );

		describe( '#receiveError', () => {
			test( 'should return ips failure payload', () => {
				const actions = handleIpsTagSaveFailure( action );
				expect( actions.shift() ).toEqual(
					updateDomainTransfer( domain, {
						selectedRegistrar,
						saveStatus: 'error',
					} )
				);
				expect( actions.shift() ).toMatchObject( {
					notice: { noticeId: 'ips-tag-save-failure-notice' },
				} );
			} );
		} );
	} );
} );
