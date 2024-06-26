/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { createDeployment, createDeploymentRun } from '../../test-utils';
import { DeploymentsListItemActions } from '../deployments-list-item-actions';

const siteSlug = 'mysite.wpcomstaging.com';

const initialState = {
	sites: {
		items: [],
		requesting: {},
		plans: {},
	},
	ui: {
		selectedSiteId: 1,
	},
	currentUser: {
		id: 12,
		user: {
			email_verified: true,
		},
	},
	notices: {
		items: [],
	},
};

describe( 'DeploymentsListItemActions', () => {
	test( 'does not let the user see logs if there are no runs', () => {
		const onManualDeployment = jest.fn();

		const mockStore = configureStore();
		const store = mockStore( initialState );

		const { getByText, getByLabelText } = render(
			<Provider store={ store }>
				<DeploymentsListItemActions
					siteSlug={ siteSlug }
					deployment={ createDeployment() }
					onManualDeployment={ onManualDeployment }
					onDisconnectRepository={ jest.fn() }
				/>
			</Provider>
		);

		fireEvent.click( getByLabelText( 'Deployment actions' ) );

		const triggerManualDeployButton = getByText( 'See deployment runs' );

		expect( triggerManualDeployButton ).toBeInTheDocument();
		expect( triggerManualDeployButton.parentElement ).toBeDisabled();
	} );

	test( 'lets the user see logs if there is at least one run', () => {
		const onManualDeployment = jest.fn();

		const mockStore = configureStore();
		const store = mockStore( initialState );

		const { getByText, getByLabelText } = render(
			<Provider store={ store }>
				<DeploymentsListItemActions
					siteSlug={ siteSlug }
					deployment={ createDeployment( {
						current_deployment_run: createDeploymentRun(),
					} ) }
					onManualDeployment={ onManualDeployment }
					onDisconnectRepository={ jest.fn() }
				/>
			</Provider>
		);

		fireEvent.click( getByLabelText( 'Deployment actions' ) );

		const triggerManualDeployButton = getByText( 'See deployment runs' );

		expect( triggerManualDeployButton ).toBeInTheDocument();
		expect( triggerManualDeployButton.parentElement ).not.toBeDisabled();
	} );
} );
