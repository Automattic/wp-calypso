/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AtomicTransferDialog } from '../atomic-transfer-dialog';
import type { Theme } from 'calypso/types';

jest.mock( 'calypso/blocks/eligibility-warnings', () => ( {
	__esModule: true,
	default: ( { onProceed }: { onProceed: () => void } ) => (
		<button onClick={ onProceed }>Continue</button>
	),
} ) );

const siteId = 123;
const theme = { id: 'partner-theme' } as Theme;

function renderDialog( props: { needsSubscription: boolean } ) {
	const dispatchProps = {
		dispatchAcceptAtomicTransferDialog: jest.fn(),
		dispatchDismissAtomicTransferDialog: jest.fn(),
		dispatchActivateTheme: jest.fn(),
		dispatchAddExternalManagedThemeToCart: jest.fn(),
		dispatchInitiateThemeTransfer: jest.fn(),
		dispatchRequestSite: jest.fn(),
	};

	render(
		<AtomicTransferDialog
			siteId={ siteId }
			theme={ theme }
			showEligibility
			isMarketplaceProduct
			{ ...props }
			{ ...dispatchProps }
		/>
	);

	return dispatchProps;
}

describe( 'AtomicTransferDialog', () => {
	test( 'goes to checkout instead of transferring when the partner theme needs a subscription', async () => {
		const {
			dispatchAcceptAtomicTransferDialog,
			dispatchAddExternalManagedThemeToCart,
			dispatchInitiateThemeTransfer,
		} = renderDialog( { needsSubscription: true } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( dispatchAcceptAtomicTransferDialog ).toHaveBeenCalledWith( theme.id );
		expect( dispatchAddExternalManagedThemeToCart ).toHaveBeenCalledWith( theme.id, siteId );
		expect( dispatchInitiateThemeTransfer ).not.toHaveBeenCalled();
	} );

	test( 'transfers the site when the theme does not need a subscription', async () => {
		const { dispatchAddExternalManagedThemeToCart, dispatchInitiateThemeTransfer } = renderDialog( {
			needsSubscription: false,
		} );

		await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( dispatchInitiateThemeTransfer ).toHaveBeenCalledWith(
			siteId,
			null,
			'',
			'',
			'theme_install'
		);
		expect( dispatchAddExternalManagedThemeToCart ).not.toHaveBeenCalled();
	} );
} );
