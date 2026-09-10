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
				title="Connect to WordPress Agent"
				description="We are creating your site. Meanwhile, connect your chat app now so you can manage it remotely on the go"
				label="Telegram"
				href="https://wordpress.com/me/developer"
				onClick={ onClick }
			/>
		);

		const link = screen.getByRole( 'link', { name: 'Telegram' } );

		expect( link ).toHaveAttribute( 'href', 'https://wordpress.com/me/developer' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveClass( 'is-compact' );
		expect( link ).not.toHaveClass( 'is-primary' );
		expect( link.getAttribute( 'rel' )?.trim().split( /\s+/ ) ).toEqual( [
			'noopener',
			'noreferrer',
		] );

		fireEvent.click( link );
		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );
} );
