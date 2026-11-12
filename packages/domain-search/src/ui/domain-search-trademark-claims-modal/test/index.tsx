import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DomainSearchTrademarkClaimsModal } from '..';
import * as scrollToEndModule from '../../../helpers/has-scrolled-to-end';

const hasScrolledToEndModuleMock = vi.mock( '../../../helpers/has-scrolled-to-end' );

describe( 'DomainSearchTrademarkClaimsModal', () => {
	afterEach( () => {
		hasScrolledToEndModuleMock.resetAllMocks();
	} );

	it( 'allows clicking onAccept if the user has scrolled to the end', async () => {
		vi.spyOn( scrollToEndModule, 'hasScrolledToEnd' ).mockReturnValue( true );

		const user = userEvent.setup();

		const onAccept = vi.fn();

		render(
			<DomainSearchTrademarkClaimsModal
				domainName="test-trademark-claim.com"
				onAccept={ onAccept }
				onClose={ vi.fn() }
				trademarkClaimsNoticeInfo={ { claim: { markName: 'Test Trademark' } } }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Acknowledge trademark' } ) );

		expect( onAccept ).toHaveBeenCalled();
	} );

	it( 'does not allow clicking onAccept if the user has not scrolled to the end', async () => {
		vi.spyOn( scrollToEndModule, 'hasScrolledToEnd' ).mockReturnValue( false );

		const onAccept = vi.fn();

		render(
			<DomainSearchTrademarkClaimsModal
				domainName="test-trademark-claim.com"
				onAccept={ onAccept }
				onClose={ vi.fn() }
				trademarkClaimsNoticeInfo={ { claim: { markName: 'Test Trademark' } } }
			/>
		);

		expect( screen.getByRole( 'button', { name: 'Acknowledge trademark' } ) ).toBeDisabled();

		expect( onAccept ).not.toHaveBeenCalled();
	} );
} );
