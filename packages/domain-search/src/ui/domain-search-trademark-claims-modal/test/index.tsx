import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainSearchTrademarkClaimsModal } from '..';
import * as scrollToEndModule from '../../../helpers/has-scrolled-to-end';

const hasScrolledToEndModuleMock = jest.mock( '../../../helpers/has-scrolled-to-end' );

describe( 'DomainSearchTrademarkClaimsModal', () => {
	afterEach( () => {
		hasScrolledToEndModuleMock.resetAllMocks();
	} );

	it( 'allows clicking onAccept if the user has scrolled to the end', async () => {
		jest.spyOn( scrollToEndModule, 'hasScrolledToEnd' ).mockReturnValue( true );

		const user = userEvent.setup();

		const onAccept = jest.fn();

		render(
			<DomainSearchTrademarkClaimsModal
				domainName="test-trademark-claim.com"
				onAccept={ onAccept }
				onClose={ jest.fn() }
				trademarkClaimsNoticeInfo={ { claim: { markName: 'Test Trademark' } } }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Acknowledge trademark' } ) );

		expect( onAccept ).toHaveBeenCalled();
	} );

	it( 'does not allow clicking onAccept if the user has not scrolled to the end', async () => {
		jest.spyOn( scrollToEndModule, 'hasScrolledToEnd' ).mockReturnValue( false );

		const onAccept = jest.fn();

		render(
			<DomainSearchTrademarkClaimsModal
				domainName="test-trademark-claim.com"
				onAccept={ onAccept }
				onClose={ jest.fn() }
				trademarkClaimsNoticeInfo={ { claim: { markName: 'Test Trademark' } } }
			/>
		);

		expect( screen.getByRole( 'button', { name: 'Acknowledge trademark' } ) ).toBeDisabled();

		expect( onAccept ).not.toHaveBeenCalled();
	} );
} );
