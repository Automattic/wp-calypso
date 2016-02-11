/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isExporting } from '../selectors';
import { States } from '../constants.js';

describe( 'selectors', () => {
	describe( '#isExporting()', () => {
		it( 'should return false if state is not known', () => {
			const exporting = isExporting( {
				siteSettings: {
					exporter: {
						exportingState: {}
					}
				}
			}, 100658273 );

			expect( exporting ).to.eql( false );
		} );

		it( `should return false if an export hasn't started yet`, () => {
			const exporting = isExporting( {
				siteSettings: {
					exporter: {
						exportingState: {
							100658273: States.STARTING
						}
					}
				}
			}, 100658273 );

			expect( exporting ).to.eql( false );
		} );

		it( 'should return true if an export is in progress', () => {
			const exporting = isExporting( {
				siteSettings: {
					exporter: {
						exportingState: {
							100658273: States.EXPORTING
						}
					}
				}
			}, 100658273 );

			expect( exporting ).to.eql( true );
		} );
	} );
} );
