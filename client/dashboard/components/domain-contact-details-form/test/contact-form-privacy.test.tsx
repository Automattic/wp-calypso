/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import ContactFormPrivacy from '../contact-form-privacy';
import type { Domain } from '@automattic/api-core';

const domainName = 'example.com';

function renderPrivacy( domain: Partial< Domain > ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.2/domain-details/${ domainName }` )
		.reply( 200, { domain: domainName, ...domain } as Domain );

	return render(
		<ContactFormPrivacy
			domainName={ domainName }
			isSubmitting={ false }
			onTogglePrivacyProtection={ jest.fn() }
			onTogglePrivacyDisclosure={ jest.fn() }
		/>
	);
}

describe( '<ContactFormPrivacy>', () => {
	test( 'explains what stays private when privacy protection is on', async () => {
		renderPrivacy( { privacy_available: true, private_domain: true } );

		const toggle = await screen.findByRole( 'checkbox', { name: 'Privacy protection on' } );
		expect( toggle ).toBeChecked();
		expect( toggle ).toBeEnabled();
		expect( screen.getByText( /Your name, address, email and phone stay private/ ) ).toBeVisible();
	} );

	test( 'explains what is public when privacy protection is off', async () => {
		renderPrivacy( { privacy_available: true, private_domain: false } );

		const toggle = await screen.findByRole( 'checkbox', { name: 'Privacy protection off' } );
		expect( toggle ).not.toBeChecked();
		expect( screen.getByText( /Your name, address, email and phone are public/ ) ).toBeVisible();
	} );

	test( 'disables the toggle when the registry does not allow privacy protection', async () => {
		renderPrivacy( { privacy_available: false, private_domain: false } );

		const toggle = await screen.findByRole( 'checkbox', { name: 'Privacy protection off' } );
		expect( toggle ).toBeDisabled();
		expect(
			screen.getByText( /Privacy protection is not available due to the registry’s policies/ )
		).toBeVisible();
	} );
} );
