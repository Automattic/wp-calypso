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
jest.mock( 'state/ui/selectors/get-selected-site-id' );
jest.mock( 'state/selectors/get-rewind-state' );

/**
 * Internal dependencies
 */
import getSelectedSiteId from 'state/ui/selectors/get-selected-site-id';
import getRewindState from 'state/selectors/get-rewind-state';
import HasVaultPressSwitch from 'components/jetpack/has-vaultpress-switch';

describe( 'HasVaultPressSwitch', () => {
	beforeAll( () => {
		getSelectedSiteId.mockImplementation( () => 314159265 );
	} );

	beforeEach( () => {
		getRewindState.mockClear();
	} );

	test( 'if rewindState is unavailable, show loading/query state', () => {
		getRewindState.mockImplementation( () => undefined );

		const loading = <span>loading</span>;
		const hasVPSwitch = shallow( <HasVaultPressSwitch loadingComponent={ loading } /> );

		expect( hasVPSwitch.dive().contains( loading ) ).toEqual( true );
	} );

	test( 'if rewindState is unavailable with reason=vp_active_on_site, show trueComponent', () => {
		getRewindState.mockImplementation( () => ( {
			state: 'unavailable',
			reason: 'vp_active_on_site',
		} ) );

		const trueComponent = <span>true</span>;
		const hasVPSwitch = shallow( <HasVaultPressSwitch trueComponent={ trueComponent } /> );

		expect( hasVPSwitch.dive().contains( trueComponent ) ).toEqual( true );
	} );

	test( 'if rewindState is unavailable with other reason, show falseComponent', () => {
		getRewindState.mockImplementation( () => ( {
			state: 'unavailable',
			reason: 'my_random_reason',
		} ) );

		const falseComponent = <span>false</span>;
		const hasVPSwitch = shallow( <HasVaultPressSwitch falseComponent={ falseComponent } /> );

		expect( hasVPSwitch.dive().contains( falseComponent ) ).toEqual( true );
	} );

	test( 'if rewindState is not unavailable, show falseComponent', () => {
		getRewindState.mockImplementation( () => ( {
			state: 'idle',
			reason: 'vp_active_on_site',
		} ) );

		const falseComponent = <span>false</span>;
		const hasVPSwitch = shallow( <HasVaultPressSwitch falseComponent={ falseComponent } /> );

		expect( hasVPSwitch.dive().contains( falseComponent ) ).toEqual( true );
	} );
} );
