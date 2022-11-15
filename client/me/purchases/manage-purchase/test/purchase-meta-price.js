/**
 * @jest-environment jsdom
 */

/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/valid-title */

import { render, screen } from '@testing-library/react';
import PurchaseMetaPrice from '../purchase-meta';

describe( 'PurchaseMetaPrice', () => {
	it( 'does render "Free with Plan"', () => {
		const purchase = {
			expiryStatus: 'included',
			productSlug: 'wp_titan_mail_monthly',
			productDisplayPrice: '<abbr title="United States Dollars">$</abbr>3.50',
		};
		render(
			<PurchaseMetaPrice
				purchase={ purchase }
				hasLoadedPurchasesFromServer={ false }
				purchaseId={ false }
				siteSlug="test"
			/>
		);
		expect( screen.getByText( /Free with Plan/ ) ).toBeInTheDocument();
	} );
} );
