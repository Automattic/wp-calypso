/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import plansReducer from 'calypso/state/plans/reducer';
import SiteMigrationUpgradePlan from '../';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';

jest.mock( 'calypso/landing/stepper/hooks/use-site' );

( useSite as jest.Mock ).mockReturnValue( {
	ID: 'site-id',
	URL: 'https://site-url.wordpress.com',
} );

describe( 'SiteMigrationUpgradePlan', () => {
	const render = ( props?: Partial< StepProps > ) => {
		const combinedProps = { ...mockStepProps( props ) };
		return renderStep( <SiteMigrationUpgradePlan { ...combinedProps } />, {
			reducers: {
				plans: plansReducer,
			},
		} );
	};

	beforeAll( () => nock.disableNetConnect() );

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
			goToCheckout: true,
			plan: 'business',
		} );
	} );
} );
