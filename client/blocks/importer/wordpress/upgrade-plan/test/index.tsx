/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { PLAN_MIGRATION_TRIAL_MONTHLY, PLAN_BUSINESS } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React, { type ComponentPropsWithoutRef } from 'react';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { useUpgradePlanHostingDetailsList } from '../hooks/use-get-upgrade-plan-hosting-details-list';
import { UpgradePlan, UnwrappedUpgradePlan } from '../index';

// Stub out UpgradePlanDetails because it has much more complex dependencies, and only provides a wrapper around the content from this component.
jest.mock( '../upgrade-plan-details', () => ( {
	__esModule: true,
	default: ( { children } ) => <div>{ children }</div>,
} ) );

jest.mock(
	'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase',
	() => jest.fn()
);

jest.mock( '@automattic/calypso-analytics' );

jest.mock( '../hooks/use-get-upgrade-plan-hosting-details-list' );

jest.mock( '@automattic/data-stores', () => {
	const dataStores = jest.requireActual( '@automattic/data-stores' );
	return {
		Onboard: dataStores.Onboard,
		Plans: {
			usePricingMetaForGridPlans: jest.fn(),
		},
		Purchases: dataStores.Purchases,
		Site: dataStores.Site,
	};
} );

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );
const mockUseUpgradePlanHostingDetailsList = ( isFetching: boolean ) => {
	( useUpgradePlanHostingDetailsList as jest.Mock ).mockReturnValue( {
		list: [],
		isFetching,
	} );
};

const mockUsePricingMetaForGridPlans = ( empty: boolean = false ) => {
	if ( empty ) {
		return;
	}

	const planYearlyPricing = {
		currencyCode: 'USD',
		originalPrice: { full: 60, monthly: 5 },
		discountedPrice: { full: 24, monthly: 2 },
		billingPeriod: 'year',
	};

	Plans.usePricingMetaForGridPlans.mockImplementation( () => ( {
		[ PLAN_BUSINESS ]: planYearlyPricing,
	} ) );
};

const CTA_TEXT = 'CTA';
const DEFAULT_SITE_ID = 123;
const DEFAULT_SITE_SLUG = 'test-example.wordpress.com';

const DEFAULT_SITE_CAPABILITIES = {
	activate_plugins: true,
	activate_wordads: true,
	delete_others_posts: true,
	delete_posts: true,
	delete_users: true,
	edit_others_pages: true,
	edit_others_posts: true,
	edit_pages: true,
	edit_posts: true,
	edit_theme_options: true,
	edit_users: true,
	list_users: true,
	manage_categories: true,
	manage_options: true,
	moderate_comments: true,
	own_site: true,
	promote_users: true,
	publish_posts: true,
	remove_users: true,
	update_plugins: true,
	upload_files: true,
	view_hosting: true,
	view_stats: true,
};

const API_RESPONSE_ELIGIBLE = {
	eligible: true,
};

const API_RESPONSE_INELIGIBLE_UNVERIFIED_EMAIL = {
	eligible: true,
	error_code: 'email-unverified',
};

function renderUpgradePlanComponent(
	props: ComponentPropsWithoutRef< typeof UpgradePlan >,
	Component = UpgradePlan
) {
	const queryClient = new QueryClient();

	return renderWithProvider(
		<QueryClientProvider client={ queryClient }>
			<Component { ...props } />
		</QueryClientProvider>,
		{
			initialState: {
				sites: {
					plans: {
						[ DEFAULT_SITE_ID ]: {
							data: [
								{
									currencyCode: 'USD',
									rawPrice: 0,
									rawDiscount: 0,
									productSlug: PLAN_BUSINESS,
								},
							],
						},
					},
				},
			},
			reducers: {},
		}
	);
}

function getUpgradePlanProps(
	customProps: Partial< ComponentPropsWithoutRef< typeof UpgradePlan > > = {}
): ComponentPropsWithoutRef< typeof UpgradePlan > {
	const defaultProps: ComponentPropsWithoutRef< typeof UpgradePlan > = {
		site: {
			ID: DEFAULT_SITE_ID,
			URL: 'https://test-example.wordpress.com',
			capabilities: DEFAULT_SITE_CAPABILITIES,
			description: 'test site',
			domain: 'test-example.wordpress.com',
			jetpack: false,
			launch_status: 'launched',
			locale: 'en',
			logo: { id: 'logo', sizes: [ '100x100' ], url: 'https://test-example.wordpress.com/logo' },
			name: 'Test Site',
			slug: DEFAULT_SITE_SLUG,
			title: 'Test Site',
		},
		isBusy: false,
		ctaText: '',
		navigateToVerifyEmailStep: () => {},
		onCtaClick: () => {},
	};

	return {
		...defaultProps,
		...customProps,
	};
}

describe( 'UpgradePlan', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		jest.clearAllMocks();
		mockUseUpgradePlanHostingDetailsList( false );
		mockUsePricingMetaForGridPlans();
		useCheckPlanAvailabilityForPurchase.mockImplementation( ( { planSlugs } ) =>
			planSlugs.reduce( ( acc, planSlug ) => {
				return {
					...acc,
					[ planSlug ]: true,
				};
			}, {} )
		);
	} );

	it( 'should call onCtaClick when the user clicks on the Continue button', async () => {
		const mockOnCtaClick = jest.fn();

		renderUpgradePlanComponent(
			getUpgradePlanProps( { onCtaClick: mockOnCtaClick } ),
			UnwrappedUpgradePlan
		);

		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		await waitFor( () => expect( mockOnCtaClick ).toHaveBeenCalled() );
	} );

	it( 'should render a custom CTA and call OnCtaClick when ctaText is supplied', async () => {
		const mockOnCtaClick = jest.fn();

		renderUpgradePlanComponent(
			getUpgradePlanProps( { ctaText: 'My Custom CTA', onCtaClick: mockOnCtaClick } ),
			UnwrappedUpgradePlan
		);

		await userEvent.click( screen.getByRole( 'button', { name: /My Custom CTA/ } ) );

		await waitFor( () => expect( mockOnCtaClick ).toHaveBeenCalled() );
	} );

	it( 'should trigger a Tracks event without custom event properties', async () => {
		nock.cleanAll();
		mockApi()
			.get(
				`/wpcom/v2/sites/${ DEFAULT_SITE_ID }/hosting/trial/check-eligibility/${ PLAN_MIGRATION_TRIAL_MONTHLY }`
			)
			.reply( 200, API_RESPONSE_ELIGIBLE );

		renderUpgradePlanComponent( getUpgradePlanProps() );

		await waitFor( () => {
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_site_migration_upgrade_plan_screen',
				{ migration_trial_hidden: 'false' }
			);
		} );
	} );

	it( 'should trigger a Tracks event with custom event properties', async () => {
		nock.cleanAll();
		mockApi()
			.get(
				`/wpcom/v2/sites/${ DEFAULT_SITE_ID }/hosting/trial/check-eligibility/${ PLAN_MIGRATION_TRIAL_MONTHLY }`
			)
			.reply( 200, API_RESPONSE_ELIGIBLE );

		const customEventProps = {
			custom_number: 123,
			custom_string: 'test',
		};
		renderUpgradePlanComponent( getUpgradePlanProps( { trackingEventsProps: customEventProps } ) );

		await waitFor( () => {
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_site_migration_upgrade_plan_screen',
				{ migration_trial_hidden: 'false', ...customEventProps }
			);
		} );
	} );

	it( 'should only show the main CTA when hideFreeMigrationTrialForNonVerifiedEmail is true and the user has an unverified email', async () => {
		nock.cleanAll();
		mockApi()
			.get(
				`/wpcom/v2/sites/${ DEFAULT_SITE_ID }/hosting/trial/check-eligibility/${ PLAN_MIGRATION_TRIAL_MONTHLY }`
			)
			.reply( 200, API_RESPONSE_INELIGIBLE_UNVERIFIED_EMAIL );

		renderUpgradePlanComponent(
			getUpgradePlanProps( { hideFreeMigrationTrialForNonVerifiedEmail: true } )
		);

		await waitFor( () => {
			expect( screen.queryByRole( 'button', { name: /Try 7 days for free/ } ) ).toBeNull();
			expect( screen.getByRole( 'button', { name: /Continue/ } ) ).toBeInTheDocument();
		} );
	} );

	it( 'should trigger a Tracks event that flags the trial as hidden', async () => {
		nock.cleanAll();
		mockApi()
			.get(
				`/wpcom/v2/sites/${ DEFAULT_SITE_ID }/hosting/trial/check-eligibility/${ PLAN_MIGRATION_TRIAL_MONTHLY }`
			)
			.reply( 200, API_RESPONSE_INELIGIBLE_UNVERIFIED_EMAIL );

		renderUpgradePlanComponent(
			getUpgradePlanProps( { hideFreeMigrationTrialForNonVerifiedEmail: true } )
		);

		await waitFor( () => {
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_site_migration_upgrade_plan_screen',
				{ migration_trial_hidden: 'true' }
			);
		} );
	} );

	describe( 'with migration sticker HOC', () => {
		it( 'should render children', async () => {
			const { queryByText } = renderUpgradePlanComponent(
				getUpgradePlanProps( { ctaText: CTA_TEXT } )
			);

			await waitFor( () => {
				expect( queryByText( CTA_TEXT ) ).toBeInTheDocument();
			} );
		} );

		it( 'should call the sticker endpoint creation when rendering the component', async () => {
			nock.cleanAll();
			const scope = nock( 'https://public-api.wordpress.com:443' )
				.post( `/wpcom/v2/sites/${ DEFAULT_SITE_ID }/migration-flow` )
				.reply( 200 );

			renderUpgradePlanComponent( getUpgradePlanProps( {} ) );

			await waitFor( () => {
				expect( scope.isDone() ).toBe( true );
			} );
		} );
	} );

	describe( 'without migration sticker HOC', () => {
		it( 'should render fetch state when hosting details are fetching', async () => {
			mockUseUpgradePlanHostingDetailsList( true );

			const { queryByText, container } = renderUpgradePlanComponent(
				getUpgradePlanProps( { ctaText: CTA_TEXT } ),
				UnwrappedUpgradePlan
			);

			expect(
				container.querySelector( '.import__upgrade-plan-details--loading' )
			).toBeInTheDocument();
			expect( queryByText( CTA_TEXT ) ).not.toBeInTheDocument();
		} );

		it( 'should render fetch state when pricing is not available', async () => {
			mockUseUpgradePlanHostingDetailsList( true );
			mockUsePricingMetaForGridPlans( true );

			const { queryByText, container } = renderUpgradePlanComponent(
				getUpgradePlanProps( { ctaText: CTA_TEXT } ),
				UnwrappedUpgradePlan
			);

			expect(
				container.querySelector( '.import__upgrade-plan-details--loading' )
			).toBeInTheDocument();
			expect( queryByText( CTA_TEXT ) ).not.toBeInTheDocument();
		} );
	} );
} );
