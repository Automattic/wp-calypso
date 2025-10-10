import { DomainAvailabilityStatus } from '@automattic/api-core';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnavailableSearchResult } from '..';
import { buildAvailability } from '../../../test-helpers/factories/availability';
import { buildSuggestion } from '../../../test-helpers/factories/suggestions';
import { mockGetAvailabilityQuery } from '../../../test-helpers/queries/availability';
import { mockGetSuggestionsQuery } from '../../../test-helpers/queries/suggestions';
import { TestDomainSearchWithSuggestions } from '../../../test-helpers/renderer';

const GENERIC_STATUSES = [
	DomainAvailabilityStatus.TRANSFERRABLE,
	DomainAvailabilityStatus.TRANSFERRABLE_PREMIUM,
	DomainAvailabilityStatus.MAPPABLE,
	DomainAvailabilityStatus.MAPPED,
];

const SPECIAL_STATUSES = [
	DomainAvailabilityStatus.TLD_NOT_SUPPORTED,
	DomainAvailabilityStatus.TLD_NOT_SUPPORTED_TEMPORARILY,
	DomainAvailabilityStatus.UNKNOWN,
];

const STATUSES_WITH_MESSAGES = [ ...GENERIC_STATUSES, ...SPECIAL_STATUSES ];

const ALL_OTHER_STATUSES = Object.values( DomainAvailabilityStatus ).filter(
	( status ) => ! STATUSES_WITH_MESSAGES.includes( status )
);

describe( 'UnavailableSearchResult', () => {
	it.each( GENERIC_STATUSES )(
		'renders the already registered message if the availability status is %s',
		async ( status ) => {
			mockGetSuggestionsQuery( {
				params: { query: `test-${ status }.com` },
				suggestions: [ buildSuggestion( { domain_name: `test-${ status }.com` } ) ],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: `test-${ status }.com` },
				availability: buildAvailability( {
					domain_name: `test-${ status }.com`,
					tld: 'com',
					status,
				} ),
			} );

			render(
				<TestDomainSearchWithSuggestions
					query={ `test-${ status }.com` }
					config={ { allowsUsingOwnDomain: true } }
				>
					<UnavailableSearchResult />
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByText( /is already registered./ ) );

			expect( screen.getByText( /is already registered./ ) ).toHaveTextContent(
				`test-${ status }.com is already registered.`
			);
		}
	);

	it( 'renders the TLD not supported message if the availability status is tld_not_supported', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'woo.test.boston' },
			suggestions: [ buildSuggestion( { domain_name: 'test.boston' } ) ],
		} );

		mockGetAvailabilityQuery( {
			params: { domainName: 'woo.test.boston' },
			availability: buildAvailability( {
				domain_name: 'woo.test.boston',
				tld: 'boston',
				status: DomainAvailabilityStatus.TLD_NOT_SUPPORTED,
			} ),
		} );

		render(
			<TestDomainSearchWithSuggestions
				query="woo.test.boston"
				config={ { allowsUsingOwnDomain: true } }
			>
				<UnavailableSearchResult />
			</TestDomainSearchWithSuggestions>
		);

		await waitFor( () => screen.getByText( /domains are not available/i ) );

		expect( screen.getByText( /domains are not available/i ) ).toHaveTextContent(
			'.boston domains are not available for registration on WordPress.com.'
		);
	} );

	it( 'renders the TLD not supported message if the availability status is unknown', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'woo.test.boston' },
			suggestions: [ buildSuggestion( { domain_name: 'test.boston' } ) ],
		} );

		mockGetAvailabilityQuery( {
			params: { domainName: 'woo.test.boston' },
			availability: buildAvailability( {
				domain_name: 'woo.test.boston',
				tld: 'boston',
				status: DomainAvailabilityStatus.UNKNOWN,
			} ),
		} );

		render(
			<TestDomainSearchWithSuggestions
				query="woo.test.boston"
				config={ { allowsUsingOwnDomain: true } }
			>
				<UnavailableSearchResult />
			</TestDomainSearchWithSuggestions>
		);

		await waitFor( () => screen.getByText( /domains are not available/i ) );

		expect( screen.getByText( /domains are not available/i ) ).toHaveTextContent(
			'.boston domains are not available for registration on WordPress.com.'
		);
	} );

	it( 'renders the TLD not supported temporarily message if the availability status is tld_not_supported_temporarily', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'woo.test.boston' },
			suggestions: [ buildSuggestion( { domain_name: 'test.boston' } ) ],
		} );

		mockGetAvailabilityQuery( {
			params: { domainName: 'woo.test.boston' },
			availability: buildAvailability( {
				domain_name: 'woo.test.boston',
				tld: 'boston',
				status: DomainAvailabilityStatus.TLD_NOT_SUPPORTED_TEMPORARILY,
			} ),
		} );

		render(
			<TestDomainSearchWithSuggestions
				query="woo.test.boston"
				config={ { allowsUsingOwnDomain: true } }
			>
				<UnavailableSearchResult />
			</TestDomainSearchWithSuggestions>
		);

		await waitFor( () => screen.getByText( /domains are temporarily not offered/i ) );

		expect( screen.getByText( /domains are temporarily not offered/i ) ).toHaveTextContent(
			'.boston domains are temporarily not offered on WordPress.com. Please try again later or choose a different extension.'
		);
	} );

	describe( 'bring it over cta', () => {
		it( 'calls onExternalDomainClick if config.allowsUsingOwnDomain is true', async () => {
			const onExternalDomainClick = jest.fn();
			const user = userEvent.setup();

			mockGetSuggestionsQuery( {
				params: { query: 'woo.test.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test.com' } ) ],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'woo.test.com' },
				availability: buildAvailability( {
					domain_name: 'woo.test.com',
					tld: 'com',
					status: DomainAvailabilityStatus.TRANSFERRABLE,
				} ),
			} );

			render(
				<TestDomainSearchWithSuggestions
					query="woo.test.com"
					config={ { allowsUsingOwnDomain: true } }
					events={ { onExternalDomainClick } }
				>
					<UnavailableSearchResult />
				</TestDomainSearchWithSuggestions>
			);

			await user.click( await screen.findByText( 'Bring it over' ) );

			expect( onExternalDomainClick ).toHaveBeenCalledWith( 'test.com' );
		} );

		it( 'does not expose bring it over cta if config.allowsUsingOwnDomain is false', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'woo.test.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test.com' } ) ],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'woo.test.com' },
				availability: buildAvailability( {
					domain_name: 'woo.test.com',
					tld: 'com',
					status: DomainAvailabilityStatus.TRANSFERRABLE,
				} ),
			} );

			render(
				<TestDomainSearchWithSuggestions
					query="woo.test.com"
					config={ { allowsUsingOwnDomain: false } }
				>
					<UnavailableSearchResult />
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByText( /is already registered./ ) );

			expect( screen.queryByText( 'Bring it over' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders root domain name when the queried domain is a subdomain', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'woo.test.com' },
			suggestions: [ buildSuggestion( { domain_name: 'test.com' } ) ],
		} );

		mockGetAvailabilityQuery( {
			params: { domainName: 'woo.test.com' },
			availability: buildAvailability( {
				domain_name: 'woo.test.com',
				tld: 'com',
				status: DomainAvailabilityStatus.TRANSFERRABLE,
			} ),
		} );

		render(
			<TestDomainSearchWithSuggestions query="woo.test.com">
				<UnavailableSearchResult />
			</TestDomainSearchWithSuggestions>
		);

		expect( await screen.findByText( /is already registered./ ) ).toHaveTextContent(
			'test.com is already registered.'
		);
	} );

	describe( 'no unavailable search result message', () => {
		it( 'renders nothing if the availability query was not retrieved', async () => {
			const { container } = render(
				<TestDomainSearchWithSuggestions query="test">
					<UnavailableSearchResult />
				</TestDomainSearchWithSuggestions>
			);

			await waitForElementToBeRemoved( () => screen.getByText( 'LOADING_TEST_CONTENT' ) );

			expect( container ).toBeEmptyDOMElement();
		} );

		it.each( ALL_OTHER_STATUSES )(
			'renders nothing if the availability status is %s',
			async ( status ) => {
				mockGetSuggestionsQuery( {
					params: { query: `test-${ status }.com` },
					suggestions: [ buildSuggestion( { domain_name: `test-${ status }.com` } ) ],
				} );

				const availabilityQuery = mockGetAvailabilityQuery( {
					params: { domainName: `test-${ status }.com` },
					availability: buildAvailability( { status } ),
				} );

				const { container } = render(
					<TestDomainSearchWithSuggestions query={ `test-${ status }.com` }>
						<UnavailableSearchResult />
					</TestDomainSearchWithSuggestions>
				);

				await waitFor( () => expect( availabilityQuery.isDone() ).toBe( true ) );

				expect( container ).toBeEmptyDOMElement();
			}
		);
	} );
} );
