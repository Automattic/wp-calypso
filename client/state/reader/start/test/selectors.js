/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getRecommendations,
	hasGraduatedRecommendations,
	isRequestingRecommendations,
	isRequestingGraduation
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingRecommendations()', () => {
		it( 'should return false if not fetching', () => {
			const isRequesting = isRequestingRecommendations( {
				reader: {
					start: {
						isRequestingRecommendations: false
					}
				}
			} );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if fetching', () => {
			const isRequesting = isRequestingRecommendations( {
				reader: {
					start: {
						isRequestingRecommendations: true
					}
				}
			} );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#isRequestingGraduation()', () => {
		it( 'should return false if not fetching', () => {
			const isRequesting = isRequestingGraduation( {
				reader: {
					start: {
						isRequestingGraduation: false
					}
				}
			} );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if fetching', () => {
			const isRequesting = isRequestingGraduation( {
				reader: {
					start: {
						isRequestingGraduation: true
					}
				}
			} );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getRecommendations()', () => {
		it( 'should return an empty object if there are no recommendations', () => {
			const recs = getRecommendations( {
				reader: {
					start: {
						items: {}
					}
				}
			} );

			expect( recs ).to.eql( {} );
		} );

		it( 'should return a map of blog id / post id pairs', () => {
			expect( getRecommendations( {
				reader: {
					start: {
						items: {
							1: {
								site_ID: 1,
								post_ID: 1
							},
							2: {
								site_ID: 2
							}
						}
					}
				}
			} ) ).to.deep.equal( {
				1: {
					site_ID: 1,
					post_ID: 1
				},
				2: {
					site_ID: 2
				}
			} );
		} );
	} );

	describe( '#hasGraduatedRecommendations()', () => {
		it( 'should return true if graduated through API endpoint', () => {
			const hasGraduated = hasGraduatedRecommendations( {
				reader: {
					start: {
						hasGraduated: false
					}
				}
			} );

			expect( hasGraduated ).to.be.false;
		} );

		it( 'should return true if graduated through current_user', () => {
			const hasGraduated = hasGraduatedRecommendations( {
				reader: {
					start: {
						hasGraduated: null
					}
				},
				currentUser: {
					id: '14782056'
				},
				users: {
					items: {
						'14782056': {
							is_new_reader: null
						}
					}
				}
			} );

			expect( hasGraduated ).to.be.true;
		} );

		it( 'should return false if user has `is_new_reader`', () => {
			const hasGraduated = hasGraduatedRecommendations( {
				reader: {
					start: {
						hasGraduated: null
					}
				},
				currentUser: {
					id: '14782056'
				},
				users: {
					items: {
						'14782056': {
							is_new_reader: true
						}
					}
				}
			} );

			expect( hasGraduated ).to.be.false;
		} );
	} );
} );
