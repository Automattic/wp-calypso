/**
 * @format
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import JetpackConnectNotices from '../jetpack-connect-notices';

describe( 'JetpackConnectNotices', () => {
	test( 'Should render notice', () => {
		const component = renderer.create( <JetpackConnectNotices noticeType="notExists" /> );
		expect( component ).toMatchSnapshot();
	} );

	test( 'Should not render notice if callback supplied', () => {
		const onTerminalError = jest.fn();
		const component = renderer.create(
			<JetpackConnectNotices noticeType="notExists" onTerminalError={ onTerminalError } />
		);
		expect( onTerminalError ).toHaveBeenCalledTimes( 1 );
		expect( component ).toMatchSnapshot();
	} );

	test( 'Should render non-terminal notice if callback supplied', () => {
		const onTerminalError = jest.fn();
		const component = renderer.create(
			<JetpackConnectNotices noticeType="retryAuth" onTerminalError={ onTerminalError } />
		);
		expect( onTerminalError ).toHaveNotBeenCalled;
		expect( component ).toMatchSnapshot();
	} );
} );
