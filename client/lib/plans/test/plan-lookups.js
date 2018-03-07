/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	GROUP_JETPACK,
	GROUP_WPCOM,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
	TYPE_BUSINESS,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
} from '../constants';
import { getPlan, __internal__planMatches } from '../index';

describe( '__internal__planMatches', () => {
	test( 'should return true for queries matching plans', () => {
		[
			[
				PLAN_FREE,
				[
					{ group: GROUP_WPCOM },
					{ type: TYPE_FREE },
					{ term: TERM_ANNUALLY },
					{ group: GROUP_WPCOM, type: TYPE_FREE },
					{ group: GROUP_WPCOM, term: TERM_ANNUALLY },
					{ term: TERM_ANNUALLY, type: TYPE_FREE },
					{ group: GROUP_WPCOM, term: TERM_ANNUALLY, type: TYPE_FREE },
				],
				PLAN_BUSINESS,
				[
					{ group: GROUP_WPCOM },
					{ type: TYPE_BUSINESS },
					{ term: TERM_ANNUALLY },
					{ group: GROUP_WPCOM, type: TYPE_BUSINESS },
					{ group: GROUP_WPCOM, term: TERM_ANNUALLY },
					{ term: TERM_ANNUALLY, type: TYPE_BUSINESS },
					{ group: GROUP_WPCOM, term: TERM_ANNUALLY, type: TYPE_BUSINESS },
				],
				PLAN_BUSINESS_2_YEARS,
				[
					{ group: GROUP_WPCOM },
					{ type: TYPE_BUSINESS },
					{ term: TERM_BIENNIALLY },
					{ group: GROUP_WPCOM, type: TYPE_BUSINESS },
					{ group: GROUP_WPCOM, term: TERM_BIENNIALLY },
					{ term: TERM_BIENNIALLY, type: TYPE_BUSINESS },
					{ group: GROUP_WPCOM, term: TERM_BIENNIALLY, type: TYPE_BUSINESS },
				],
				PLAN_PREMIUM,
				[
					{ group: GROUP_WPCOM },
					{ type: TYPE_PREMIUM },
					{ term: TERM_ANNUALLY },
					{ group: GROUP_WPCOM, type: TYPE_PREMIUM },
					{ group: GROUP_WPCOM, term: TERM_ANNUALLY },
					{ term: TERM_ANNUALLY, type: TYPE_PREMIUM },
					{ group: GROUP_WPCOM, term: TERM_ANNUALLY, type: TYPE_PREMIUM },
				],
				PLAN_PREMIUM_2_YEARS,
				[
					{ group: GROUP_WPCOM },
					{ type: TYPE_PREMIUM },
					{ term: TERM_BIENNIALLY },
					{ group: GROUP_WPCOM, type: TYPE_PREMIUM },
					{ group: GROUP_WPCOM, term: TERM_BIENNIALLY },
					{ term: TERM_BIENNIALLY, type: TYPE_PREMIUM },
					{ group: GROUP_WPCOM, term: TERM_BIENNIALLY, type: TYPE_PREMIUM },
				],
				PLAN_PERSONAL,
				[
					{ group: GROUP_WPCOM },
					{ type: TYPE_PERSONAL },
					{ term: TERM_ANNUALLY },
					{ group: GROUP_WPCOM, type: TYPE_PERSONAL },
					{ group: GROUP_WPCOM, term: TERM_ANNUALLY },
					{ term: TERM_ANNUALLY, type: TYPE_PERSONAL },
					{ group: GROUP_WPCOM, term: TERM_ANNUALLY, type: TYPE_PERSONAL },
				],
				PLAN_PERSONAL_2_YEARS,
				[
					{ group: GROUP_WPCOM },
					{ type: TYPE_PERSONAL },
					{ term: TERM_BIENNIALLY },
					{ group: GROUP_WPCOM, type: TYPE_PERSONAL },
					{ group: GROUP_WPCOM, term: TERM_BIENNIALLY },
					{ term: TERM_BIENNIALLY, type: TYPE_PERSONAL },
					{ group: GROUP_WPCOM, term: TERM_BIENNIALLY, type: TYPE_PERSONAL },
				],
			],
		].forEach( ( [ plan, queries ] ) =>
			queries.forEach( query => {
				const result = __internal__planMatches( getPlan( plan ), query );
				expect( result ).to.be.true;
			} )
		);
	} );

	test( 'should return false for queries not matching plans', () => {
		[
			[
				PLAN_FREE,
				[
					{ group: GROUP_JETPACK },
					{ type: TYPE_PERSONAL },
					{ type: TYPE_PREMIUM },
					{ term: TERM_MONTHLY },
					{ term: TERM_BIENNIALLY },
				],
				PLAN_BUSINESS,
				[
					{ group: GROUP_JETPACK },
					{ type: TYPE_PERSONAL },
					{ type: TYPE_PREMIUM },
					{ term: TERM_MONTHLY },
					{ term: TERM_BIENNIALLY },
				],
				PLAN_BUSINESS_2_YEARS,
				[
					{ group: GROUP_JETPACK },
					{ type: TYPE_PERSONAL },
					{ type: TYPE_PREMIUM },
					{ term: TERM_ANNUALLY },
					{ term: TERM_MONTHLY },
				],
				PLAN_PREMIUM,
				[
					{ group: GROUP_JETPACK },
					{ type: TYPE_PERSONAL },
					{ type: TYPE_BUSINESS },
					{ term: TERM_MONTHLY },
					{ term: TERM_BIENNIALLY },
				],
				PLAN_PREMIUM_2_YEARS,
				[
					{ group: GROUP_JETPACK },
					{ type: TYPE_PERSONAL },
					{ type: TYPE_BUSINESS },
					{ term: TERM_ANNUALLY },
					{ term: TERM_MONTHLY },
				],
				PLAN_PERSONAL,
				[
					{ group: GROUP_JETPACK },
					{ type: TYPE_PREMIUM },
					{ type: TYPE_BUSINESS },
					{ term: TERM_MONTHLY },
					{ term: TERM_BIENNIALLY },
				],
				PLAN_PERSONAL_2_YEARS,
				[
					{ group: GROUP_JETPACK },
					{ type: TYPE_PREMIUM },
					{ type: TYPE_BUSINESS },
					{ term: TERM_ANNUALLY },
					{ term: TERM_MONTHLY },
				],
			],
		].forEach( ( [ plan, queries ] ) =>
			queries.forEach( query => {
				const result = __internal__planMatches( getPlan( plan ), query );
				expect( result ).to.be.false;
			} )
		);
	} );
} );
