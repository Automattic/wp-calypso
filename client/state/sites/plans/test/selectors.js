/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getSitePlan,
	getPlanDiscountedRawPrice,
	getPlanRawDiscount,
	getPlansBySite,
	getPlansBySiteId,
	hasDomainCredit,
	isRequestingSitePlans
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getPlansBySite()', () => {
		it( 'should return plans by site', () => {
			const plans1 = { data: [ { currentPlan: false }, { currentPlan: false }, { currentPlan: true } ] };
			const plans2 = { data: [ { currentPlan: true }, { currentPlan: false }, { currentPlan: false } ] };
			const state = {
				sites: {
					plans: {
						2916284: plans1,
						77203074: plans2
					}
				}
			};
			const plans = getPlansBySite( state, { ID: 77203074 } );

			expect( plans ).to.eql( plans2 );
		} );
	} );
	describe( '#getPlansBySiteId()', () => {
		it( 'should return plans by site id', () => {
			const plans1 = { data: [ { currentPlan: false }, { currentPlan: false }, { currentPlan: true } ] };
			const plans2 = { data: [ { currentPlan: true }, { currentPlan: false }, { currentPlan: false } ] };
			const state = {
				sites: {
					plans: {
						2916284: plans1,
						77203074: plans2
					}
				}
			};
			const plans = getPlansBySiteId( state, 2916284 );

			expect( plans ).to.eql( plans1 );
		} );
	} );
	describe( '#getSitePlan()', () => {
		it( 'should return plans by site and plan slug', () => {
			const plans1 = {
				data: [ {
					currentPlan: false,
					productSlug: 'gold'
				}, {
					currentPlan: false,
					productSlug: 'silver'
				}, { currentPlan: true, productSlug: 'bronze' } ]
			};
			const plans2 = {
				data: [ {
					currentPlan: true,
					productSlug: 'gold'
				}, {
					currentPlan: false,
					productSlug: 'silver'
				}, { currentPlan: false, productSlug: 'bronze' } ]
			};
			const state = {
				sites: {
					plans: {
						2916284: plans1,
						77203074: plans2
					}
				}
			};
			const plan = getSitePlan( state, 77203074, 'gold' );
			expect( plan ).to.eql( { currentPlan: true, productSlug: 'gold' } );
		} );
		it( 'should return falsey when plan is not found', () => {
			const plans1 = {
				data: [ {
					currentPlan: false,
					productSlug: 'gold'
				}, {
					currentPlan: false,
					productSlug: 'silver'
				}, {
					currentPlan: true,
					productSlug: 'bronze'
				} ]
			};
			const plans2 = {
				data: [ {
					currentPlan: true,
					productSlug: 'gold'
				}, {
					currentPlan: false,
					productSlug: 'silver'
				}, {
					currentPlan: false,
					productSlug: 'bronze'
				} ]
			};
			const state = {
				sites: {
					plans: {
						2916284: plans1,
						77203074: plans2
					}
				}
			};
			const plan = getSitePlan( state, 77203074, 'circle' );
			expect( plan ).to.eql( undefined );
		} );
		it( 'should return falsey when siteId is not found', () => {
			const plans1 = {
				data: [ {
					currentPlan: false,
					productSlug: 'gold'
				}, {
					currentPlan: false,
					productSlug: 'silver'
				}, {
					currentPlan: true,
					productSlug: 'bronze'
				} ]
			};
			const state = {
				sites: {
					plans: {
						2916284: plans1
					}
				}
			};
			const plan = getSitePlan( state, 77203074, 'gold' );
			expect( plan ).to.eql( null );
		} );
	} );
	describe( '#getPlanDiscountedRawPrice()', () => {
		it( 'should return a discount price', () => {
			const plans = {
				data: [ {
					currentPlan: false,
					productSlug: 'gold',
					rawPrice: 299,
					rawDiscount: 0
				}, {
					currentPlan: false,
					productSlug: 'silver',
					rawPrice: 199,
					rawDiscount: 0
				}, {
					currentPlan: true,
					productSlug: 'bronze',
					rawPrice: 99,
					rawDiscount: 100
				} ]
			};
			const state = {
				sites: {
					plans: {
						77203074: plans
					}
				}
			};
			const discountPrice = getPlanDiscountedRawPrice( state, 77203074, 'bronze' );
			expect( discountPrice ).to.equal( 99 );
		} );
		it( 'should return a monthly discount price', () => {
			const plans = {
				data: [ {
					currentPlan: false,
					productSlug: 'gold',
					rawPrice: 299,
					rawDiscount: 0
				}, {
					currentPlan: false,
					productSlug: 'silver',
					rawPrice: 199,
					rawDiscount: 0
				}, {
					currentPlan: true,
					productSlug: 'bronze',
					rawPrice: 99,
					rawDiscount: 100
				} ]
			};
			const state = {
				sites: {
					plans: {
						77203074: plans
					}
				}
			};
			const discountPrice = getPlanDiscountedRawPrice( state, 77203074, 'bronze', true );
			expect( discountPrice ).to.equal( 8.25 );
		} );
		it( 'should return null, if no discount is available', () => {
			const plans = {
				data: [ {
					currentPlan: false,
					productSlug: 'gold',
					rawPrice: 299,
					rawDiscount: 0
				}, {
					currentPlan: false,
					productSlug: 'silver',
					rawPrice: 199,
					rawDiscount: 0
				}, {
					currentPlan: true,
					productSlug: 'bronze',
					rawPrice: 99,
					rawDiscount: 100
				} ]
			};
			const state = {
				sites: {
					plans: {
						77203074: plans
					}
				}
			};
			const discountPrice = getPlanDiscountedRawPrice( state, 77203074, 'silver', true );
			expect( discountPrice ).to.equal( null );
		} );
	} );

	describe( '#getPlanRawDiscount()', () => {
		it( 'should return a raw discount', () => {
			const plans = {
				data: [ {
					currentPlan: false,
					productSlug: 'gold',
					rawPrice: 299,
					rawDiscount: 0
				}, {
					currentPlan: false,
					productSlug: 'silver',
					rawPrice: 199,
					rawDiscount: 0
				}, {
					currentPlan: true,
					productSlug: 'bronze',
					rawPrice: 99,
					rawDiscount: 100
				} ]
			};

			const state = {
				sites: {
					plans: {
						77203074: plans
					}
				}
			};

			const planRawDiscount = getPlanRawDiscount( state, 77203074, 'bronze' );

			expect( planRawDiscount ).to.equal( 100 );
		} );

		it( 'should return a monthly raw discount', () => {
			const plans = {
				data: [ {
					currentPlan: false,
					productSlug: 'gold',
					rawPrice: 299,
					rawDiscount: 0
				}, {
					currentPlan: false,
					productSlug: 'silver',
					rawPrice: 199,
					rawDiscount: 0
				}, {
					currentPlan: true,
					productSlug: 'bronze',
					rawPrice: 99,
					rawDiscount: 100
				} ]
			};

			const state = {
				sites: {
					plans: {
						77203074: plans
					}
				}
			};

			const planRawDiscount = getPlanRawDiscount( state, 77203074, 'bronze', true );

			expect( planRawDiscount ).to.equal( 8.33 );
		} );

		it( 'should return null, if no raw discount is available', () => {
			const plans = {
				data: [ {
					currentPlan: false,
					productSlug: 'gold',
					rawPrice: 299,
					rawDiscount: 0
				}, {
					currentPlan: false,
					productSlug: 'silver',
					rawPrice: 199,
					rawDiscount: 0
				}, {
					currentPlan: true,
					productSlug: 'bronze',
					rawPrice: 99,
					rawDiscount: 100
				} ]
			};

			const state = {
				sites: {
					plans: {
						77203074: plans
					}
				}
			};

			const planRawDiscount = getPlanRawDiscount( state, 77203074, 'silver', true );

			expect( planRawDiscount ).to.equal( null );
		} );
	} );

	describe( '#hasDomainCredit()', () => {
		it( 'should return true if plan has domain credit', () => {
			const state = {
				sites: {
					plans: {
						2916284: {
							data: [ { currentPlan: false }, { currentPlan: false }, { currentPlan: true, hasDomainCredit: false } ]
						},
						77203074: {
							data: [ { currentPlan: false }, { currentPlan: true, hasDomainCredit: true }, { currentPlan: false } ]
						}

					}
				}
			};

			expect( hasDomainCredit( state, 77203074 ) ).to.equal( true );
			expect( hasDomainCredit( state, 2916284 ) ).to.equal( false );
		} );
	} );
	describe( '#isRequestingSitePlans()', () => {
		it( 'should return true if we are fetching plans', () => {
			const state = {
				sites: {
					plans: {
						2916284: {
							data: null,
							error: null,
							hasLoadedFromServer: false,
							isRequesting: true
						},
						77203074: {
							data: null,
							error: null,
							hasLoadedFromServer: false,
							isRequesting: false
						}

					}
				}
			};

			expect( isRequestingSitePlans( state, 2916284 ) ).to.equal( true );
			expect( isRequestingSitePlans( state, 77203074 ) ).to.equal( false );
			expect( isRequestingSitePlans( state, 'unknown' ) ).to.equal( false );
		} );
	} );
} );
