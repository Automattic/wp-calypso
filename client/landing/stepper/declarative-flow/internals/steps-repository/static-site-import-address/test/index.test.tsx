/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import StaticSiteImportAddress from '..';
import { mockStepProps, renderStep } from '../../test/helpers';

describe( 'StaticSiteImportAddress', () => {
	beforeAll( () => nock.disableNetConnect() );

	it( 'requests the free address it shows', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( '/rest/v1.1/domains/suggestions' )
			.query( true )
			.reply( 200, [
				{ domain_name: 'busybearscleaning.wordpress.com', cost: 'Free', is_free: true },
			] );
		const submit = jest.fn();

		renderStep(
			<StaticSiteImportAddress
				{ ...mockStepProps( { navigation: { submit }, stepName: 'static-site-import-address' } ) }
			/>,
			{ initialEntry: '/static-site-import-address?from=busybearscleaning.com' }
		);

		await userEvent.click(
			await screen.findByRole( 'button', { name: /Use busybearscleaning\.wordpress\.com/ } )
		);

		expect( submit ).toHaveBeenCalledWith( {
			domainChoice: 'free',
			siteUrl: 'busybearscleaning.wordpress.com',
		} );
	} );
} );
