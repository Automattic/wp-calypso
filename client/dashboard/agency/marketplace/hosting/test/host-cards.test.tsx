/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import HostCards from '../host-cards';

function renderCards( props: Partial< React.ComponentProps< typeof HostCards > > = {} ) {
	return render(
		<HostCards
			term="yearly"
			prices={ {
				wpcom: { amount: 300, currency: 'USD' },
				pressable: { amount: 250, currency: 'USD' },
			} }
			owned={ {} }
			isReferralMode={ false }
			onPick={ jest.fn() }
			{ ...props }
		/>
	);
}

describe( '<HostCards>', () => {
	test( 'leads each host to its own page', async () => {
		renderCards();

		expect(
			await screen.findByRole( 'link', { name: 'Configure WordPress.com' } )
		).toHaveAttribute( 'href', '/hosting/wpcom' );
		expect( screen.getByRole( 'link', { name: 'Configure Pressable' } ) ).toHaveAttribute(
			'href',
			'/hosting/pressable'
		);
		expect( screen.getByRole( 'link', { name: 'Learn more' } ) ).toHaveAttribute(
			'href',
			'/hosting/vip'
		);
		expect( screen.getByText( '$300' ) ).toBeVisible();
		expect( screen.getByText( 'Custom' ) ).toBeVisible();
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
		expect( screen.getByRole( 'link', { name: 'Configure WordPress.com' } ) ).toBeVisible();
	} );
} );
