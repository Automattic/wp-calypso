import { type DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchNotice } from '..';
import { buildAvailability } from '../../../test-helpers/factories/availability';
import { buildSuggestion } from '../../../test-helpers/factories/suggestions';
import { mockGetAvailabilityQuery } from '../../../test-helpers/queries/availability';
import { mockGetSuggestionsQuery } from '../../../test-helpers/queries/suggestions';
import { TestDomainSearchWithSuggestions } from '../../../test-helpers/renderer';

const AVAILABLE_DOMAIN_STATUSES = [
	DomainAvailabilityStatus.AVAILABLE,
	DomainAvailabilityStatus.UNKNOWN,
	DomainAvailabilityStatus.MAPPED_SAME_SITE_REGISTRABLE,
	DomainAvailabilityStatus.TRANSFERRABLE,
	DomainAvailabilityStatus.TRANSFERRABLE_PREMIUM,
];

const NON_GENERIC_MAPPED_DOMAIN_STATUSES = [
	DomainAvailabilityStatus.REGISTERED_SAME_SITE,
	DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER,
	DomainAvailabilityStatus.MAPPED_OTHER_SITE_SAME_USER_REGISTRABLE,
	DomainAvailabilityStatus.MAPPED_SAME_SITE_REGISTRABLE,
];

const RESTRICTED_DOMAIN_STATUSES = [
	DomainAvailabilityStatus.WPCOM_STAGING_DOMAIN,
	DomainAvailabilityStatus.DOTBLOG_SUBDOMAIN,
];

const GENERIC_MAPPED_DOMAIN_STATUSES = Object.values( DomainAvailabilityStatus ).filter(
	( status ) =>
		! NON_GENERIC_MAPPED_DOMAIN_STATUSES.includes( status ) &&
		! AVAILABLE_DOMAIN_STATUSES.includes( status ) &&
		! RESTRICTED_DOMAIN_STATUSES.includes( status )
);

const mockNoSuggestionsAndAvailability = ( query: string, availability: DomainAvailability ) => {
	mockGetSuggestionsQuery( {
		params: { query },
		suggestions: [],
	} );

	mockGetAvailabilityQuery( {
		params: { domainName: query },
		availability,
	} );
};

describe( 'SearchNotice', () => {
	it( 'renders the error notice from the suggestion query if that query failed', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'test-error' },
			suggestions: new Error( 'Failed to fetch the suggestions' ),
		} );

		render(
			<TestDomainSearchWithSuggestions query="test-error">
				<SearchNotice />
			</TestDomainSearchWithSuggestions>
		);

		expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

		const [ notice ] = screen.getAllByText( 'Failed to fetch the suggestions' );

		expect( notice ).toBeInTheDocument();
	} );

	it( 'renders the error notice from the availability query if that query failed', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'test-error.com' },
			suggestions: [ buildSuggestion( { domain_name: 'test-error.com' } ) ],
		} );

		mockGetAvailabilityQuery( {
			params: { domainName: 'test-error.com' },
			availability: new Error( 'Failed to fetch the availability' ),
		} );

		render(
			<TestDomainSearchWithSuggestions query="test-error.com">
				<SearchNotice />
			</TestDomainSearchWithSuggestions>
		);

		expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

		const [ notice ] = screen.getAllByText( 'Failed to fetch the availability' );

		expect( notice ).toBeInTheDocument();
	} );

	describe( 'regular availability notices', () => {
		it( 'renders an error notice if the availability status is registered', async () => {
			mockNoSuggestionsAndAvailability(
				'test-registered.com',
				buildAvailability( {
					domain_name: 'test-registered.com',
					tld: 'com',
					status: DomainAvailabilityStatus.REGISTERED,
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-registered.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'test-registered.com is already connected to a WordPress.com site.'
			);

			expect( notice ).toBeInTheDocument();
		} );

		it( 'renders an info notice if the availability status is registered_same_site', async () => {
			const user = userEvent.setup();
			mockNoSuggestionsAndAvailability(
				'test-registered-same-site.com',
				buildAvailability( {
					domain_name: 'test-registered-same-site.com',
					tld: 'com',
					status: DomainAvailabilityStatus.REGISTERED_SAME_SITE,
				} )
			);

			const onMakePrimaryAddressClick = jest.fn();

			render(
				<TestDomainSearchWithSuggestions
					query="test-registered-same-site.com"
					events={ { onMakePrimaryAddressClick } }
				>
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Information notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'test-registered-same-site.com is already registered on this site. Are you trying to make this the primary address for your site?'
			);

			expect( notice ).toBeInTheDocument();

			const cta = screen.getByText(
				'Are you trying to make this the primary address for your site?'
			);

			expect( cta ).toBeInTheDocument();

			await user.click( cta );

			expect( onMakePrimaryAddressClick ).toHaveBeenCalledWith( 'test-registered-same-site.com' );
		} );

		it( 'renders an info notice if the availability status is registered_other_site_same_user and there is no information about the other site', async () => {
			mockNoSuggestionsAndAvailability(
				'test-registered-other-site-same-user.com',
				buildAvailability( {
					domain_name: 'test-registered-other-site-same-user.com',
					tld: 'com',
					status: DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER,
					other_site_domain: undefined,
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-registered-other-site-same-user.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Information notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'test-registered-other-site-same-user.com is already registered on another site you own.'
			);

			expect( notice ).toBeInTheDocument();
		} );

		describe( 'registered_other_site_same_user without site context', () => {
			it( 'renders an info notice without a cta if the other site is a domain-only site', async () => {
				mockNoSuggestionsAndAvailability(
					'test-registered-other-site-same-user.com',
					buildAvailability( {
						domain_name: 'test-registered-other-site-same-user.com',
						tld: 'com',
						status: DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER,
						other_site_domain: 'other-site.com',
						other_site_domain_only: true,
					} )
				);

				render(
					<TestDomainSearchWithSuggestions query="test-registered-other-site-same-user.com">
						<SearchNotice />
					</TestDomainSearchWithSuggestions>
				);

				expect( await screen.findByText( 'Information notice' ) ).toBeInTheDocument();

				const [ notice ] = screen.getAllByText(
					'test-registered-other-site-same-user.com is already registered as a domain-only site.'
				);

				expect( notice ).toBeInTheDocument();

				expect( screen.queryByText( 'Do you want to' ) ).not.toBeInTheDocument();
			} );

			it( 'renders an info notice with a cta and the other site domain if the other site is not a domain-only site', async () => {
				mockNoSuggestionsAndAvailability(
					'test-registered-other-site-same-user.com',
					buildAvailability( {
						domain_name: 'test-registered-other-site-same-user.com',
						tld: 'com',
						status: DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER,
						other_site_domain: 'other-site.com',
						other_site_domain_only: false,
					} )
				);

				render(
					<TestDomainSearchWithSuggestions query="test-registered-other-site-same-user.com">
						<SearchNotice />
					</TestDomainSearchWithSuggestions>
				);

				expect( await screen.findByText( 'Information notice' ) ).toBeInTheDocument();

				const [ notice ] = screen.getAllByText(
					'test-registered-other-site-same-user.com is already registered on your site other-site.com.'
				);

				expect( notice ).toBeInTheDocument();

				expect( screen.queryByText( 'Do you want to' ) ).not.toBeInTheDocument();
			} );
		} );

		describe( 'registered_other_site_same_user with site context', () => {
			it( 'renders an info notice with a cta if the other site is a domain-only site', async () => {
				const user = userEvent.setup();

				mockGetSuggestionsQuery( {
					params: {
						query: 'test-registered-other-site-same-user.com',
						site_slug: 'current-site.com',
					},
					suggestions: [],
				} );

				mockGetAvailabilityQuery( {
					params: { domainName: 'test-registered-other-site-same-user.com' },
					availability: buildAvailability( {
						domain_name: 'test-registered-other-site-same-user.com',
						tld: 'com',
						status: DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER,
						other_site_domain: 'other-site.com',
						other_site_domain_only: true,
					} ),
				} );

				const onMoveDomainToSiteClick = jest.fn();

				render(
					<TestDomainSearchWithSuggestions
						query="test-registered-other-site-same-user.com"
						currentSiteUrl="current-site.com"
						events={ { onMoveDomainToSiteClick } }
					>
						<SearchNotice />
					</TestDomainSearchWithSuggestions>
				);

				expect( await screen.findByText( 'Information notice' ) ).toBeInTheDocument();

				const [ notice ] = screen.getAllByText(
					'test-registered-other-site-same-user.com is already registered as a domain-only site. Do you want to move it to this site ?'
				);

				expect( notice ).toBeInTheDocument();

				const cta = screen.getByText( 'move it to this site' );

				expect( cta ).toBeInTheDocument();

				await user.click( cta );

				expect( onMoveDomainToSiteClick ).toHaveBeenCalledWith(
					'other-site.com',
					'test-registered-other-site-same-user.com'
				);
			} );

			it( 'renders an info notice with a cta and the other site domain if the other site is not a domain-only site', async () => {
				const user = userEvent.setup();

				mockGetSuggestionsQuery( {
					params: {
						query: 'test-registered-other-site-same-user.com',
						site_slug: 'current-site.com',
					},
					suggestions: [],
				} );

				mockGetAvailabilityQuery( {
					params: { domainName: 'test-registered-other-site-same-user.com' },
					availability: buildAvailability( {
						domain_name: 'test-registered-other-site-same-user.com',
						tld: 'com',
						status: DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER,
						other_site_domain: 'other-site.com',
						other_site_domain_only: false,
					} ),
				} );

				const onMoveDomainToSiteClick = jest.fn();

				render(
					<TestDomainSearchWithSuggestions
						query="test-registered-other-site-same-user.com"
						currentSiteUrl="current-site.com"
						events={ { onMoveDomainToSiteClick } }
					>
						<SearchNotice />
					</TestDomainSearchWithSuggestions>
				);

				expect( await screen.findByText( 'Information notice' ) ).toBeInTheDocument();

				const [ notice ] = screen.getAllByText(
					'test-registered-other-site-same-user.com is already registered on your site other-site.com. Do you want to move it to this site ?'
				);

				expect( notice ).toBeInTheDocument();

				const cta = screen.getByText( 'move it to this site' );

				expect( cta ).toBeInTheDocument();

				await user.click( cta );

				expect( onMoveDomainToSiteClick ).toHaveBeenCalledWith(
					'other-site.com',
					'test-registered-other-site-same-user.com'
				);
			} );
		} );

		it( 'renders an error notice if the availability status is in_redemption', async () => {
			mockNoSuggestionsAndAvailability(
				'test-in-redemption.com',
				buildAvailability( {
					domain_name: 'test-in-redemption.com',
					tld: 'com',
					status: DomainAvailabilityStatus.IN_REDEMPTION,
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-in-redemption.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'test-in-redemption.com is not eligible to register or transfer since it is in redemption . If you own this domain, please contact your current registrar to redeem the domain .'
			);

			expect( notice ).toBeInTheDocument();

			expect( screen.getByRole( 'link', { name: 'redemption' } ) ).toHaveAttribute(
				'href',
				'https://www.icann.org/resources/pages/grace-2013-05-03-en'
			);

			expect( screen.getByRole( 'link', { name: 'redeem the domain' } ) ).toHaveAttribute(
				'href',
				'https://www.icann.org/news/blog/do-you-have-a-domain-name-here-s-what-you-need-to-know-part-5'
			);
		} );

		it( 'renders an error notice if the availability status is conflicting_cname_exists', async () => {
			mockNoSuggestionsAndAvailability(
				'test-conflicting-cname-exists.com',
				buildAvailability( {
					domain_name: 'test-conflicting-cname-exists.com',
					tld: 'com',
					status: DomainAvailabilityStatus.CONFLICTING_CNAME_EXISTS,
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-conflicting-cname-exists.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'There is an existing CNAME for test-conflicting-cname-exists.com . If you want to connect this subdomain, you should remove the conflicting CNAME DNS record first.'
			);

			expect( notice ).toBeInTheDocument();
		} );

		it( 'renders an info notice if the availability status is mapped_same_site_transferrable and there is a site context', async () => {
			const user = userEvent.setup();

			mockGetSuggestionsQuery( {
				params: { query: 'test-mapped-same-site-registrable.com', site_slug: 'current-site.com' },
				suggestions: [],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-mapped-same-site-registrable.com' },
				availability: buildAvailability( {
					domain_name: 'test-mapped-same-site-registrable.com',
					tld: 'com',
					status: DomainAvailabilityStatus.MAPPED_SAME_SITE_TRANSFERRABLE,
				} ),
			} );

			const onMoveDomainToSiteClick = jest.fn();

			render(
				<TestDomainSearchWithSuggestions
					query="test-mapped-same-site-registrable.com"
					currentSiteUrl="current-site.com"
					events={ { onMoveDomainToSiteClick } }
				>
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Information notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'test-mapped-same-site-registrable.com is already connected to this site, but registered somewhere else. Do you want to move it from your current domain provider to WordPress.com so you can manage the domain and the site together? Yes, transfer it to WordPress.com.'
			);

			expect( notice ).toBeInTheDocument();

			const cta = screen.getByText( 'Yes, transfer it to WordPress.com.' );

			expect( cta ).toBeInTheDocument();

			await user.click( cta );

			expect( onMoveDomainToSiteClick ).toHaveBeenCalledWith(
				'current-site.com',
				'test-mapped-same-site-registrable.com'
			);
		} );

		it( 'renders an error notice if the availability status is mapped_same_site_not_transferrable and it is not possible to transfer due to unsupported premium tld', async () => {
			mockNoSuggestionsAndAvailability(
				'test-mapped-same-site-not-transferrable.com',
				buildAvailability( {
					domain_name: 'test-mapped-same-site-not-transferrable.com',
					tld: 'com',
					status: DomainAvailabilityStatus.MAPPED_SAME_SITE_NOT_TRANSFERRABLE,
					cannot_transfer_due_to_unsupported_premium_tld: true,
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-mapped-same-site-not-transferrable.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'test-mapped-same-site-not-transferrable.com is already connected to this site and cannot be transferred to WordPress.com because premium domain transfers for the com TLD are not supported. Learn more .'
			);

			expect( notice ).toBeInTheDocument();

			expect( screen.getByRole( 'link', { name: 'Learn more' } ) ).toHaveAttribute(
				'href',
				'https://wordpress.com/support/domains/premium-domains/'
			);
		} );

		it( 'renders an error notice if the availability status is mapped_same_site_not_transferrable and it is not possible to transfer due to a different reason', async () => {
			mockNoSuggestionsAndAvailability(
				'test-mapped-same-site-not-transferrable.com',
				buildAvailability( {
					domain_name: 'test-mapped-same-site-not-transferrable.com',
					tld: 'com',
					status: DomainAvailabilityStatus.MAPPED_SAME_SITE_NOT_TRANSFERRABLE,
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-mapped-same-site-not-transferrable.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'test-mapped-same-site-not-transferrable.com is already connected to this site and cannot be transferred to WordPress.com. Learn more .'
			);

			expect( notice ).toBeInTheDocument();

			expect( screen.getByRole( 'link', { name: 'Learn more' } ) ).toHaveAttribute(
				'href',
				'https://wordpress.com/support/incoming-domain-transfer/#which-tl-ds-extensions-can-i-transfer-to-word-press-com'
			);
		} );

		it( 'renders an info notice if the availability status is mapped_other_site_same_user', async () => {
			mockNoSuggestionsAndAvailability(
				'test-mapped-other-site-same-user.com',
				buildAvailability( {
					domain_name: 'test-mapped-other-site-same-user.com',
					tld: 'com',
					status: DomainAvailabilityStatus.MAPPED_OTHER_SITE_SAME_USER,
					other_site_domain: 'other-site.com',
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-mapped-other-site-same-user.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Information notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'test-mapped-other-site-same-user.com is already connected to your site other-site.com. If you want to connect it to this site instead, we will be happy to help you do that. Contact us .'
			);

			expect( notice ).toBeInTheDocument();

			expect( screen.getByRole( 'link', { name: 'Contact us' } ) ).toHaveAttribute(
				'href',
				'/help?help-center=home'
			);
		} );

		it( 'renders an info notice if the availability status is mapped_other_site_same_user_registrable', async () => {
			const user = userEvent.setup();

			mockNoSuggestionsAndAvailability(
				'test-mapped-other-site-same-user-registrable.com',
				buildAvailability( {
					domain_name: 'test-mapped-other-site-same-user-registrable.com',
					tld: 'com',
					status: DomainAvailabilityStatus.MAPPED_OTHER_SITE_SAME_USER_REGISTRABLE,
					other_site_domain: 'other-site.com',
				} )
			);

			const onRegisterDomainClick = jest.fn();

			render(
				<TestDomainSearchWithSuggestions
					query="test-mapped-other-site-same-user-registrable.com"
					events={ { onRegisterDomainClick } }
				>
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Information notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'test-mapped-other-site-same-user-registrable.com is already connected to your site other-site.com. Register it to the connected site .'
			);

			expect( notice ).toBeInTheDocument();

			const cta = screen.getByText( 'Register it to the connected site' );

			expect( cta ).toBeInTheDocument();

			await user.click( cta );

			expect( onRegisterDomainClick ).toHaveBeenCalledWith(
				'other-site.com',
				'test-mapped-other-site-same-user-registrable.com'
			);
		} );

		it( 'renders an info notice if the availability status is transfer_pending_same_user', async () => {
			const user = userEvent.setup();
			mockNoSuggestionsAndAvailability(
				'test-transfer-pending-same-user.com',
				buildAvailability( {
					domain_name: 'test-transfer-pending-same-user.com',
					tld: 'com',
					status: DomainAvailabilityStatus.TRANSFER_PENDING_SAME_USER,
				} )
			);

			const onCheckTransferStatusClick = jest.fn();

			render(
				<TestDomainSearchWithSuggestions
					query="test-transfer-pending-same-user.com"
					events={ { onCheckTransferStatusClick } }
				>
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Information notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'test-transfer-pending-same-user.com is pending transfer. Check the transfer status to learn more.'
			);

			expect( notice ).toBeInTheDocument();

			const cta = screen.getByText( 'Check the transfer status' );

			expect( cta ).toBeInTheDocument();

			await user.click( cta );

			expect( onCheckTransferStatusClick ).toHaveBeenCalledWith(
				'test-transfer-pending-same-user.com'
			);
		} );

		it( 'renders an error notice if the availability status is transfer_pending', async () => {
			mockNoSuggestionsAndAvailability(
				'test-transfer-pending.com',
				buildAvailability( {
					domain_name: 'test-transfer-pending.com',
					tld: 'com',
					status: DomainAvailabilityStatus.TRANSFER_PENDING,
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-transfer-pending.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				"test-transfer-pending.com is pending transfer and can't be connected to WordPress.com right now. Learn more ."
			);

			expect( notice ).toBeInTheDocument();

			expect( screen.getByRole( 'link', { name: 'Learn more' } ) ).toHaveAttribute(
				'href',
				'https://wordpress.com/support/incoming-domain-transfer/#step-4-check-the-transfer-status'
			);
		} );

		it( 'renders an info notice if the availability status is not_registrable', async () => {
			mockNoSuggestionsAndAvailability(
				'test-not-registrable.com',
				buildAvailability( {
					domain_name: 'test-not-registrable.com',
					tld: 'com',
					status: DomainAvailabilityStatus.NOT_REGISTRABLE,
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-not-registrable.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Information notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'To use this domain on your site, you can register it elsewhere first and then add it here. Learn more .'
			);

			expect( notice ).toBeInTheDocument();

			expect( screen.getByRole( 'link', { name: 'Learn more' } ) ).toHaveAttribute(
				'href',
				'https://wordpress.com/support/domains/connect-existing-domain/'
			);
		} );

		describe( 'TLD maintenance notices', () => {
			it( 'renders an info notice without a specific maintenance end time if there is no maintenance end time', async () => {
				mockNoSuggestionsAndAvailability(
					'test-maintenance.com',
					buildAvailability( {
						domain_name: 'test-maintenance.com',
						tld: 'com',
						status: DomainAvailabilityStatus.MAINTENANCE,
					} )
				);

				render(
					<TestDomainSearchWithSuggestions query="test-maintenance.com">
						<SearchNotice />
					</TestDomainSearchWithSuggestions>
				);

				expect( await screen.findByText( 'Information notice' ) ).toBeInTheDocument();

				const [ notice ] = screen.getAllByText(
					'Domains ending with .com are undergoing maintenance. Please try a different extension or check back shortly.'
				);

				expect( notice ).toBeInTheDocument();
			} );

			it( 'renders an info notice with a specific maintenance end time if there is a maintenance end time', async () => {
				jest.useFakeTimers();
				jest.setSystemTime( new Date( '2025-01-01' ) );

				mockNoSuggestionsAndAvailability(
					'test-maintenance.com',
					buildAvailability( {
						domain_name: 'test-maintenance.com',
						tld: 'com',
						status: DomainAvailabilityStatus.MAINTENANCE,
						maintenance_end_time: ( new Date( '2025-01-02' ).getTime() / 1000 ).toString(),
					} )
				);

				render(
					<TestDomainSearchWithSuggestions query="test-maintenance.com">
						<SearchNotice />
					</TestDomainSearchWithSuggestions>
				);

				expect( await screen.findByText( 'Information notice' ) ).toBeInTheDocument();

				const [ notice ] = screen.getAllByText(
					'Domains ending with .com are undergoing maintenance. Please try a different extension or check back in a day.'
				);

				expect( notice ).toBeInTheDocument();

				jest.useRealTimers();
			} );
		} );

		describe( 'purchases disabled notices', () => {
			it( 'renders an info notice without a specific end time if there is no maintenance end time', async () => {
				mockNoSuggestionsAndAvailability(
					'test-purchases-disabled.com',
					buildAvailability( {
						domain_name: 'test-purchases-disabled.com',
						tld: 'com',
						status: DomainAvailabilityStatus.PURCHASES_DISABLED,
					} )
				);

				render(
					<TestDomainSearchWithSuggestions query="test-purchases-disabled.com">
						<SearchNotice />
					</TestDomainSearchWithSuggestions>
				);

				expect( await screen.findByText( 'Information notice' ) ).toBeInTheDocument();

				const [ notice ] = screen.getAllByText(
					'Domain registration is unavailable at this time. Please select a free subdomain or check back shortly.'
				);

				expect( notice ).toBeInTheDocument();
			} );

			it( 'renders an info notice with a specific end time if there is a maintenance end time', async () => {
				jest.useFakeTimers();
				jest.setSystemTime( new Date( '2025-01-01' ) );

				mockNoSuggestionsAndAvailability(
					'test-purchases-disabled.com',
					buildAvailability( {
						domain_name: 'test-purchases-disabled.com',
						tld: 'com',
						status: DomainAvailabilityStatus.PURCHASES_DISABLED,
						maintenance_end_time: ( new Date( '2025-01-02' ).getTime() / 1000 ).toString(),
					} )
				);

				render(
					<TestDomainSearchWithSuggestions query="test-purchases-disabled.com">
						<SearchNotice />
					</TestDomainSearchWithSuggestions>
				);

				expect( await screen.findByText( 'Information notice' ) ).toBeInTheDocument();

				const [ notice ] = screen.getAllByText(
					'Domain registration is unavailable at this time. Please select a free subdomain or check back in a day.'
				);

				expect( notice ).toBeInTheDocument();

				jest.useRealTimers();
			} );
		} );

		it( 'renders an error notice if the availability status is empty_results', async () => {
			mockNoSuggestionsAndAvailability(
				'test-empty-results.com',
				buildAvailability( {
					domain_name: 'test-empty-results.com',
					tld: 'com',
					status: DomainAvailabilityStatus.EMPTY_RESULTS,
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-empty-results.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				"Sorry, we weren't able to generate any domain name suggestions for that search term. Please try a different set of keywords."
			);

			expect( notice ).toBeInTheDocument();
		} );

		it( 'renders an error notice if the TLD is invalid', async () => {
			mockNoSuggestionsAndAvailability(
				'test-invalid.invalid',
				buildAvailability( {
					domain_name: 'test-invalid.invalid',
					tld: 'invalid',
					status: DomainAvailabilityStatus.INVALID_TLD,
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-invalid.invalid">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'Sorry, test-invalid.invalid does not appear to be a valid domain name.'
			);

			expect( notice ).toBeInTheDocument();
		} );

		it( 'renders an error notice if the domain is invalid', async () => {
			mockNoSuggestionsAndAvailability(
				'test-!!!invalid.com',
				buildAvailability( {
					domain_name: 'test-!!!invalid.com',
					tld: 'com',
					status: DomainAvailabilityStatus.INVALID,
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-!!!invalid.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'Sorry, test-!!!invalid.com does not appear to be a valid domain name.'
			);

			expect( notice ).toBeInTheDocument();
		} );

		it( 'renders an error notice if the domain expired recently', async () => {
			mockNoSuggestionsAndAvailability(
				'test-expired.com',
				buildAvailability( {
					domain_name: 'test-expired.com',
					tld: 'com',
					status: DomainAvailabilityStatus.RECENTLY_EXPIRED,
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-expired.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'This domain expired recently. To get it back please contact support .'
			);

			expect( notice ).toBeInTheDocument();

			expect( screen.getByRole( 'link', { name: 'contact support' } ) ).toHaveAttribute(
				'href',
				'/help?help-center=home'
			);
		} );

		it( 'renders an error notice if the domain suggestions retrieval is throttled', async () => {
			mockNoSuggestionsAndAvailability(
				'test-suggestions-throttled.com',
				buildAvailability( {
					domain_name: 'test-suggestions-throttled.com',
					tld: 'com',
					status: DomainAvailabilityStatus.DOMAIN_SUGGESTIONS_THROTTLED,
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-suggestions-throttled.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'You have made too many domain suggestions requests in a short time. Please wait a few minutes and try again.'
			);

			expect( notice ).toBeInTheDocument();
		} );

		describe( 'premium domain notices', () => {
			it( 'renders a site-specific error notice if the domain is premium but cant be registered with us', async () => {
				const user = userEvent.setup();

				mockGetSuggestionsQuery( {
					params: { query: 'test-premium.com', site_slug: 'test-site.com' },
					suggestions: [],
				} );

				mockGetAvailabilityQuery( {
					params: { domainName: 'test-premium.com' },
					availability: buildAvailability( {
						domain_name: 'test-premium.com',
						tld: 'com',
						status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
						is_supported_premium_domain: false,
					} ),
				} );

				const onMapDomainClick = jest.fn();

				render(
					<TestDomainSearchWithSuggestions
						query="test-premium.com"
						currentSiteUrl="test-site.com"
						events={ { onMapDomainClick } }
					>
						<SearchNotice />
					</TestDomainSearchWithSuggestions>
				);

				expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

				const [ notice ] = screen.getAllByText(
					"Sorry, test-premium.com is a premium domain. We don't support purchasing this premium domain on WordPress.com, but if you purchase the domain elsewhere, you can connect it to your site ."
				);

				expect( notice ).toBeInTheDocument();

				await user.click( screen.getByRole( 'button', { name: 'connect it to your site' } ) );

				expect( onMapDomainClick ).toHaveBeenCalledWith( 'test-premium.com' );
			} );

			it( 'renders a generic error notice if the domain is premium but cant be registered with us', async () => {
				mockNoSuggestionsAndAvailability(
					'test-premium.com',
					buildAvailability( {
						domain_name: 'test-premium.com',
						tld: 'com',
						status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
						is_supported_premium_domain: false,
					} )
				);

				render(
					<TestDomainSearchWithSuggestions query="test-premium.com">
						<SearchNotice />
					</TestDomainSearchWithSuggestions>
				);

				expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

				const [ notice ] = screen.getAllByText(
					"Sorry, test-premium.com is a premium domain. We don't support purchasing this premium domain on WordPress.com."
				);

				expect( notice ).toBeInTheDocument();
			} );
		} );

		it( 'renders an error notice if the domain is reserved by the registry', async () => {
			mockNoSuggestionsAndAvailability(
				'test-reserved.com',
				buildAvailability( {
					domain_name: 'test-reserved.com',
					tld: 'com',
					status: DomainAvailabilityStatus.AVAILABLE_RESERVED,
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-reserved.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				'Sorry, test-reserved.com is reserved by the .com registry and cannot be registered without permission.'
			);

			expect( notice ).toBeInTheDocument();
		} );

		it( 'renders an error notice if the query is too long', async () => {
			mockNoSuggestionsAndAvailability(
				'test-query-too-long.com',
				buildAvailability( {
					domain_name: 'test-query-too-long.com',
					tld: 'com',
					status: DomainAvailabilityStatus.INVALID_LENGTH,
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-query-too-long.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText( 'The domain name is too long.' );

			expect( notice ).toBeInTheDocument();
		} );

		it( 'renders an error notice is the domain availability query is throttled', async () => {
			mockNoSuggestionsAndAvailability(
				'test-availability-throttled.com',
				buildAvailability( {
					domain_name: 'test-availability-throttled.com',
					tld: 'com',
					status: DomainAvailabilityStatus.DOMAIN_AVAILABILITY_THROTTLED,
				} )
			);

			render(
				<TestDomainSearchWithSuggestions query="test-availability-throttled.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

			const [ notice ] = screen.getAllByText(
				"Unfortunately we're unable to check the status of test-availability-throttled.com at this moment. Please log in first or try again later."
			);

			expect( notice ).toBeInTheDocument();
		} );
	} );

	describe( 'mapped domain notices', () => {
		it.each( GENERIC_MAPPED_DOMAIN_STATUSES )(
			'renders the generic error notice if the availability status is %s',
			async ( status ) => {
				mockNoSuggestionsAndAvailability(
					`test-generic-${ status }.com`,
					buildAvailability( {
						domain_name: `test-generic-${ status }.com`,
						tld: 'com',
						status,
						mappable: DomainAvailabilityStatus.MAPPED,
					} )
				);

				render(
					<TestDomainSearchWithSuggestions query={ `test-generic-${ status }.com` }>
						<SearchNotice />
					</TestDomainSearchWithSuggestions>
				);

				expect( await screen.findByText( 'Error notice' ) ).toBeInTheDocument();

				const [ notice ] = screen.getAllByText(
					'This domain is already connected to a WordPress.com site.'
				);

				expect( notice ).toBeInTheDocument();
			}
		);

		it.each( NON_GENERIC_MAPPED_DOMAIN_STATUSES )(
			'renders a different notice if the availability status is %s',
			async ( status ) => {
				mockNoSuggestionsAndAvailability(
					`test-non-generic-${ status }.com`,
					buildAvailability( {
						domain_name: `test-non-generic-${ status }.com`,
						tld: 'com',
						status,
						mappable: DomainAvailabilityStatus.MAPPED,
					} )
				);

				render(
					<TestDomainSearchWithSuggestions query={ `test-non-generic-${ status }.com` }>
						<SearchNotice />
					</TestDomainSearchWithSuggestions>
				);

				await waitForElementToBeRemoved( () => screen.getByText( 'LOADING_TEST_CONTENT' ) );

				expect(
					screen.queryByText( 'This domain is already connected to a WordPress.com site.' )
				).not.toBeInTheDocument();
			}
		);
	} );

	describe( 'notice hidden scenarios', () => {
		it( 'renders nothing if there is no availability result', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test' },
				suggestions: [],
			} );

			/**
			 * As tested in the page/test/results.tsx file, if the user is not searching for a FQDN, then the general availability query
			 * for the search notice never gets triggered. This test would fail if the availability query was triggered.
			 */
			mockGetAvailabilityQuery( {
				params: { domainName: 'test-regular.com' },
				availability: new Error( 'This would fail if the availability query was triggered.' ),
			} );

			const { container } = render(
				<TestDomainSearchWithSuggestions query="test">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			await waitForElementToBeRemoved( () => screen.getByText( 'LOADING_TEST_CONTENT' ) );

			expect( container ).toBeEmptyDOMElement();
		} );

		it( 'renders nothing if the availability status is registered_other_site_same_user and config.includeOwnedDomainInSuggestions is true', async () => {
			mockGetSuggestionsQuery( {
				params: {
					query: 'test-registered-other-site-same-user.com',
					include_internal_move_eligible: true,
				},
				suggestions: [],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-registered-other-site-same-user.com' },
				availability: buildAvailability( {
					domain_name: 'test-registered-other-site-same-user.com',
					tld: 'com',
					status: DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER,
				} ),
			} );

			const { container } = render(
				<TestDomainSearchWithSuggestions
					query="test-registered-other-site-same-user.com"
					config={ { includeOwnedDomainInSuggestions: true } }
				>
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			await waitForElementToBeRemoved( () => screen.getByText( 'LOADING_TEST_CONTENT' ) );

			expect( container ).toBeEmptyDOMElement();
		} );

		it( 'renders nothing if it is a supported premium domain', async () => {
			mockNoSuggestionsAndAvailability(
				'test-supported-premium.com',
				buildAvailability( {
					domain_name: 'test-supported-premium.com',
					tld: 'com',
					status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
					is_supported_premium_domain: true,
				} )
			);

			const { container } = render(
				<TestDomainSearchWithSuggestions query="test-supported-premium.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			await waitForElementToBeRemoved( () => screen.getByText( 'LOADING_TEST_CONTENT' ) );

			expect( container ).toBeEmptyDOMElement();
		} );

		it( 'renders nothing if it is a wpcom staging domain', async () => {
			mockNoSuggestionsAndAvailability(
				'test.wpcomstaging.com',
				buildAvailability( {
					domain_name: 'test.wpcomstaging.com',
					tld: 'com',
					status: DomainAvailabilityStatus.WPCOM_STAGING_DOMAIN,
				} )
			);

			const { container } = render(
				<TestDomainSearchWithSuggestions query="test.wpcomstaging.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			await waitForElementToBeRemoved( () => screen.getByText( 'LOADING_TEST_CONTENT' ) );

			expect( container ).toBeEmptyDOMElement();
		} );

		it( 'renders nothing if it is a dotblog subdomain', async () => {
			mockNoSuggestionsAndAvailability(
				'test.photo.blog',
				buildAvailability( {
					domain_name: 'test.photo.blog',
					tld: 'blog',
					status: DomainAvailabilityStatus.DOTBLOG_SUBDOMAIN,
				} )
			);

			const { container } = render(
				<TestDomainSearchWithSuggestions query="test.photo.blog">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			await waitForElementToBeRemoved( () => screen.getByText( 'LOADING_TEST_CONTENT' ) );

			expect( container ).toBeEmptyDOMElement();
		} );

		it( 'renders nothing if it is a restricted subdomain', async () => {
			mockNoSuggestionsAndAvailability(
				'test.wordpress.com',
				buildAvailability( {
					domain_name: 'test.wordpress.com',
					tld: 'com',
					mappable: DomainAvailabilityStatus.RESTRICTED,
				} )
			);

			const { container } = render(
				<TestDomainSearchWithSuggestions query="test.wordpress.com">
					<SearchNotice />
				</TestDomainSearchWithSuggestions>
			);

			await waitForElementToBeRemoved( () => screen.getByText( 'LOADING_TEST_CONTENT' ) );

			expect( container ).toBeEmptyDOMElement();
		} );

		it.each( AVAILABLE_DOMAIN_STATUSES )(
			'renders nothing if the availability status is %s',
			async ( status ) => {
				mockNoSuggestionsAndAvailability(
					`test-regular-${ status }.com`,
					buildAvailability( {
						domain_name: `test-regular-${ status }.com`,
						tld: 'com',
						status,
					} )
				);

				const { container } = render(
					<TestDomainSearchWithSuggestions query={ `test-regular-${ status }.com` }>
						<SearchNotice />
					</TestDomainSearchWithSuggestions>
				);

				await waitForElementToBeRemoved( () => screen.getByText( 'LOADING_TEST_CONTENT' ) );

				expect( container ).toBeEmptyDOMElement();
			}
		);
	} );
} );
