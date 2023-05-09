/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { JetpackConnectNotices } from '../jetpack-connect-notices';

const terminalErrorNoticeType = 'siteBlocked';
const nonTerminalErrorNoticeType = 'retryAuth';
const requiredProps = { translate: ( string ) => string };

describe( 'JetpackConnectNotices', () => {
	test( 'Should render notice', () => {
		const { container } = render(
			<JetpackConnectNotices { ...requiredProps } noticeType={ terminalErrorNoticeType } />
		);
		expect( container ).toMatchSnapshot();
	} );

	test( 'Should not render terminal notice if callback supplied', () => {
		const onTerminalError = jest.fn();
		const { container } = render(
			<JetpackConnectNotices
				{ ...requiredProps }
				noticeType={ terminalErrorNoticeType }
				onTerminalError={ onTerminalError }
			/>
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'Should call callback on terminal error', () => {
		const onTerminalError = jest.fn();
		render(
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
		const { container } = render(
			<JetpackConnectNotices
				{ ...requiredProps }
				noticeType={ nonTerminalErrorNoticeType }
				onTerminalError={ onTerminalError }
			/>
		);
		expect( onTerminalError ).not.toHaveBeenCalled();
		expect( container ).toMatchSnapshot();
	} );
} );
