/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AutoRenewDiolog } from '../auto-renew-dialog';
import type { PartialDomainData } from '@automattic/data-stores';

const mockHandleAutoRenew = jest.fn();

jest.mock( '../../use-context', () => ( {
	useDomainsDataViewsContext: () => ( { handleAutoRenew: mockHandleAutoRenew } ),
} ) );

const buildDomain = ( autoRenewing: boolean, domain = 'example.com' ) =>
	( { domain, auto_renewing: autoRenewing } ) as PartialDomainData;

const getStatusOption = ( status: 'on' | 'off' ) => {
	const option = screen
		.getAllByRole( 'menuitem' )
		.find( ( item ) => item.textContent === `Turn ${ status } auto-renew` );
	if ( ! option ) {
		throw new Error( `Missing auto-renew option: ${ status }` );
	}
	return option;
};

describe( 'AutoRenewDiolog', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it.each( [
		[ true, 'on' ],
		[ false, 'off' ],
	] )( 'shows the saved status when auto-renew is %s', ( autoRenewing, status ) => {
		render( <AutoRenewDiolog items={ [ buildDomain( autoRenewing ) ] } /> );

		expect( screen.getByRole( 'button', { expanded: false } ) ).toHaveAccessibleName(
			new RegExp( `^Turn ${ status } auto-renew` )
		);
		expect( screen.getByRole( 'button', { name: 'Update' } ) ).toBeDisabled();
	} );

	it.each( [ true, false ] )( 'saves a change from auto-renew %s', async ( autoRenewing ) => {
		const user = userEvent.setup();
		const items = [ buildDomain( autoRenewing ) ];
		const closeModal = jest.fn();
		const onActionPerformed = jest.fn();
		render(
			<AutoRenewDiolog
				items={ items }
				closeModal={ closeModal }
				onActionPerformed={ onActionPerformed }
			/>
		);

		await user.click( screen.getByRole( 'button', { expanded: false } ) );
		await user.click( getStatusOption( autoRenewing ? 'off' : 'on' ) );
		await user.click( screen.getByRole( 'button', { name: 'Update' } ) );

		expect( mockHandleAutoRenew ).toHaveBeenCalledWith( items, ! autoRenewing );
		expect( onActionPerformed ).toHaveBeenCalledWith( items );
		expect( closeModal ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'disables Update when the original status is selected again', async () => {
		const user = userEvent.setup();
		render( <AutoRenewDiolog items={ [ buildDomain( true ) ] } /> );

		await user.click( screen.getByRole( 'button', { expanded: false } ) );
		await user.click( getStatusOption( 'off' ) );
		expect( screen.getByRole( 'button', { name: 'Update' } ) ).toBeEnabled();
		await user.click( getStatusOption( 'on' ) );

		expect( screen.getByRole( 'button', { name: 'Update' } ) ).toBeDisabled();
		expect( mockHandleAutoRenew ).not.toHaveBeenCalled();
	} );

	it( 'cancels without saving and restores the saved status when reopened', async () => {
		const user = userEvent.setup();
		const closeModal = jest.fn();
		const { unmount } = render(
			<AutoRenewDiolog items={ [ buildDomain( true ) ] } closeModal={ closeModal } />
		);

		await user.click( screen.getByRole( 'button', { expanded: false } ) );
		await user.click( getStatusOption( 'off' ) );
		await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );
		expect( closeModal ).toHaveBeenCalledTimes( 1 );
		expect( mockHandleAutoRenew ).not.toHaveBeenCalled();

		unmount();
		render( <AutoRenewDiolog items={ [ buildDomain( true ) ] } /> );
		expect( screen.getByRole( 'button', { expanded: false } ) ).toHaveAccessibleName(
			/^Turn on auto-renew/
		);
	} );

	it( 'shows the updated saved status when reopened', () => {
		const { unmount } = render( <AutoRenewDiolog items={ [ buildDomain( true ) ] } /> );
		unmount();
		render( <AutoRenewDiolog items={ [ buildDomain( false ) ] } /> );

		expect( screen.getByRole( 'button', { expanded: false } ) ).toHaveAccessibleName(
			/^Turn off auto-renew/
		);
	} );

	it( 'allows changing and restoring the status with the keyboard', async () => {
		const user = userEvent.setup();
		render( <AutoRenewDiolog items={ [ buildDomain( true ) ] } /> );

		await user.tab();
		await user.keyboard( '[Enter][ArrowDown][Enter]' );
		expect( screen.getByRole( 'button', { expanded: false } ) ).toHaveAccessibleName(
			/^Turn off auto-renew/
		);
		expect( screen.getByRole( 'button', { name: 'Update' } ) ).toBeEnabled();

		await user.keyboard( '[Enter][ArrowUp][Enter]' );
		expect( screen.getByRole( 'button', { expanded: false } ) ).toHaveAccessibleName(
			/^Turn on auto-renew/
		);
		expect( screen.getByRole( 'button', { name: 'Update' } ) ).toBeDisabled();
		expect( mockHandleAutoRenew ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ true, true, true ],
		[ false, false, false ],
		[ true, false, false ],
	] )( 'keeps the bulk placeholder for statuses %s and %s', async ( first, second, enable ) => {
		const user = userEvent.setup();
		const items = [ buildDomain( first ), buildDomain( second, 'example.org' ) ];
		render( <AutoRenewDiolog items={ items } /> );

		expect( screen.getByRole( 'button', { expanded: false } ) ).toHaveAccessibleName(
			/^Choose new status…/
		);
		expect( screen.getByRole( 'button', { name: 'Update' } ) ).toBeDisabled();
		await user.click( screen.getByRole( 'button', { expanded: false } ) );
		await user.click( getStatusOption( enable ? 'on' : 'off' ) );
		await user.click( screen.getByRole( 'button', { name: 'Update' } ) );

		expect( mockHandleAutoRenew ).toHaveBeenCalledWith( items, enable );
	} );
} );
