/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import { Notice } from '../index';

describe( '<Notice>', () => {
	test( 'shows the title, description and actions', () => {
		render(
			<Notice title="Heads up" actions={ <button>Fix it</button> }>
				<p>Something needs attention.</p>
			</Notice>
		);

		expect( screen.getByText( 'Heads up' ) ).toBeVisible();
		expect( screen.getByRole( 'paragraph' ) ).toHaveTextContent( 'Something needs attention.' );
		expect( screen.getByRole( 'button', { name: 'Fix it' } ) ).toBeVisible();
	} );

	test( 'calls onClose when dismissed', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		render( <Notice onClose={ onClose }>Hello</Notice> );

		await user.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

		expect( onClose ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'has no dismiss button without onClose', () => {
		render( <Notice>Hello</Notice> );

		expect( screen.queryByRole( 'button', { name: 'Dismiss' } ) ).not.toBeInTheDocument();
	} );
} );
