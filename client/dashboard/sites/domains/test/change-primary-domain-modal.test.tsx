/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import Snackbars from '../../../app/snackbars';
import { render } from '../../../test-utils';
import ChangePrimaryDomainModal from '../change-primary-domain-modal';
import type { DomainSummary, Site } from '@automattic/api-core';

const site = { ID: 123, slug: 'primary-domain-test.wordpress.com' } as Site;
const currentPrimaryDomain = { domain: 'primary-domain-test.wordpress.com' } as DomainSummary;
const domains = [ { domain: 'example.com' } ] as DomainSummary[];

beforeEach( () => {
	jest.spyOn( window, 'scrollTo' ).mockImplementation( () => {} );
} );

afterEach( () => {
	jest.restoreAllMocks();
	for ( const notice of select( noticesStore ).getNotices() ) {
		dispatch( noticesStore ).removeNotice( notice.id );
	}
} );

async function submitChange( onClose = jest.fn() ) {
	const user = userEvent.setup();
	render(
		<>
			<ChangePrimaryDomainModal
				site={ site }
				currentPrimaryDomain={ currentPrimaryDomain }
				eligibleDomains={ domains }
				onClose={ onClose }
			/>
			<Snackbars />
		</>
	);
	await user.selectOptions( await screen.findByRole( 'combobox' ), 'example.com' );
	await user.click( screen.getByRole( 'button', { name: 'Change address' } ) );
	return onClose;
}

describe( 'ChangePrimaryDomainModal', () => {
	it.each( [
		[
			'atomic_primary_domain_change_failed',
			"We couldn't make this domain your primary domain. Please try again in a few minutes, or contact support if it keeps happening.",
			"We couldn't make this domain your primary domain. Please try again in a few minutes, or contact support if it keeps happening.",
		],
		[ 'domain_not_active', 'This domain is not active.', 'This domain is not active.' ],
		[ 'unknown_error', '', 'Failed to change primary domain.' ],
	] )( 'keeps the modal open and shows an error for %s', async ( error, message, expected ) => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/sites/123/domains/primary', { domain: 'example.com' } )
			.reply( 400, { error, message } );
		const onClose = await submitChange();

		await waitFor( () =>
			expect(
				screen.getByText( expected, { selector: '.components-snackbar__content' } )
			).toBeVisible()
		);
		expect( onClose ).not.toHaveBeenCalled();
		expect( screen.queryByText( /Primary site address changed:/ ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Change address' } ) ).toBeEnabled();
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'closes and shows success after a successful change', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/sites/123/domains/primary', { domain: 'example.com' } )
			.reply( 200, { success: true } );
		const onClose = await submitChange();

		await waitFor( () => expect( onClose ).toHaveBeenCalledTimes( 1 ) );
		await waitFor( () =>
			expect(
				screen.getByText(
					'Primary site address changed: all domains will redirect to example.com.',
					{ selector: '.components-snackbar__content' }
				)
			).toBeVisible()
		);
		expect( scope.isDone() ).toBe( true );
	} );
} );
