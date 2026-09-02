/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PreLaunchModal from '..';

describe( '<PreLaunchModal>', () => {
	const baseProps = {
		siteName: 'Kaonashi',
		siteDomain: 'kaonashi.com',
		planName: 'Business plan',
		onLaunch: () => {},
		onClose: () => {},
	};

	test( 'renders the confirmation with site name, domain, plan and launch button', () => {
		render( <PreLaunchModal { ...baseProps } isLaunching={ false } /> );

		expect(
			screen.getByRole( 'dialog', { name: 'Launching makes your site public' } )
		).toBeVisible();
		expect( screen.getByText( 'Kaonashi' ) ).toBeVisible();
		expect( screen.getByText( 'kaonashi.com' ) ).toBeVisible();
		expect( screen.getByText( 'Business plan' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Yes, launch site!' } ) ).toBeVisible();
	} );

	test( 'shows the launching state instead of the confirmation while launching', () => {
		render( <PreLaunchModal { ...baseProps } isLaunching /> );

		expect( screen.getByRole( 'dialog', { name: 'Launching site…' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Yes, launch site!' } ) ).not.toBeInTheDocument();
	} );

	test( 'fires onLaunch when the launch button is clicked', async () => {
		const user = userEvent.setup();
		const onLaunch = jest.fn();
		render( <PreLaunchModal { ...baseProps } isLaunching={ false } onLaunch={ onLaunch } /> );

		await user.click( screen.getByRole( 'button', { name: 'Yes, launch site!' } ) );

		expect( onLaunch ).toHaveBeenCalledTimes( 1 );
	} );
} );
