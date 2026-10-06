/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import HostCards from '../host-cards';

function renderCards( props: Partial< React.ComponentProps< typeof HostCards > > = {} ) {
	return render(
		<HostCards owned={ {} } isReferralMode={ false } onPick={ jest.fn() } { ...props } />
	);
}

describe( '<HostCards>', () => {
	test( 'leads each host to its own page', async () => {
		renderCards();

		expect( await screen.findByRole( 'link', { name: 'Explore WordPress.com' } ) ).toHaveAttribute(
			'href',
			'/hosting/wpcom'
		);
		expect( screen.getByRole( 'link', { name: 'Explore Pressable' } ) ).toHaveAttribute(
			'href',
			'/hosting/pressable'
		);
		expect( screen.getByRole( 'link', { name: 'Explore VIP' } ) ).toHaveAttribute(
			'href',
			'/hosting/vip'
		);
		// The cards compare hosts by their job, never by price.
		expect( screen.queryByText( /\$/ ) ).not.toBeInTheDocument();
	} );

	test( 'owners see what they own and go straight to more', async () => {
		renderCards( {
			owned: { wpcom: 'You own 4 sites', pressable: 'Your plan: Signature 3' },
		} );

		expect( await screen.findByText( 'You own 4 sites' ) ).toBeVisible();
		expect( screen.getByText( 'Your plan: Signature 3' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Add more sites' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Upgrade plan' } ) ).toBeVisible();
	} );

	test( 'referrals ignore what is owned when choosing the action', async () => {
		renderCards( { owned: { wpcom: 'You own 4 sites' }, isReferralMode: true } );

		expect( await screen.findByText( 'You own 4 sites' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Explore WordPress.com' } ) ).toBeVisible();
	} );
} );
