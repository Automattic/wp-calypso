/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { JetpackConnectNotices } from '../jetpack-connect-notices';

const terminalErrorNoticeType = 'notExists';
const nonTerminalErrorNoticeType = 'retryAuth';
const requiredProps = { translate: identity };

describe( 'JetpackConnectNotices', () => {
	test( 'Should render notice', () => {
		const wrapper = shallow(
			<JetpackConnectNotices { ...requiredProps } noticeType={ terminalErrorNoticeType } />
		);
		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.isEmptyRender() ).toBe( false );
	} );

	test( 'Should not render terminal notice if callback supplied', () => {
		const onTerminalError = jest.fn();
		const wrapper = shallow(
			<JetpackConnectNotices
				{ ...requiredProps }
				noticeType={ terminalErrorNoticeType }
				onTerminalError={ onTerminalError }
			/>
		);
		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.isEmptyRender() ).toBe( true );
	} );

	test( 'Should call callback on terminal error', () => {
		const onTerminalError = jest.fn();
		shallow(
			<JetpackConnectNotices
				{ ...requiredProps }
				noticeType={ terminalErrorNoticeType }
				onTerminalError={ onTerminalError }
			/>
		);
		expect( onTerminalError ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'Should render non-terminal notice if callback supplied', () => {
		const onTerminalError = jest.fn();
		const wrapper = shallow(
			<JetpackConnectNotices
				{ ...requiredProps }
				noticeType={ nonTerminalErrorNoticeType }
				onTerminalError={ onTerminalError }
			/>
		);
		expect( onTerminalError ).not.toHaveBeenCalled();
		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.isEmptyRender() ).toBe( false );
	} );
} );
