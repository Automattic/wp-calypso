/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Mock dependencies
 */
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn().mockImplementation( ( selector ) => selector() ),
} ) );
jest.mock( 'calypso/state/ui/selectors/get-selected-site-id' );
jest.mock( 'calypso/state/selectors/get-rewind-state' );
jest.mock( 'calypso/state/selectors/get-site-scan-state' );

/**
 * Internal dependencies
 */
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import HasVaultPressSwitch from 'calypso/components/jetpack/has-vaultpress-switch';

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

		const loading = <span>loading</span>;
		const hasVPSwitch = shallow( <HasVaultPressSwitch loadingComponent={ loading } /> );

		expect( hasVPSwitch.dive().contains( loading ) ).toEqual( true );
	} );

	test( 'if both rewindState and scanState show as uninitialized, show loading/query state', () => {
		getSiteScanState.mockImplementation( () => ( { state: 'uninitialized' } ) );
		getRewindState.mockImplementation( () => ( { state: 'uninitialized' } ) );

		const loading = <span>loading</span>;
		const hasVPSwitch = shallow( <HasVaultPressSwitch loadingComponent={ loading } /> );

		expect( hasVPSwitch.dive().contains( loading ) ).toEqual( true );
	} );

	test( 'if rewindState is unavailable with reason=vp_active_on_site, always show trueComponent', () => {
		getSiteScanState.mockImplementation( () => undefined );
		getRewindState.mockImplementation( () => ( {
			state: 'unavailable',
			reason: 'vp_active_on_site',
		} ) );

		const trueComponent = <span>true</span>;
		const hasVPSwitch = shallow( <HasVaultPressSwitch trueComponent={ trueComponent } /> );

		expect( hasVPSwitch.dive().contains( trueComponent ) ).toEqual( true );
	} );

	test( 'if scanState is unavailable with reason=vp_active_on_site, always show trueComponent', () => {
		getSiteScanState.mockImplementation( () => ( {
			state: 'unavailable',
			reason: 'vp_active_on_site',
		} ) );
		getRewindState.mockImplementation( () => undefined );

		const trueComponent = <span>true</span>;
		const hasVPSwitch = shallow( <HasVaultPressSwitch trueComponent={ trueComponent } /> );

		expect( hasVPSwitch.dive().contains( trueComponent ) ).toEqual( true );
	} );

	test( 'if rewindState is unavailable with reason=host_not_supported, always show trueComponent', () => {
		getSiteScanState.mockImplementation( () => undefined );
		getRewindState.mockImplementation( () => ( {
			state: 'unavailable',
			reason: 'host_not_supported',
		} ) );

		const trueComponent = <span>true</span>;
		const hasVPSwitch = shallow( <HasVaultPressSwitch trueComponent={ trueComponent } /> );

		expect( hasVPSwitch.dive().contains( trueComponent ) ).toEqual( true );
	} );

	test( 'if scanState is unavailable with reason=host_not_supported, always show trueComponent', () => {
		getSiteScanState.mockImplementation( () => ( {
			state: 'unavailable',
			reason: 'host_not_supported',
		} ) );
		getRewindState.mockImplementation( () => undefined );

		const trueComponent = <span>true</span>;
		const hasVPSwitch = shallow( <HasVaultPressSwitch trueComponent={ trueComponent } /> );

		expect( hasVPSwitch.dive().contains( trueComponent ) ).toEqual( true );
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

		const falseComponent = <span>false</span>;
		const hasVPSwitch = shallow( <HasVaultPressSwitch falseComponent={ falseComponent } /> );

		expect( hasVPSwitch.dive().contains( falseComponent ) ).toEqual( true );
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

		const falseComponent = <span>false</span>;
		const hasVPSwitch = shallow( <HasVaultPressSwitch falseComponent={ falseComponent } /> );

		expect( hasVPSwitch.dive().contains( falseComponent ) ).toEqual( true );
	} );
} );
