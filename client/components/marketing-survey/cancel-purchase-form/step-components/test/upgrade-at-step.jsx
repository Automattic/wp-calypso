/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpgradeATStep } from '../upgrade-at-step';

jest.mock( '@automattic/components/src/button', () => ( { href, onClick, children } ) => (
	<a href={ href } onClick={ onClick }>
		{ children }
	</a>
) );

const noop = () => {};
const props = {
	recordTracksEvent: jest.fn(),
	selectedSite: { slug: 'site_slug' },
	translate: jest.fn( ( content ) => content ),
};

describe( 'UpgradeATStep', () => {
	test( 'should render translated heading content', () => {
		const { container } = render( <UpgradeATStep { ...props } recordTracksEvent={ noop } /> );
		expect( props.translate ).toHaveBeenCalled();
		expect( container.firstChild ).toHaveTextContent( 'New! Install Custom Plugins and Themes' );
	} );

	test( 'should render translated link content', () => {
		render( <UpgradeATStep { ...props } recordTracksEvent={ noop } /> );
		expect( props.translate ).toHaveBeenCalled();
		expect( screen.queryByRole( 'group' ) ).toHaveTextContent(
			'Did you know that you can now use third-party plugins and themes on the WordPress.com Business plan? ' +
				'Claim a 25% discount when you upgrade your site today - {{b}}enter the code BIZC25 at checkout{{/b}}.'
		);
	} );

	test( 'should render translated confirmation content', () => {
		render( <UpgradeATStep { ...props } recordTracksEvent={ noop } /> );
		expect( props.translate ).toHaveBeenCalled();
		expect( screen.queryByRole( 'link' ) ).toHaveTextContent( 'Upgrade My Site' );
	} );

	test( 'should render button with link to business plan checkout', () => {
		render( <UpgradeATStep { ...props } recordTracksEvent={ noop } translate={ noop } /> );

		expect( screen.queryByRole( 'link' ) ).toHaveAttribute(
			'href',
			'/checkout/site_slug/business?coupon=BIZC25'
		);
	} );

	test( 'should fire tracks event when button is clicked', async () => {
		const recordTracksEvent = jest.fn();
		render(
			<UpgradeATStep { ...props } translate={ noop } recordTracksEvent={ recordTracksEvent } />
		);
		const user = userEvent.setup();
		const btn = screen.queryByRole( 'link' );

		btn.addEventListener( 'click', ( event ) => event.preventDefault(), false );
		await user.click( btn );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_cancellation_upgrade_at_step_upgrade_click'
		);
	} );
} );
