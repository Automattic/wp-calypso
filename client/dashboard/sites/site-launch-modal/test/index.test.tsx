/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useState } from 'react';
import SiteLaunchModal from '..';
import { render } from '../../../test-utils';
import type { DomainSummary, Site } from '@automattic/api-core';

const createMockSite = ( options: Partial< Site > = {} ): Site =>
	( {
		ID: 1,
		slug: 'kaonashi.wordpress.com',
		URL: 'https://kaonashi.wordpress.com',
		name: 'Kaonashi',
		launch_status: 'unlaunched' as const,
		plan: {
			product_slug: 'business-bundle',
			product_name: 'Business plan',
			product_name_short: 'Business',
			is_free: false,
		},
		...options,
	} ) as Site;

const createMockDomain = ( domain: string ): DomainSummary =>
	( { domain, blog_id: 1, subscription_id: 123 } ) as unknown as DomainSummary;

const mockDomainsApi = ( domains: DomainSummary[] = [] ) => {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains } );
};

describe( '<SiteLaunchModal variant="pre-launch">', () => {
	beforeEach( () => {
		mockDomainsApi( [ createMockDomain( 'kaonashi.com' ) ] );
	} );

	test( 'renders the confirmation with site name, domain, plan and launch button', async () => {
		render(
			<SiteLaunchModal
				variant="pre-launch"
				site={ createMockSite() }
				isOpen
				onClose={ () => {} }
				isLaunching={ false }
				onLaunch={ () => {} }
			/>
		);

		expect(
			await screen.findByRole( 'dialog', { name: 'Launching makes your site public.' } )
		).toBeVisible();
		expect( screen.getByText( 'Kaonashi' ) ).toBeVisible();
		expect( await screen.findByText( 'kaonashi.com' ) ).toBeVisible();
		expect( screen.getByText( 'Business plan' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Yes, launch site!' } ) ).toBeVisible();
	} );

	test( 'does not offer a "View site" action before launch', async () => {
		render(
			<SiteLaunchModal
				variant="pre-launch"
				site={ createMockSite() }
				isOpen
				onClose={ () => {} }
				isLaunching={ false }
				onLaunch={ () => {} }
			/>
		);

		await screen.findByRole( 'dialog' );
		expect( screen.queryByRole( 'link', { name: 'View site' } ) ).not.toBeInTheDocument();
	} );

	test( 'calls onLaunch when the launch button is clicked', async () => {
		const user = userEvent.setup();
		const onLaunch = jest.fn();
		render(
			<SiteLaunchModal
				variant="pre-launch"
				site={ createMockSite() }
				isOpen
				onClose={ () => {} }
				isLaunching={ false }
				onLaunch={ onLaunch }
			/>
		);

		await user.click( await screen.findByRole( 'button', { name: 'Yes, launch site!' } ) );
		expect( onLaunch ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'closes the modal when dismissed without launching', async () => {
		const user = userEvent.setup();
		const onLaunch = jest.fn();

		function Harness() {
			const [ open, setOpen ] = useState( true );
			if ( ! open ) {
				return null;
			}
			return (
				<SiteLaunchModal
					variant="pre-launch"
					site={ createMockSite() }
					isOpen
					onClose={ () => setOpen( false ) }
					isLaunching={ false }
					onLaunch={ onLaunch }
				/>
			);
		}

		render( <Harness /> );

		await screen.findByRole( 'dialog' );
		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );

		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
		expect( onLaunch ).not.toHaveBeenCalled();
	} );

	test( 'disables the launch button while launching', async () => {
		render(
			<SiteLaunchModal
				variant="pre-launch"
				site={ createMockSite() }
				isOpen
				onClose={ () => {} }
				isLaunching
				onLaunch={ () => {} }
			/>
		);

		expect( await screen.findByRole( 'button', { name: 'Yes, launch site!' } ) ).toBeDisabled();
	} );
} );
