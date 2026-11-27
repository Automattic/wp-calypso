/**
 * @vitest-environment jsdom
 */
import { queryClient } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import ProspectReportsSpacefastBanner, {
	SPACEFAST_BANNER_DISMISSED_PREFERENCE,
} from '../spacefast-banner';
import type { AmplifyReport } from '@automattic/api-core';

vi.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: vi.fn(),
	isEnabled: vi.fn(),
} ) );

const API = 'https://public-api.wordpress.com';
const HEADING = 'Interactive reports with Spacefast';

const COMPLETED = [ { status: 'completed' } ] as AmplifyReport[];

function mockPreferences( calypso_preferences: Record< string, unknown > = {} ) {
	return nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences } );
}

function renderBanner( reports: AmplifyReport[] = COMPLETED ) {
	return render(
		<>
			<ProspectReportsSpacefastBanner reports={ reports } />
			<button>Reports list</button>
		</>,
		{ queryClient }
	);
}

describe( '<ProspectReportsSpacefastBanner>', () => {
	beforeEach( () => {
		vi.mocked( isEnabled ).mockImplementation( ( flag ) => flag === 'a4a-spacefast-promo' );
	} );

	afterEach( () => {
		queryClient.clear();
	} );

	test( 'shows the offer once the agency has a completed report', async () => {
		mockPreferences();
		renderBanner();

		expect( await screen.findByRole( 'heading', { name: HEADING } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Start your 30 days/ } ) ).toHaveAttribute(
			'href',
			'https://my.spacefast.com/redeem/SPACEFAST-LAUNCH-213M'
		);
		expect( screen.getByRole( 'link', { name: /See an example/ } ) ).toHaveAttribute(
			'rel',
			'noreferrer'
		);
	} );

	test( 'saves the dismissal, hides the banner and moves focus on when closed', async () => {
		mockPreferences();
		let savedDismissed: unknown;
		const scope = nock( API )
			.post( '/rest/v1.1/me/preferences', ( body ) => {
				savedDismissed = body.calypso_preferences?.[ SPACEFAST_BANNER_DISMISSED_PREFERENCE ];
				return true;
			} )
			.query( true )
			.reply( 200, {
				calypso_preferences: { [ SPACEFAST_BANNER_DISMISSED_PREFERENCE ]: true },
			} );
		// jsdom lays nothing out, and focus only moves to elements that are on screen.
		const getClientRects = vi
			.spyOn( HTMLElement.prototype, 'getClientRects' )
			.mockReturnValue( [ {} ] as unknown as DOMRectList );
		const { recordTracksEvent } = renderBanner();

		await screen.findByRole( 'heading', { name: HEADING } );
		await userEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

		expect( screen.queryByRole( 'heading', { name: HEADING } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Reports list' } ) ).toHaveFocus();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_spacefast_promo_dismiss_click', {
			placement: 'prospect_reports',
		} );
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( savedDismissed ).toBe( true );
		getClientRects.mockRestore();
	} );

	test( 'does not show once it has been closed', async () => {
		const scope = mockPreferences( { [ SPACEFAST_BANNER_DISMISSED_PREFERENCE ]: true } );
		renderBanner();

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( screen.queryByRole( 'heading', { name: HEADING } ) ).not.toBeInTheDocument();
	} );

	test.each( [
		[ 'the promo is off', () => vi.mocked( isEnabled ).mockReturnValue( false ), COMPLETED ],
		[
			'no report has completed yet',
			() => {},
			[ { status: 'processing' }, { status: 'failed' } ] as AmplifyReport[],
		],
	] )( 'does not show, or load preferences, when %s', async ( _, setUp, reports ) => {
		setUp();
		const scope = mockPreferences();
		renderBanner( reports );

		await expect(
			screen.findByRole( 'heading', { name: HEADING }, { timeout: 200 } )
		).rejects.toThrow();
		expect( scope.isDone() ).toBe( false );
	} );
} );
