/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React, { type ComponentPropsWithoutRef } from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { UpgradePlan } from '../index';

// Stub out UpgradePlanDetails because it has much more complex dependencies, and only provides a wrapper around the content from this component.
jest.mock( '../upgrade-plan-details', () => ( {
	__esModule: true,
	default: ( { children } ) => <div>{ children }</div>,
} ) );

jest.mock( '@automattic/calypso-analytics' );

function renderUpgradePlanComponent( props: ComponentPropsWithoutRef< typeof UpgradePlan > ) {
	const queryClient = new QueryClient();

	return renderWithProvider(
		<QueryClientProvider client={ queryClient }>
			<UpgradePlan { ...props } />
		</QueryClientProvider>,
		{
			initialState: {},
			reducers: {},
		}
	);
}

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
	upload_files: true,
	view_hosting: true,
	view_stats: true,
};

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

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const API_RESPONSE_ELIGIBLE = {
	eligible: true,
};

const API_RESPONSE_INELIGIBLE_UNVERIFIED_EMAIL = {
	eligible: true,
	error_code: 'email-unverified',
};

describe( 'UpgradePlan', () => {
	beforeAll( () => nock.disableNetConnect() );

	it( 'should call onCtaClick when the user clicks on the Continue button', async () => {
		const mockOnCtaClick = jest.fn();

		renderUpgradePlanComponent( getUpgradePlanProps( { onCtaClick: mockOnCtaClick } ) );

		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		await waitFor( () => expect( mockOnCtaClick ).toHaveBeenCalled() );
	} );

	it( 'should render a custom CTA and call OnCtaClick when ctaText is supplied', async () => {
		const mockOnCtaClick = jest.fn();

		renderUpgradePlanComponent(
			getUpgradePlanProps( { ctaText: 'My Custom CTA', onCtaClick: mockOnCtaClick } )
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
} );
