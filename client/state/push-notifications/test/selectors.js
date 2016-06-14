/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getStatus,
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getStatus()', () => {
		it( 'should return unknown if API is not ready', () => {
			const mockState = {
				pushNotifications: {
					system: {
						apiReady: false
					}
				}
			};
			expect( getStatus( mockState ) ).to.eql( 'unknown' );
		} );

		it( 'should return denied if blocked & API is ready', () => {
			const mockState = {
				pushNotifications: {
					system: {
						apiReady: true,
						blocked: true,
					}
				}
			};
			expect( getStatus( mockState ) ).to.eql( 'denied' );
		} );

		it( 'should return subscribed if enabled and wpcomSubscription.ID is truthy', () => {
			const mockState = {
				pushNotifications: {
					settings: {
						enabled: true,
					},
					system: {
						apiReady: true,
						blocked: false,
						wpcomSubscription: {
							ID: 42
						},
					}
				}
			};
			expect( getStatus( mockState ) ).to.eql( 'subscribed' );
		} );
	} );
} );
