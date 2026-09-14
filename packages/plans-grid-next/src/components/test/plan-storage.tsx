/**
 * @jest-environment jsdom
 */
/**
 * Default mock implementations
 */
jest.mock( '@automattic/data-stores', () => ( {
	AddOns: {
		useAvailableStorageAddOns: jest.fn(),
	},
} ) );
jest.mock( '../../grid-context', () => ( { usePlansGridContext: jest.fn() } ) );
jest.mock( '../shared/storage/components/storage-dropdown', () => {
	const ReactActual = jest.requireActual< typeof import('react') >( 'react' );

	return {
		__esModule: true,
		default: ( { openOnMount } ) =>
			ReactActual.createElement( 'div', {
				'data-open-on-mount': openOnMount ? 'true' : 'false',
				'data-testid': 'storage-dropdown',
			} ),
	};
} );
jest.mock( '../shared/storage/components/storage-feature-label', () => {
	const ReactActual = jest.requireActual< typeof import('react') >( 'react' );

	return {
		__esModule: true,
		default: ( { onAddMoreClick, showAddMore } ) =>
			showAddMore
				? ReactActual.createElement( 'button', { onClick: onAddMoreClick }, 'Add more' )
				: ReactActual.createElement( 'div', { 'data-testid': 'storage-label' } ),
	};
} );

import { PLAN_BUSINESS } from '@automattic/calypso-products';
import { AddOns } from '@automattic/data-stores';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { usePlansGridContext } from '../../grid-context';
import PlanStorage from '../shared/storage/components/plan-storage';

describe( 'PlanStorage', () => {
	const mockPlansGridContext = ( showFeatureCheckmarks: boolean ) => {
		( usePlansGridContext as jest.Mock ).mockReturnValue( {
			gridPlansIndex: {
				[ PLAN_BUSINESS ]: {
					availableForPurchase: true,
					current: false,
					planTitle: 'Business',
				},
			},
			showFeatureCheckmarks,
			siteId: 1,
		} );
	};

	beforeEach( () => {
		jest.clearAllMocks();
		( AddOns.useAvailableStorageAddOns as jest.Mock ).mockReturnValue( [
			{ addOnSlug: 'add-on-100gb-storage' },
		] );
	} );

	test( 'closes the redesign storage dropdown when clicking outside', async () => {
		mockPlansGridContext( true );

		render(
			<>
				<PlanStorage planSlug={ PLAN_BUSINESS } showUpgradeableStorage />
				<button type="button">Outside</button>
			</>
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'Add more' } ) );

		expect( screen.getByTestId( 'storage-dropdown' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'storage-dropdown' ) ).toHaveAttribute(
			'data-open-on-mount',
			'true'
		);

		await new Promise( ( resolve ) => window.setTimeout( resolve, 0 ) );

		fireEvent.click( screen.getByRole( 'button', { name: 'Outside' } ) );

		expect( screen.queryByTestId( 'storage-dropdown' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Add more' } ) ).toBeInTheDocument();
	} );

	test( 'keeps the control storage dropdown visible after clicking outside', () => {
		mockPlansGridContext( false );

		render(
			<>
				<PlanStorage planSlug={ PLAN_BUSINESS } showUpgradeableStorage />
				<button type="button">Outside</button>
			</>
		);

		expect( screen.getByTestId( 'storage-dropdown' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'storage-dropdown' ) ).toHaveAttribute(
			'data-open-on-mount',
			'false'
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'Outside' } ) );

		expect( screen.getByTestId( 'storage-dropdown' ) ).toBeInTheDocument();
	} );
} );
