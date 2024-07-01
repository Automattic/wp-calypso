/**
 * @jest-environment jsdom
 */
import { PLAN_BUSINESS } from '@automattic/calypso-products';
import { SiteDetails } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useSiteMigrateInfo } from 'calypso/blocks/importer/hooks/use-site-can-migrate';
import useCheckEligibilityMigrationTrialPlan from 'calypso/data/plans/use-check-eligibility-migration-trial-plan';
import { createReduxStore } from 'calypso/state';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import getSiteCredentialsRequestStatus from 'calypso/state/selectors/get-site-credentials-request-status';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import isRequestingSiteCredentials from 'calypso/state/selectors/is-requesting-site-credentials';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import { useUpgradePlanHostingDetailsList } from '../../../upgrade-plan/hooks/use-get-upgrade-plan-hosting-details-list';
import PreMigration from '../index';

const user = {
	ID: 1234,
	username: 'testUser',
	email: 'testemail@wordpress.com',
	email_verified: false,
};

const sourceSite: Partial< SiteDetails > = {
	ID: 777712,
	slug: 'self-hosted.example.com',
	URL: 'https://self-hosted.example.com',
};

const targetSite: Partial< SiteDetails > = {
	ID: 9123123,
	URL: 'https://example_test.wordpress.com',
};

const onContentOnlyClick = jest.fn();

jest.mock( 'react-router-dom', () => ( {
	...( jest.requireActual( 'react-router-dom' ) as object ),
	useLocation: jest.fn().mockImplementation( () => ( {
		pathname: '/setup/import-focused/importerWordpress',
		search: `?from=${ sourceSite.URL }&siteSlug=${ targetSite.URL }&option=everything`,
		hash: '',
		state: undefined,
	} ) ),
} ) );

jest.mock( 'calypso/blocks/importer/hooks/use-site-can-migrate' );
jest.mock( 'calypso/state/selectors/is-requesting-site-credentials' );
jest.mock( 'calypso/state/selectors/get-jetpack-credentials' );
jest.mock( 'calypso/data/plans/use-check-eligibility-migration-trial-plan' );
jest.mock( 'calypso/state/user-settings/selectors' );
jest.mock( 'calypso/state/selectors/get-user-setting' );
jest.mock( 'calypso/state/selectors/get-site-credentials-request-status' );
jest.mock( '../../../upgrade-plan/hooks/use-get-upgrade-plan-hosting-details-list' );

function renderPreMigrationScreen( props?: any ) {
	const initialState = getInitialState( initialReducer, user.ID );
	const reduxStore = createReduxStore(
		{
			...initialState,
			currentUser: {
				user: {
					...user,
				},
			},
			sites: {
				...initialState.sites,
				plans: {
					[ targetSite.ID as number ]: {
						data: [
							{
								currencyCode: 'USD',
								productSlug: PLAN_BUSINESS,
								rawPrice: 0,
								rawDiscount: 0,
							},
						],
					},
				},
			},
		},
		initialReducer
	);

	setStore( reduxStore, getStateFromCache( user.ID ) );
	const queryClient = new QueryClient();

	return render(
		<Provider store={ reduxStore }>
			<QueryClientProvider client={ queryClient }>
				<PreMigration { ...props } />
			</QueryClientProvider>
		</Provider>
	);
}

describe( 'PreMigration', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'should show Upgrade plan screen', () => {
		( useSiteMigrateInfo as jest.Mock ).mockReturnValue( {
			sourceSiteId: 777712,
			fetchMigrationEnabledStatus: jest.fn(),
			isFetchingData: false,
			siteCanMigrate: true,
			isInitFetchingDone: true,
		} );

		( useUpgradePlanHostingDetailsList as jest.Mock ).mockReturnValue( {
			list: [],
			isFetching: false,
		} );

		( useCheckEligibilityMigrationTrialPlan as jest.Mock ).mockReturnValue( {
			blog_id: 777712,
			eligible: false,
		} );

		renderPreMigrationScreen( {
			sourceSite: sourceSite,
			targetSite: targetSite,
			isTargetSitePlanCompatible: false,
			isMigrateFromWp: true,
			onContentOnlyClick,
		} );

		expect( screen.getByText( 'Take your site to the next level' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Upgrade and migrate' ) ).toBeInTheDocument();
		expect( screen.getByText( 'free content-only import option' ) ).toBeInTheDocument();

		// Click on "Use the content-only import option"
		const button = screen.getByText( 'free content-only import option' );
		fireEvent.click( button );
		expect( onContentOnlyClick ).toHaveBeenCalled();
	} );

	test( 'should show "Move to wordpress.com" plugin update', () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		useSiteMigrateInfo.mockReturnValue( {
			sourceSiteId: 777712,
			fetchMigrationEnabledStatus: jest.fn(),
			isFetchingData: false,
			siteCanMigrate: false,
			isInitFetchingDone: true,
		} );

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		useCheckEligibilityMigrationTrialPlan.mockImplementationOnce( () => ( {
			blog_id: 777712,
			eligible: true,
		} ) );

		renderPreMigrationScreen( {
			sourceSite: sourceSite,
			targetSite: targetSite,
			isTargetSitePlanCompatible: true,
			isMigrateFromWp: true,
			onContentOnlyClick,
		} );

		expect( screen.getByText( 'Update ‘Move to WordPress.com’' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Update plugin' ) ).toBeInTheDocument();
	} );

	test( 'should show "Jetpack" plugin update', () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		useSiteMigrateInfo.mockReturnValue( {
			sourceSiteId: 777712,
			fetchMigrationEnabledStatus: jest.fn(),
			isFetchingData: false,
			siteCanMigrate: false,
			isInitFetchingDone: true,
		} );

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		useCheckEligibilityMigrationTrialPlan.mockReturnValue( {
			blog_id: 777712,
			eligible: false,
		} );

		renderPreMigrationScreen( {
			sourceSite: sourceSite as SiteDetails,
			targetSite: targetSite,
			isTargetSitePlanCompatible: true,
			isMigrateFromWp: false,
			onContentOnlyClick,
		} );

		expect( screen.getAllByText( 'Install Jetpack' ).at( 0 ) ).toBeInTheDocument();
		expect( screen.getByText( 'Jetpack required' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Install Jetpack manually' ) ).toBeInTheDocument();
	} );

	test( 'should show migration ready screen', async () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		useSiteMigrateInfo.mockReturnValue( {
			sourceSiteId: 777712,
			fetchMigrationEnabledStatus: jest.fn(),
			isFetchingData: false,
			siteCanMigrate: true,
			isInitFetchingDone: true,
		} );

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		getSiteCredentialsRequestStatus.mockReturnValue( 'success' );

		renderPreMigrationScreen( {
			sourceSite: sourceSite,
			targetSite: targetSite,
			isTargetSitePlanCompatible: true,
			isMigrateFromWp: true,
			onContentOnlyClick,
		} );

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		isRequestingSiteCredentials.mockReturnValue( false );
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		isFetchingUserSettings.mockReturnValue( false );

		expect( screen.getByText( 'Your site is ready for its brand new home' ) ).toBeInTheDocument();

		const provideCredentialsBtn = screen.getByText( 'Provide the server credentials' );
		expect( provideCredentialsBtn ).toBeInTheDocument();

		fireEvent.click( screen.getByText( 'Start migration' ) );
		const confirmModal = await screen.findByText( 'Confirm your choice' );
		expect( confirmModal ).toBeInTheDocument();

		fireEvent.click( screen.getByText( 'Cancel' ) );
		expect( confirmModal ).not.toBeInTheDocument();

		fireEvent.click( provideCredentialsBtn );
		expect( screen.getByText( 'Do you need help locating your credentials?' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Start migration' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Skip credentials' ) ).toBeInTheDocument();

		const hostAddressInput = document.getElementById( 'host-address' ) as HTMLInputElement;
		expect( hostAddressInput.value ).toBe( sourceSite.slug );

		fireEvent.click( screen.getByText( 'Start migration' ) );
		expect( screen.getByText( 'Confirm your choice' ) ).toBeInTheDocument();
		fireEvent.click( screen.getByText( 'Continue' ) );
		expect(
			screen.getByText( 'Please make sure all fields are filled in correctly before proceeding.' )
		).toBeInTheDocument();
	} );

	test( 'should show credential form screen for developer account', async () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		useSiteMigrateInfo.mockReturnValue( {
			sourceSiteId: 777712,
			fetchMigrationEnabledStatus: jest.fn(),
			isFetchingData: false,
			siteCanMigrate: true,
			isInitFetchingDone: true,
		} );

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		getSiteCredentialsRequestStatus.mockReturnValue( 'success' );

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		getUserSetting.mockImplementation( ( state, settings ) => {
			if ( settings === 'is_dev_account' ) {
				return true;
			}
			return false;
		} );

		renderPreMigrationScreen( {
			sourceSite: sourceSite,
			targetSite: targetSite,
			isTargetSitePlanCompatible: true,
			isMigrateFromWp: true,
			onContentOnlyClick,
		} );
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		isRequestingSiteCredentials.mockReturnValue( false );
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		isFetchingUserSettings.mockReturnValue( false );

		await waitFor( () => {
			expect(
				screen.getByText( 'Do you need help locating your credentials?' )
			).toBeInTheDocument();
			expect( screen.getByText( 'Start migration' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Skip credentials' ) ).toBeInTheDocument();
		} );
	} );
} );
