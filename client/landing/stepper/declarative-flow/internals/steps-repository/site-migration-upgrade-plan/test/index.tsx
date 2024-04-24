/**
 * @jest-environment jsdom
 */
import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import useAddHostingTrialMutation from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import plansReducer from 'calypso/state/plans/reducer';
import SiteMigrationUpgradePlan from '../';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';

const planSlug = PLAN_MIGRATION_TRIAL_MONTHLY;

jest.mock( 'calypso/landing/stepper/hooks/use-site' );
jest.mock( 'calypso/data/hosting/use-add-hosting-trial-mutation' );

( useSite as jest.Mock ).mockReturnValue( {
	ID: 'site-id',
	URL: 'https://site-url.wordpress.com',
} );

( useAddHostingTrialMutation as jest.Mock ).mockImplementation( ( { onSuccess } ) => ( {
	addHostingTrial: () => onSuccess(),
} ) );

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const API_RESPONSE_EMAIL_VERIFIED = {
	eligible: true,
	error_code: 'email-verified',
};

const API_RESPONSE_EMAIL_UNVERIFIED = {
	eligible: false,
	error_code: 'email-unverified',
};

const mockTrialEligibilityAPI = ( payload: any ) => {
	mockApi()
		.get( `/wpcom/v2/sites/site-id/hosting/trial/check-eligibility/${ planSlug }` )
		.reply( 200, payload );
};

describe( 'SiteMigrationUpgradePlan', () => {
	const render = ( props?: Partial< StepProps > ) => {
		const combinedProps = { ...mockStepProps( props ) };
		return renderStep( <SiteMigrationUpgradePlan { ...combinedProps } />, {
			reducers: {
				plans: plansReducer,
			},
		} );
	};

	beforeAll( () => {
		nock.disableNetConnect();
		mockTrialEligibilityAPI( API_RESPONSE_EMAIL_VERIFIED );
	} );

	it( 'selects annual plan as default', async () => {
		const navigation = { submit: jest.fn() };
		render( { navigation } );

		await userEvent.click( screen.getByRole( 'button', { name: /Upgrade and migrate/ } ) );

		expect( navigation.submit ).toHaveBeenCalledWith( {
			goToCheckout: true,
			plan: 'business',
		} );
	} );

	it( 'selects the monthly plan', async () => {
		const navigation = { submit: jest.fn() };
		render( { navigation } );

		await userEvent.click( screen.getByRole( 'button', { name: /Pay monthly/ } ) );
		await userEvent.click( screen.getByRole( 'button', { name: /Upgrade and migrate/ } ) );

		expect( navigation.submit ).toHaveBeenCalledWith( {
			goToCheckout: true,
			plan: 'business-monthly',
		} );
	} );

	it( 'selects annual plan', async () => {
		const navigation = { submit: jest.fn() };
		render( { navigation } );

		await userEvent.click( screen.getByRole( 'button', { name: /Pay annually/ } ) );
		await userEvent.click( screen.getByRole( 'button', { name: /Upgrade and migrate/ } ) );

		expect( navigation.submit ).toHaveBeenCalledWith( {
			goToCheckout: true,
			plan: 'business',
		} );
	} );

	it( 'selects free trial', async () => {
		mockTrialEligibilityAPI( API_RESPONSE_EMAIL_VERIFIED );
		const navigation = { submit: jest.fn() };
		render( { navigation } );

		await waitFor( async () => {
			await userEvent.click( screen.getByRole( 'button', { name: /Try 7 days for free/ } ) );

			expect( navigation.submit ).toHaveBeenCalledWith( {
				freeTrialSelected: true,
			} );
		} );
	} );

	it( 'show the trial plan for verified users', async () => {
		nock.cleanAll();
		mockTrialEligibilityAPI( API_RESPONSE_EMAIL_VERIFIED );

		render( { data: { hideFreeMigrationTrialForNonVerifiedEmail: true } } );

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
