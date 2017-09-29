/**
 * External dependencies
 */
import { expect } from 'chai';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import setPreferences from '../index';

describe( 'HELP_CONTACT_FORM_SITE_SELECT action', () => {
	it( 'should send the locale and groups through the connection and send a preferences signal', () => {
		const state = {
			extensions: {
				happychat: {
					connectionStatus: 'connected'
				}
			},
			currentUser: {
				locale: 'en',
				capabilities: {}
			},
			sites: {
				items: {
					1: { ID: 1 }
				}
			}
		};
		const getState = () => state;
		const connection = {
			setPreferences: stub(),
		};
		setPreferences( connection )( { getState }, { siteId: 1 } );
		expect( connection.setPreferences ).to.have.been.called;
	} );

	it( 'should not send the locale and groups if there is no happychat connection', () => {
		const state = {
			currentUser: {
				locale: 'en',
				capabilities: {}
			},
			sites: {
				items: {
					1: { ID: 1 }
				}
			}
		};
		const getState = () => state;
		const connection = {
			setPreferences: stub(),
		};
		setPreferences( connection )( { getState }, { siteId: 1 } );
		expect( connection.setPreferences ).to.have.not.been.called;
	} );
} );
