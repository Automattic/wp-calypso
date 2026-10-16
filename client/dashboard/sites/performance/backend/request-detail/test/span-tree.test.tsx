/**
 * @jest-environment jsdom
 */

import { setLocale } from '@automattic/number-formatters';
import { screen } from '@testing-library/react';
import { render } from '../../../../../test-utils';
import SpanTree from '../span-tree';
import type { ApmDetailSpan } from '@automattic/api-core';

const span: ApmDetailSpan = {
	id: 'root',
	parent_id: null,
	name: 'Database query',
	category: 'db',
	count: 1,
	tx_count: 1,
	self_ms: { sum: 10, max: 10 },
	total_ms: { sum: 20, max: 20 },
};

beforeEach( () => setLocale( 'en' ) );
afterEach( () => setLocale( 'en' ) );

describe( '<SpanTree>', () => {
	test.each( [
		[ 'en', 24691, 2, '12,346' ],
		[ 'de', 24691, 2, '12.346' ],
		[ 'en', 25, 4, '6.3' ],
		[ 'de', 25, 4, '6,3' ],
		[ 'en', 2, 1, '2.0' ],
		[ 'en', 1234, 0, '1,234' ],
	] )(
		'formats calls per transaction in %s for %s calls over %s transactions',
		async ( locale, count, txCount, expected ) => {
			setLocale( locale );
			render( <SpanTree spans={ [ { ...span, count, tx_count: txCount } ] } /> );

			expect( await screen.findByText( `${ expected } calls/tx` ) ).toBeVisible();
		}
	);

	test( 'formats both levels of pruned span counts', async () => {
		render(
			<SpanTree
				spans={ [
					{
						...span,
						pruned_children: { count: 1234, self_sum_ms: 5, total_sum_ms: 10 },
					},
				] }
				pruned={ { node_count: 1234567, self_sum_ms: 20 } }
			/>
		);

		expect( await screen.findByText( '+ 1,234 more child spans (10 ms total)' ) ).toBeVisible();
		expect(
			screen.getByText( '+ 1,234,567 additional spans pruned from the tree (20 ms self time)' )
		).toBeVisible();
		expect( screen.queryByText( /calls\/tx/ ) ).not.toBeInTheDocument();
	} );
} );
