/**
 * @jest-environment jsdom
 */
import { type DomainDiagnostics as DomainDiagnosticsData } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import DomainDiagnostics from '../index';

const domainName = 'example.com';

jest.mock( '../../../app/router/domains', () => ( {
	...jest.requireActual( '../../../app/router/domains' ),
	domainRoute: {
		useParams: () => ( { domainName: 'example.com' } ),
	},
} ) );

const mockDiagnosticsApiRequest = ( data: DomainDiagnosticsData ) =>
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/domains/diagnostics/${ domainName }` )
		.reply( 200, data );

describe( '<DomainDiagnostics>', () => {
	test( 'renders the missing records when diagnostics report issues', async () => {
		mockDiagnosticsApiRequest( {
			email_dns_records: {
				records: {
					spf: { status: 'not_found', correct_record: 'v=spf1 include:_spf.wpcloud.com ~all' },
				},
				is_using_wpcom_name_servers: false,
				all_essential_email_dns_records_are_correct: false,
				dismissed_email_dns_issues_notice: false,
				should_offer_automatic_fixes: false,
			},
		} );

		render( <DomainDiagnostics /> );

		expect( await screen.findByText( 'Missing or invalid DNS records' ) ).toBeVisible();
		expect( screen.getByRole( 'list' ) ).toBeVisible();
		expect( screen.getByText( 'v=spf1 include:_spf.wpcloud.com ~all' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Dismiss this notice' } ) ).toBeVisible();
	} );

	// The endpoint returns only a code, with no records map, for domains that
	// aren't mapped to an Atomic site. The route doesn't guard against them.
	test( 'renders without the records card when diagnostics return only a code', async () => {
		mockDiagnosticsApiRequest( {
			email_dns_records: { code: 'domain_not_mapped_to_atomic_site' },
		} as DomainDiagnosticsData );

		render( <DomainDiagnostics /> );

		expect(
			await screen.findByText( 'We didn’t find any issues with your domain!' )
		).toBeVisible();
		expect( screen.queryByRole( 'list' ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Dismiss this notice' } )
		).not.toBeInTheDocument();
	} );
} );
