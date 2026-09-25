/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../../../test-utils';
import { CrmDownloadsContent } from '../index';

// The CRM server is not WordPress.com and is called with `fetch`, which nock does
// not intercept and this test environment does not define, so it is mocked here.
const originalFetch = global.fetch;

function mockExtensions( extensions: object[] ) {
	const fetchMock = jest.fn().mockResolvedValue( {
		ok: true,
		status: 200,
		json: async () => ( { success: true, extensions } ),
	} );
	global.fetch = fetchMock;
	return fetchMock;
}

afterEach( () => {
	global.fetch = originalFetch;
} );

describe( '<CrmDownloadsContent>', () => {
	test( 'explains that only CRM license keys are supported', () => {
		const fetchSpy = mockExtensions( [] );

		render( <CrmDownloadsContent licenseKey="jetpack-backup-t1_abc" /> );

		expect( screen.getByRole( 'heading', { name: 'Invalid license key' } ) ).toBeVisible();
		expect( screen.queryByRole( 'textbox', { name: 'License key' } ) ).not.toBeInTheDocument();
		expect( fetchSpy ).not.toHaveBeenCalled();
	} );

	test( 'offers a retry when the server returns no extensions', async () => {
		mockExtensions( [] );

		render( <CrmDownloadsContent licenseKey="jetpack-complete_abc" /> );

		expect( await screen.findByRole( 'button', { name: 'Try again' } ) ).toBeVisible();
		expect(
			screen.getByText(
				'Could not connect to download server. Please check your connection and try again.'
			)
		).toBeVisible();
	} );

	test( 'lists each extension with its documentation and a download button', async () => {
		mockExtensions( [
			{
				name: 'Automations',
				slug: 'automations',
				version: '1.5.9',
				kbUrl: 'https://kb.jetpackcrm.com/article-categories/automations/',
				description: '',
			},
		] );

		render( <CrmDownloadsContent licenseKey="jetpack-crm_abc" /> );

		expect( await screen.findByRole( 'button', { name: 'Download' } ) ).toBeVisible();
		expect( screen.getByRole( 'textbox', { name: 'License key' } ) ).toHaveValue(
			'jetpack-crm_abc'
		);
		expect( screen.getByText( 'Automations' ) ).toBeVisible();
		expect(
			screen.getByText(
				'Save yourself time by automating actions when new contacts are added to your CRM.'
			)
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Documentation/ } ) ).toHaveAttribute(
			'href',
			'https://kb.jetpackcrm.com/article-categories/automations/'
		);
	} );
} );
