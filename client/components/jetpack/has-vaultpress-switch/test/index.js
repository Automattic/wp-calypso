/** @jest-environment jsdom */
import { screen, render } from '@testing-library/react';
import HasVaultPressSwitch from 'calypso/components/jetpack/has-vaultpress-switch';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn().mockImplementation( ( selector ) => selector() ),
} ) );
jest.mock( 'calypso/state/ui/selectors/get-selected-site-id' );
jest.mock( 'calypso/state/selectors/get-rewind-state' );
jest.mock( 'calypso/state/selectors/get-site-scan-state' );
jest.mock( 'calypso/components/data/query-rewind-state', () => () => 'query-rewind-state' );
jest.mock( 'calypso/components/data/query-jetpack-scan', () => () => 'query-jetpack-scan' );

const LoadingComponent = <div data-testid="loading" />;
const TrueComponent = <div data-testid="true" />;
const FalseComponent = <div data-testid="false" />;

describe( 'HasVaultPressSwitch', () => {
	beforeAll( () => {
		getSelectedSiteId.mockImplementation( () => 314159265 );
	} );

	beforeEach( () => {
		getRewindState.mockClear();
	} );

	test( 'if neither rewindState nor scanState is available, show loading/query state', () => {
		getSiteScanState.mockImplementation( () => undefined );
		getRewindState.mockImplementation( () => undefined );

		render( <HasVaultPressSwitch loadingComponent={ LoadingComponent } /> );
		expect( screen.queryByTestId( 'loading' ) ).toBeVisible();
	} );

	test( 'if both rewindState and scanState show as uninitialized, show loading/query state', () => {
		getSiteScanState.mockImplementation( () => ( { state: 'uninitialized' } ) );
		getRewindState.mockImplementation( () => ( { state: 'uninitialized' } ) );

		render( <HasVaultPressSwitch loadingComponent={ LoadingComponent } /> );
		expect( screen.queryByTestId( 'loading' ) ).toBeVisible();
	} );

	test( 'if rewindState is unavailable with reason=vp_active_on_site, always show trueComponent', () => {
		getSiteScanState.mockImplementation( () => undefined );
		getRewindState.mockImplementation( () => ( {
			state: 'unavailable',
			reason: 'vp_active_on_site',
		} ) );

		render( <HasVaultPressSwitch trueComponent={ TrueComponent } /> );
		expect( screen.queryByTestId( 'true' ) ).toBeVisible();
	} );

	test( 'if scanState is unavailable with reason=vp_active_on_site, always show trueComponent', () => {
		getSiteScanState.mockImplementation( () => ( {
			state: 'unavailable',
			reason: 'vp_active_on_site',
		} ) );
		getRewindState.mockImplementation( () => undefined );

		render( <HasVaultPressSwitch trueComponent={ TrueComponent } /> );
		expect( screen.queryByTestId( 'true' ) ).toBeVisible();
	} );

	test( 'if rewindState is unavailable with reason=host_not_supported, always show trueComponent', () => {
		getSiteScanState.mockImplementation( () => undefined );
		getRewindState.mockImplementation( () => ( {
			state: 'unavailable',
			reason: 'host_not_supported',
		} ) );

		render( <HasVaultPressSwitch trueComponent={ TrueComponent } /> );
		expect( screen.queryByTestId( 'true' ) ).toBeVisible();
	} );

	test( 'if scanState is unavailable with reason=host_not_supported, always show trueComponent', () => {
		getSiteScanState.mockImplementation( () => ( {
			state: 'unavailable',
			reason: 'host_not_supported',
		} ) );
		getRewindState.mockImplementation( () => undefined );

		render( <HasVaultPressSwitch trueComponent={ TrueComponent } /> );
		expect( screen.queryByTestId( 'true' ) ).toBeVisible();
	} );

	test( 'if both rewindState and scanState are unavailable with other reasons, show falseComponent', () => {
		getSiteScanState.mockImplementation( () => ( {
			state: 'unavailable',
			reason: 'my_random_reason',
		} ) );
		getRewindState.mockImplementation( () => ( {
			state: 'unavailable',
			reason: 'another_weird_reason',
		} ) );

		render( <HasVaultPressSwitch falseComponent={ FalseComponent } /> );
		expect( screen.queryByTestId( 'false' ) ).toBeVisible();
	} );

	test( 'if both rewindState and scanState are not unavailable, show falseComponent', () => {
		getSiteScanState.mockImplementation( () => ( {
			state: 'idle',
			reason: 'vp_active_on_site',
		} ) );
		getRewindState.mockImplementation( () => ( {
			state: 'idle',
			reason: 'vp_active_on_site',
		} ) );

		render( <HasVaultPressSwitch falseComponent={ FalseComponent } /> );
		expect( screen.queryByTestId( 'false' ) ).toBeVisible();
	} );
} );
