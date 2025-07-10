import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainSuggestion } from '..';

describe( 'DomainSuggestion.Unavailable', () => {
	it( 'shows already registered message', () => {
		const { container } = render(
			<DomainSuggestion.Unavailable
				domain="example"
				tld="com"
				unavailableReason="already-registered"
			/>
		);

		expect( container ).toHaveTextContent( 'example.com is already registered.' );
	} );

	it( 'calls onTransferClick when transfer button is clicked', async () => {
		const user = userEvent.setup();
		const onTransferClick = jest.fn();

		const { container } = render(
			<DomainSuggestion.Unavailable
				domain="example"
				tld="com"
				unavailableReason="already-registered"
				onTransferClick={ onTransferClick }
			/>
		);

		expect( container ).toHaveTextContent( 'Already yours? Bring it over' );

		const transferButton = screen.getByRole( 'button', { name: 'Bring it over' } );
		await user.click( transferButton );

		expect( onTransferClick ).toHaveBeenCalled();
	} );
} );
