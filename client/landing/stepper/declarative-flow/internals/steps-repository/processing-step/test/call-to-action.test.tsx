/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import ProcessingCallToAction from '../call-to-action';

describe( 'ProcessingCallToAction', () => {
	it( 'opens the destination in a new tab and records the click', () => {
		const onClick = jest.fn();

		render(
			<ProcessingCallToAction
				title="Manage your site from Telegram"
				description="Connect Telegram to manage your site from a chat."
				label="Connect Telegram"
				href="https://wordpress.com/me/developer"
				onClick={ onClick }
			/>
		);

		const link = screen.getByRole( 'link', { name: 'Connect Telegram' } );

		expect( link ).toHaveAttribute( 'href', 'https://wordpress.com/me/developer' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link.getAttribute( 'rel' )?.trim().split( /\s+/ ) ).toEqual( [
			'noopener',
			'noreferrer',
		] );

		fireEvent.click( link );
		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );
} );
