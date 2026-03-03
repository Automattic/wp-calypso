/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import SiteMigrationUpgradePlan from '../';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';

const planSlug = PLAN_MIGRATION_TRIAL_MONTHLY;

// Mock MigrationPlansGrid with a simplified version that triggers onUpgradeClick
jest.mock( '../migration-plans-grid', () => {
	const { PLAN_BUSINESS, PLAN_BUSINESS_MONTHLY } = jest.requireActual(
		'@automattic/calypso-products'
	);
	return {
		__esModule: true,
		default: ( {
			onUpgradeClick,
		}: {
			onUpgradeClick: ( items: { product_slug: string }[] ) => void;
		} ) => (
			<div data-testid="migration-plans-grid">
				<button onClick={ () => onUpgradeClick( [ { product_slug: PLAN_BUSINESS_MONTHLY } ] ) }>
					Get Monthly
				</button>
				<button onClick={ () => onUpgradeClick( [ { product_slug: PLAN_BUSINESS } ] ) }>
					Get Yearly
				</button>
			</div>
		),
	};
} );

jest.mock( 'calypso/landing/stepper/hooks/use-site' );
jest.mock( 'calypso/landing/stepper/hooks/use-site-slug', () => ( {
	useSiteSlug: () => 'site-url.wordpress.com',
} ) );

( useSite as jest.Mock ).mockReturnValue( {
	ID: 'site-id',
	URL: 'https://site-url.wordpress.com',
} );

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

interface TrialEligibilityResponse {
	eligible: boolean;
	error_code: string;
}

const API_RESPONSE_EMAIL_VERIFIED = {
	eligible: true,
	error_code: 'email-verified',
};

const mockTrialEligibilityAPI = ( payload: TrialEligibilityResponse ) => {
	mockApi()
		.get( `/wpcom/v2/sites/site-id/hosting/trial/check-eligibility/${ planSlug }` )
		.reply( 200, payload );
};

describe( 'SiteMigrationUpgradePlan', () => {
	const render = ( props?: Partial< StepProps > ) => {
		const combinedProps = { ...mockStepProps( props ) };

		return renderStep( <SiteMigrationUpgradePlan { ...combinedProps } /> );
	};

	beforeAll( () => {
		nock.disableNetConnect();
		mockTrialEligibilityAPI( API_RESPONSE_EMAIL_VERIFIED );
	} );

	it( 'selects the monthly plan', async () => {
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

	it( 'selects the free trial', async () => {
		const navigation = { submit: jest.fn() };
		render( { navigation } );

		await userEvent.click(
			await screen.findByRole( 'button', { name: /Try a free 7-day trial/ } )
		);

		expect( navigation.submit ).toHaveBeenCalledWith( {
			goToCheckout: true,
			plan: PLAN_MIGRATION_TRIAL_MONTHLY,
			sendIntentWhenCreatingTrial: true,
		} );
	} );
} );
