/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import Snackbars from '../../../app/snackbars';
import { render } from '../../../test-utils';
import AmplifyReportsList from '../reports';
import type { AmplifyReport } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 7;

const completedReport = {
	id: '1',
	status: 'completed',
	url: 'https://oliveandember.example',
	mode: 'full',
	created_at: '2026-10-30T12:00:00+00:00',
	updated_at: '2026-10-30T12:20:00+00:00',
	score: { human: 71, ai: 64 },
	has_pdf: true,
	archived: false,
	failure_reason: null,
} as AmplifyReport;

const failedReport = {
	...completedReport,
	id: '2',
	status: 'failed',
	score: { human: null, ai: null },
	has_pdf: false,
	failure_reason: 'The site took too long to load.',
} as AmplifyReport;

function renderList( reports: AmplifyReport[] ) {
	nock( API )
		.get( '/wpcom/v2/jetpack-agency/sites' )
		.query( true )
		.reply( 200, { sites: [], total: 0 } )
		.persist();

	return render(
		<>
			<AmplifyReportsList agencyId={ AGENCY_ID } reports={ reports } />
			<Snackbars />
		</>
	);
}

// The message is also announced in the a11y live region, so read the snackbar itself.
function findSnackbar( text: string ) {
	return screen.findByText( text, { selector: '.components-snackbar__content' } );
}

describe( '<AmplifyReportsList>', () => {
	test( 'downloads a completed report’s PDF', async () => {
		URL.createObjectURL = jest.fn( () => 'blob:report' );
		URL.revokeObjectURL = jest.fn();
		const scope = nock( API )
			.get( `/wpcom/v2/agency/${ AGENCY_ID }/amplify/reports/1/pdf` )
			.reply( 200, { filename: 'amplify-report-1.pdf', data: btoa( '%PDF-1.4' ) } );

		renderList( [ completedReport ] );
		await userEvent.click( await screen.findByRole( 'button', { name: 'Download PDF' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		await waitFor( () => expect( URL.createObjectURL ).toHaveBeenCalled() );
	} );

	test( 'tells the agency when a report can’t be retried again', async () => {
		nock( API )
			.post( `/wpcom/v2/agency/${ AGENCY_ID }/amplify/reports/2/retry` )
			.reply( 409, {
				code: 'amplify_report_retry_limit_reached',
				message: 'Already retried.',
				data: { status: 409 },
			} );

		renderList( [ failedReport ] );
		await userEvent.click( await screen.findByRole( 'button', { name: 'Retry' } ) );

		expect(
			await findSnackbar( 'This report was already retried. Start a new report instead.' )
		).toBeInTheDocument();
	} );

	test( 'restarts a failed report', async () => {
		nock( API )
			.post( `/wpcom/v2/agency/${ AGENCY_ID }/amplify/reports/2/retry` )
			.reply( 202, { ...failedReport, status: 'pending', failure_reason: null } );

		renderList( [ failedReport ] );
		await userEvent.click( await screen.findByRole( 'button', { name: 'Retry' } ) );

		expect(
			await findSnackbar( 'Report restarted. Retries don’t count toward your allowance.' )
		).toBeInTheDocument();
	} );

	test( 'keeps the archive dialog open until the report is archived', async () => {
		let finishArchive: () => void = () => {};
		const archived = new Promise< void >( ( resolve ) => {
			finishArchive = resolve;
		} );
		nock( API )
			// `wpcom.req.put()` sends a POST.
			.post( `/wpcom/v2/agency/${ AGENCY_ID }/amplify/reports/1` )
			.reply( ( _uri, _body, callback ) => {
				archived.then( () => callback( null, [ 200, { ...completedReport, archived: true } ] ) );
			} );
		const user = userEvent.setup();

		renderList( [ completedReport ] );
		await user.click( await screen.findByRole( 'button', { name: 'Archive report' } ) );
		const dialog = await screen.findByRole( 'dialog', { name: 'Archive report?' } );
		await user.click( within( dialog ).getByRole( 'button', { name: 'Archive' } ) );

		await waitFor( () =>
			expect( within( dialog ).getByRole( 'button', { name: 'Cancel' } ) ).toHaveAttribute(
				'aria-disabled',
				'true'
			)
		);
		await user.keyboard( '{Escape}' );
		expect( dialog ).toBeVisible();

		finishArchive();
		expect( await findSnackbar( 'The report has been archived.' ) ).toBeInTheDocument();
		await waitFor( () => expect( dialog ).not.toBeInTheDocument() );
	} );
} );
