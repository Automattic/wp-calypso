/**
 * @jest-environment jsdom
 */
import { FEATURE_SSH, WPCOM_FEATURES_GITHUB_DEPLOYMENTS } from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { GitHubDeployments } from '..';

jest.mock( '../../components/page-shell', () => ( {
	PageShell: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
} ) );
jest.mock( '../../components/deployments-upsell-nudge', () => () => <div>Upsell nudge</div> );
jest.mock( '../../deployment-creation/deployment-creation-form', () => ( {
	GitHubDeploymentCreationForm: () => <div>Creation form</div>,
} ) );
jest.mock( '../use-code-deployments-query', () => ( {
	useCodeDeploymentsQuery: () => ( { data: [], isLoading: false, refetch: jest.fn() } ),
} ) );

const siteId = 1;

function renderWithFeatures( active: string[] ) {
	const store = configureStore()( {
		sites: {
			items: {},
			features: { [ siteId ]: { isRequesting: false, data: { active, available: {} } } },
		},
		ui: { selectedSiteId: siteId },
	} );

	return render(
		<Provider store={ store }>
			<GitHubDeployments />
		</Provider>
	);
}

describe( 'GitHubDeployments', () => {
	test( 'shows the upsell when the plan lacks the GitHub Deployments feature, even with SSH', () => {
		renderWithFeatures( [ FEATURE_SSH ] );

		expect( screen.getByText( 'Upsell nudge' ) ).toBeVisible();
		expect( screen.queryByText( 'Creation form' ) ).not.toBeInTheDocument();
	} );

	test( 'shows the deployments screen when the plan has the GitHub Deployments feature', () => {
		renderWithFeatures( [ WPCOM_FEATURES_GITHUB_DEPLOYMENTS ] );

		expect( screen.getByText( 'Creation form' ) ).toBeVisible();
		expect( screen.queryByText( 'Upsell nudge' ) ).not.toBeInTheDocument();
	} );
} );
