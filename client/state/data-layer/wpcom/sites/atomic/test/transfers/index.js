import { mapToRequestBody } from 'state/data-layer/wpcom/sites/atomic/transfers';

describe( 'AtomicTransfers', () => {
	test( 'Should map the InitiateTransfer to request body', () => {
		const initiateTransferWithSoftwareSet = {
			softwareSet: 'woo-on-all-plans',
		};

		expect( mapToRequestBody( initiateTransferWithSoftwareSet ) ).toEqual( {
			software_set: 'woo-on-all-plans',
		} );

		const initiateTransferWithThemeSlug = {
			themeSlug: 'foo',
		};

		expect( mapToRequestBody( initiateTransferWithThemeSlug ) ).toEqual( {
			theme_slug: 'foo',
		} );
	} );
} );
