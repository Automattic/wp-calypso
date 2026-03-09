/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import SiteMigrationUpgradePlan from '../';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';

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

describe( 'SiteMigrationUpgradePlan', () => {
	const render = ( props?: Partial< StepProps > ) => {
		const combinedProps = { ...mockStepProps( props ) };

		return renderStep( <SiteMigrationUpgradePlan { ...combinedProps } /> );
	};

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

	it( 'does not render a free trial button', () => {
		const navigation = { submit: jest.fn() };
		render( { navigation } );

		expect( screen.queryByRole( 'button', { name: /Try a free 7-day trial/ } ) ).toBeNull();
	} );
} );
