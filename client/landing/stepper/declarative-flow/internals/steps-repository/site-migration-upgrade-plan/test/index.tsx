/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import useAddHostingTrialMutation from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import useCheckEligibilityMigrationTrialPlan from 'calypso/data/plans/use-check-eligibility-migration-trial-plan';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import plansReducer from 'calypso/state/plans/reducer';
import SiteMigrationUpgradePlan from '../';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';

jest.mock( 'calypso/landing/stepper/hooks/use-site' );
jest.mock( 'calypso/data/plans/use-check-eligibility-migration-trial-plan' );
jest.mock( 'calypso/data/hosting/use-add-hosting-trial-mutation' );

( useSite as jest.Mock ).mockReturnValue( {
	ID: 'site-id',
	URL: 'https://site-url.wordpress.com',
} );

( useCheckEligibilityMigrationTrialPlan as jest.Mock ).mockReturnValue( {
	data: { eligible: true },
} );

( useAddHostingTrialMutation as jest.Mock ).mockImplementation( ( { onSuccess } ) => ( {
	addHostingTrial: () => onSuccess(),
} ) );

describe( 'SiteMigrationUpgradePlan', () => {
	const render = ( props?: Partial< StepProps > ) => {
		const combinedProps = { ...mockStepProps( props ) };
		return renderStep( <SiteMigrationUpgradePlan { ...combinedProps } />, {
			reducers: {
				plans: plansReducer,
			},
		} );
	};

	it( 'selects business as default plan', async () => {
		const navigation = { submit: jest.fn() };
		render( { navigation } );

		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect( navigation.submit ).toHaveBeenCalledWith( {
			goToCheckout: true,
			plan: 'business',
		} );
	} );

	it( 'selects montly plan', async () => {
		const navigation = { submit: jest.fn() };
		render( { navigation } );

		await userEvent.click( screen.getByRole( 'button', { name: /Pay monthly/ } ) );
		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect( navigation.submit ).toHaveBeenCalledWith( {
			goToCheckout: true,
			plan: 'business-monthly',
		} );
	} );

	it( 'selects annually plan', async () => {
		const navigation = { submit: jest.fn() };
		render( { navigation } );

		await userEvent.click( screen.getByRole( 'button', { name: /Pay annually/ } ) );
		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect( navigation.submit ).toHaveBeenCalledWith( {
			goToCheckout: true,
			plan: 'business',
		} );
	} );

	it( 'selects free trial', async () => {
		const navigation = { submit: jest.fn() };
		render( { navigation } );

		await userEvent.click( screen.getByRole( 'button', { name: /Try 7 days for free/ } ) );
		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect( navigation.submit ).toHaveBeenCalledWith( {
			freeTrialSelected: true,
		} );
	} );
} );
