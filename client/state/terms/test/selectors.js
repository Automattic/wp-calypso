/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getTerms,
	getTermsForQuery,
	isRequestingTermsForQuery
} from '../selectors';

describe( 'selectors', () => {
	describe( 'isRequestingTermsForQuery()', () => {
		it( 'should return false if no request exists', () => {
			const requesting = isRequestingTermsForQuery( {
				terms: {
					queryRequests: {}
				}
			}, 2916284, 'categories', {} );

			expect( requesting ).to.be.false;
		} );

		it( 'should return false if query is not requesting', () => {
			const requesting = isRequestingTermsForQuery( {
				terms: {
					queryRequests: {
						2916284: {
							categories: {
								'{"search":"ribs"}': false
							}
						}
					}
				}
			}, 2916284, 'categories', { search: 'ribs' } );

			expect( requesting ).to.be.false;
		} );

		it( 'should return true if query is in progress', () => {
			const requesting = isRequestingTermsForQuery( {
				terms: {
					queryRequests: {
						2916284: {
							categories: {
								'{"search":"ribs"}': true
							}
						}
					}
				}
			}, 2916284, 'categories', { search: 'ribs' } );

			expect( requesting ).to.be.true;
		} );
	} );

	describe( 'getTermsForQuery()', () => {
		it( 'should return null if no matching query results exist', () => {
			const terms = getTermsForQuery( {
				terms: {
					queries: {}
				}
			}, 2916284, 'categories', {} );

			expect( terms ).to.be.null;
		} );

		it( 'should return an empty array if no matches exist', () => {
			const terms = getTermsForQuery( {
				terms: {
					queries: {
						2916284: {
							categories: {
								'{"search":"ribs"}': []
							}
						}
					},
					items: {
						2916284: {
							categories: {
								111: {
									ID: 111,
									name: 'Chicken and a biscuit'
								},
								112: {
									ID: 112,
									name: 'Ribs'
								}
							}
						}
					}
				}
			}, 2916284, 'categories', { search: 'ribs' } );

			expect( terms ).to.eql( [] );
		} );

		it( 'should return matching terms', () => {
			const terms = getTermsForQuery( {
				terms: {
					queries: {
						2916284: {
							categories: {
								'{"search":"ribs"}': [ 111 ]
							}
						}
					},
					items: {
						2916284: {
							categories: {
								111: {
									ID: 111,
									name: 'Chicken and a biscuit'
								},
								112: {
									ID: 112,
									name: 'Ribs'
								}
							}
						}
					}
				}
			}, 2916284, 'categories', { search: 'ribs' } );

			expect( terms ).to.eql( [
				{
					ID: 111,
					name: 'Chicken and a biscuit'
				}
			] );
		} );
	} );

	describe( 'getTerms()', () => {
		it( 'should return null if no site exists', () => {
			const terms = getTerms( {}, 2916284, 'jetpack-portfolio' );

			expect( terms ).to.be.null;
		} );

		it( 'should return null if no taxonomies exist for site', () => {
			const terms = getTerms( {
				terms: {
					items: {
						2916284: {
							'jetpack-portfolio': {
								111: {
									ID: 111,
									name: 'Chicken and a biscuit'
								}
							}
						}
					}
				}
			}, 2916284, 'jetpack-testimonials' );

			expect( terms ).to.be.null;
		} );

		it( 'should return array of matching terms for site taxonomy combo', () => {
			const terms = getTerms( {
				terms: {
					items: {
						2916284: {
							'jetpack-portfolio': {
								111: {
									ID: 111,
									name: 'Chicken and a biscuit'
								},
								112: {
									ID: 112,
									name: 'Ribs'
								}
							}
						}
					}
				}
			}, 2916284, 'jetpack-portfolio' );

			expect( terms ).to.eql( [
				{
					ID: 111,
					name: 'Chicken and a biscuit'
				}, {
					ID: 112,
					name: 'Ribs'
				}
			] );
		} );
	} );
} );
