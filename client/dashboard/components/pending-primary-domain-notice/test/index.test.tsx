/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import PendingPrimaryDomainNotice from '../index';

describe( '<PendingPrimaryDomainNotice>', () => {
	test( 'renders the notice with the domain name', () => {
		render( <PendingPrimaryDomainNotice domainName="example.com" /> );

		expect( screen.getByText( 'Setting up your custom domain' ) ).toBeVisible();
		expect( screen.getByText( /example\.com/ ) ).toBeVisible();
		expect( screen.getByText( /primary address/ ) ).toBeVisible();
	} );

	test( 'calls onClose when dismiss button is clicked', async () => {
		const onClose = jest.fn();
		render( <PendingPrimaryDomainNotice domainName="example.com" onClose={ onClose } /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );
		expect( onClose ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'does not render dismiss button when onClose is not provided', () => {
		render( <PendingPrimaryDomainNotice domainName="example.com" /> );

		expect( screen.queryByRole( 'button', { name: 'Dismiss' } ) ).not.toBeInTheDocument();
	} );
} );
