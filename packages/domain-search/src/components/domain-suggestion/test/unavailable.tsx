import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { DomainSuggestion } from '..';

describe( 'DomainSuggestion.Unavailable', () => {
	it( 'shows already registered message', () => {
		const { container } = render(
			<DomainSuggestion.Unavailable
				domain="example"
				tld="com"
				getReasonText={ ( { domain } ) =>
					createInterpolateElement( __( '<domain /> is already registered.' ), {
						domain,
					} )
				}
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
				getReasonText={ ( { domain } ) =>
					createInterpolateElement( __( '<domain /> is already registered.' ), {
						domain,
					} )
				}
				onTransferClick={ onTransferClick }
			/>
		);

		expect( container ).toHaveTextContent( 'Already yours? Bring it over' );

		const transferButton = screen.getByRole( 'button', { name: 'Bring it over' } );
		await user.click( transferButton );

		expect( onTransferClick ).toHaveBeenCalled();
	} );
} );
