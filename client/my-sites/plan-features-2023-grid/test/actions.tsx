/**
 * @jest-environment jsdom
 */
jest.mock( 'calypso/state/selectors/get-domain-from-home-upsell-in-query', () => jest.fn() );
jest.mock( 'calypso/components/external-link/with-tracking', () => jest.fn() );
jest.mock( 'classnames', () => jest.fn() );
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );
jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn(),
	combineReducers: jest.fn(),
	createReduxStore: jest.fn(),
	register: jest.fn(),
} ) );
jest.spyOn( '@wordpress/data', 'useDispatch' );
jest.mock( '@wordpress/element', () => ( {
	...jest.requireActual( '@wordpress/element' ),
	useCallback: jest.fn(),
} ) );
jest.mock( '@automattic/data-stores', () => ( {
	WpcomPlansUI: {
		store: null,
	},
} ) );
jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
} ) );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn(),
	useDispatch: jest.fn(),
} ) );

import { render, screen } from '@testing-library/react';
import { useDispatch } from '@wordpress/data';
import React from 'react';
import PlanFeatures2023GridActions from '../actions';

describe( 'PlanFeatures2023GridActions', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		// Re-mock dependencies
		const mockedDispatch = jest.spyOn( useDispatch as jest.Mock, 'mockReturnValue' );
		mockedDispatch.mockImplementation( () => ( { setShowDomainUpsellDialog: false } as any ) );
	} );

	test( 'should render', () => {
		render(
			<PlanFeatures2023GridActions
				availableForPurchase={ false }
				canUserPurchasePlan={ false }
				className=""
				currentSitePlanSlug="free_plan"
				current={ false }
				freePlan={ false }
				manageHref=""
				isInSignup={ false }
				onUpgradeClick={ jest.fn() }
				planName="free_plan"
				planType="free_plan"
				flowName=""
				isWpcomEnterpriseGridPlan={ false }
				selectedSiteSlug="foo"
			/>
		);
		expect( screen.getByRole( 'button' ) ).toBeInTheDocument();
	} );
} );
