/**
 * @jest-environment jsdom
 */
import {
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
	PlanSlug,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { HOSTED_SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import { useUpgradePlanHostingDetailsList } from 'calypso/blocks/importer/wordpress/upgrade-plan/hooks/use-get-upgrade-plan-hosting-details-list';
import useAddHostingTrialMutation from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { useSelectedPlanUpgradeQuery } from 'calypso/data/import-flow/use-selected-plan-upgrade';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import SiteMigrationUpgradePlan from '../';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';

const planSlug = PLAN_MIGRATION_TRIAL_MONTHLY;

jest.mock( 'calypso/landing/stepper/hooks/use-site' );
jest.mock( 'calypso/data/hosting/use-add-hosting-trial-mutation' );
jest.mock(
	'calypso/blocks/importer/wordpress/upgrade-plan/hooks/use-get-upgrade-plan-hosting-details-list'
);

jest.mock( 'calypso/data/import-flow/use-selected-plan-upgrade', () => {
	const original = jest.requireActual( 'calypso/data/import-flow/use-selected-plan-upgrade' );

	return {
		...original,
		useSelectedPlanUpgradeQuery: jest.fn(),
	};
} );

jest.mock( '@automattic/data-stores', () => {
	const dataStores = jest.requireActual( '@automattic/data-stores' );

	return {
		...dataStores,
		Plans: {
			...dataStores.Plans,
			usePricingMetaForGridPlans: jest.fn(),
		},
	};
} );

( useSite as jest.Mock ).mockReturnValue( {
	ID: 'site-id',
	URL: 'https://site-url.wordpress.com',
} );

( useAddHostingTrialMutation as jest.Mock ).mockImplementation( ( { onSuccess } ) => ( {
	addHostingTrial: () => onSuccess(),
} ) );

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

interface TrialEligibilityResponse {
	eligible: boolean;
	error_code: string;
}

const API_RESPONSE_EMAIL_VERIFIED = {
	eligible: true,
	error_code: 'email-verified',
};

const API_RESPONSE_EMAIL_UNVERIFIED = {
	eligible: false,
	error_code: 'email-unverified',
};

const mockTrialEligibilityAPI = ( payload: TrialEligibilityResponse ) => {
	mockApi()
		.get( `/wpcom/v2/sites/site-id/hosting/trial/check-eligibility/${ planSlug }` )
		.reply( 200, payload );
};

const mockUsePricingMetaForGridPlans = (
	plan: PlanSlug = PLAN_BUSINESS,
	billingPeriod: string = 'year'
) => {
	const planPricing = {
		currencyCode: 'USD',
		originalPrice: { full: 60, monthly: 5 },
		discountedPrice: { full: 24, monthly: 2 },
		billingPeriod: billingPeriod,
	};

	Plans.usePricingMetaForGridPlans.mockImplementation( () => ( {
		[ plan ]: planPricing,
	} ) );
};

const mockUseUpgradePlanHostingDetailsList = () => {
	( useUpgradePlanHostingDetailsList as jest.Mock ).mockReturnValue( {
		list: [],
		isFetching: false,
	} );
};

const mockUseSelectedPlanUpgradeQuery = ( visiblePlan ) => {
	( useSelectedPlanUpgradeQuery as jest.Mock ).mockReturnValue( {
		data: visiblePlan,
	} );
};

describe( 'SiteMigrationUpgradePlan', () => {
	const render = ( props?: Partial< StepProps > ) => {
		const combinedProps = { ...mockStepProps( props ) };

		const plansBaseData = {
			currencyCode: 'USD',
			rawPrice: 0,
			rawDiscount: 0,
		};

		return renderStep( <SiteMigrationUpgradePlan { ...combinedProps } />, {
			initialState: {
				sites: {
					plans: {
						'site-id': {
							data: [
								{
									...plansBaseData,
									productSlug: PLAN_BUSINESS,
								},
								{
									...plansBaseData,
									productSlug: PLAN_BUSINESS_MONTHLY,
								},
							],
						},
					},
				},
			},
		} );
	};

	beforeAll( () => {
		nock.disableNetConnect();
		mockTrialEligibilityAPI( API_RESPONSE_EMAIL_VERIFIED );
	} );

	beforeEach( () => {
		mockUsePricingMetaForGridPlans( PLAN_BUSINESS, 'year' );
		mockUseUpgradePlanHostingDetailsList();
		mockUseSelectedPlanUpgradeQuery( 'business' );
	} );

	it( 'selects the monthly plan', async () => {
		mockUsePricingMetaForGridPlans( PLAN_BUSINESS_MONTHLY, 'month' );
		mockUseSelectedPlanUpgradeQuery( 'business-monthly' );

		const navigation = { submit: jest.fn() };
		render( { navigation } );

		await userEvent.click( await screen.findByRole( 'button', { name: /Get Monthly/ } ) );

		expect( navigation.submit ).toHaveBeenCalledWith( {
			goToCheckout: true,
			plan: 'business-monthly',
		} );
	} );

	it( 'selects annual plan', async () => {
		const navigation = { submit: jest.fn() };
		render( { navigation } );

		await userEvent.click( await screen.findByRole( 'button', { name: /Get Yearly/ } ) );

		expect( navigation.submit ).toHaveBeenCalledWith( {
			goToCheckout: true,
			plan: 'business',
		} );
	} );

	it.skip( 'selects free trial', async () => {
		mockTrialEligibilityAPI( API_RESPONSE_EMAIL_VERIFIED );

		const navigation = { submit: jest.fn() };
		render( { navigation } );

		await waitFor( async () => {
			await userEvent.click( screen.getByRole( 'button', { name: /Try 7 days for free/ } ) );

			expect( navigation.submit ).toHaveBeenCalledWith( {
				goToCheckout: true,
				plan: 'wp_bundle_migration_trial_monthly',
				sendIntentWhenCreatingTrial: true,
			} );
		} );
	} );

	it.skip( 'show the trial plan for verified users', async () => {
		nock.cleanAll();
		mockTrialEligibilityAPI( API_RESPONSE_EMAIL_VERIFIED );

		render( {
			data: { hideFreeMigrationTrialForNonVerifiedEmail: true },
			flow: HOSTED_SITE_MIGRATION_FLOW,
		} );

		await waitFor( () => {
			expect( screen.queryByRole( 'button', { name: /Try 7 days for free/ } ) ).toBeInTheDocument();
		} );
	} );

	it( 'hides the trial plan for unverified users', async () => {
		nock.cleanAll();
		mockTrialEligibilityAPI( API_RESPONSE_EMAIL_UNVERIFIED );

		render( { data: { hideFreeMigrationTrialForNonVerifiedEmail: true } } );

		await waitFor( () => {
			expect(
				screen.queryByRole( 'button', { name: /Try 7 days for free/ } )
			).not.toBeInTheDocument();
		} );
	} );
} );
