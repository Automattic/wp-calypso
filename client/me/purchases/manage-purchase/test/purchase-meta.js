/**
 * @jest-environment jsdom
 */

/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/valid-title */

import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import PurchaseMeta from '../purchase-meta';

describe( 'PurchaseMetaPrice', () => {
	const store = createReduxStore();
	it( 'does render "Free with Plan"', () => {
		const purchase = {
			expiryStatus: 'included',
			productSlug: 'wp_titan_mail_monthly',
			productDisplayPrice: '<abbr title="United States Dollars">$</abbr>3.50',
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseMeta
					purchase={ purchase }
					hasLoadedPurchasesFromServer={ false }
					purchaseId={ false }
					siteSlug="test"
				/>
			</ReduxProvider>
		);
		expect( screen.getByText( /Free with Plan/ ) ).toBeInTheDocument();
	} );
} );
