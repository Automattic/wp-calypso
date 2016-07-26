/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import TermQueryManager from 'lib/query-manager/term';
import {
	getEditorTermAdded
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getEditorTermAdded()', () => {
		it( 'should return null if no term added has been set', () => {
			const term = getEditorTermAdded( {
				ui: {
					editor: {
						terms: {
							added: null
						}
					}
				}
			}, 2916284, '', 'category' );

			expect( term ).to.be.null;
		} );

		it( 'should return last term added object', () => {
			const term = getEditorTermAdded( {
				terms: {
					queries: {
						2916284: {
							category: new TermQueryManager( {
								items: {
									111: {
										ID: 111,
										name: 'Sounds Chewy'
									}
								},
								queries: {}
							} )
						}
					}
				},
				ui: {
					editor: {
						terms: {
							added: {
								2916284: {
									'': {
										category: 111
									}
								}
							}
						}
					}
				}
			}, 2916284, '', 'category' );

			expect( term ).to.eql( {
				ID: 111,
				name: 'Sounds Chewy'
			} );
		} );
	} );
} );
