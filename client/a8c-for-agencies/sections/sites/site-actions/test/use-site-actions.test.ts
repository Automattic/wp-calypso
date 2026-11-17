/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { renderHook } from '@testing-library/react';
import { useSiteActionsDataViews } from '../use-site-actions';
import type { SiteData } from '../../../../../jetpack-cloud/sections/agency-dashboard/sites-overview/types';

jest.mock( '@automattic/calypso-router', () => ( { __esModule: true, default: jest.fn() } ) );

const mockState = {
	a8cForAgencies: { agencies: { activeAgency: null, isAgencyClientUser: false } },
	currentUser: { capabilities: {} },
};

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => jest.fn(),
	useSelector: ( selector: ( state: typeof mockState ) => unknown ) => selector( mockState ),
} ) );

const buildItem = ( value: Record< string, unknown > ) =>
	( {
		site: {
			error: false,
			value: {
				blog_id: 123,
				url: 'example.com',
				url_with_scheme: 'https://example.com',
				is_atomic: false,
				is_simple: false,
				sticker: [],
				...value,
			},
		},
	} ) as unknown as SiteData;

const getIssueLicenseAction = () => {
	const { result } = renderHook( () =>
		useSiteActionsDataViews( {
			isLoading: false,
			isLargeScreen: true,
			setDataViewsState: jest.fn(),
			setSelectedSiteFeature: jest.fn(),
		} )
	);

	const action = result.current.find( ( { id } ) => id === 'issue_license' );
	if ( ! action ) {
		throw new Error( 'issue_license action not found' );
	}
	return action;
};

describe( 'useSiteActionsDataViews issue_license', () => {
	it( 'is offered on WordPress.com Atomic sites', () => {
		expect( getIssueLicenseAction().isEligible( buildItem( { is_atomic: true } ) ) ).toBe( true );
	} );

	it( 'opens Marketplace Products', () => {
		const action = getIssueLicenseAction();

		action.callback?.( [ buildItem( {} ) ] );

		expect( page ).toHaveBeenCalledWith( '/marketplace/products' );
	} );
} );
