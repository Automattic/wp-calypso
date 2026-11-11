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
	test( 'owners see what they own and an action to buy more', async () => {
		renderCards( { owned: { wpcom: 'You own 4 sites', pressable: 'Your plan: Signature 3' } } );

		expect( await screen.findByText( 'You own 4 sites' ) ).toBeVisible();
		expect( screen.getByText( 'Your plan: Signature 3' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Add more sites' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Upgrade plan' } ) ).toBeVisible();
	} );

	test( 'referral mode keeps the explore actions for owners', async () => {
		renderCards( { owned: { wpcom: 'You own 4 sites' }, isReferralMode: true } );

		expect( await screen.findByText( 'You own 4 sites' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Explore WordPress.com' } ) ).toBeVisible();
	} );

	test( 'the largest Pressable plan leads to exploring, not upgrading', async () => {
		renderCards( { owned: { pressable: 'Your plan: Signature 17' }, isOnTopPressablePlan: true } );

		expect( await screen.findByRole( 'link', { name: 'Explore Pressable' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Upgrade plan' } ) ).not.toBeInTheDocument();
	} );
} );
