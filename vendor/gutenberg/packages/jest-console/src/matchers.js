/**
 * External dependencies
 */
import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';
import { isEqual, reduce, some } from 'lodash';

/**
 * Internal dependencies
 */
import supportedMatchers from './supported-matchers';

const createToBeCalledMatcher = ( matcherName, methodName ) =>
	( received ) => {
		const spy = received[ methodName ];
		const calls = spy.mock.calls;
		const pass = calls.length > 0;
		const message = pass ?
			() =>
				matcherHint( `.not${ matcherName }`, spy.getMockName() ) +
				'\n\n' +
				'Expected mock function not to be called but it was called with:\n' +
				calls.map( printReceived ) :
			() =>
				matcherHint( matcherName, spy.getMockName() ) +
				'\n\n' +
				'Expected mock function to be called.';

		spy.assertionsNumber += 1;

		return {
			message,
			pass,
		};
	};

const createToBeCalledWithMatcher = ( matcherName, methodName ) =>
	( received, ...expected ) => {
		const spy = received[ methodName ];
		const calls = spy.mock.calls;
		const pass = some(
			calls,
			( objects ) => isEqual( objects, expected )
		);
		const message = pass ?
			() =>
				matcherHint( `.not${ matcherName }`, spy.getMockName() ) +
				'\n\n' +
				'Expected mock function not to be called with:\n' +
				printExpected( expected ) :
			() =>
				matcherHint( matcherName, spy.getMockName() ) +
				'\n\n' +
				'Expected mock function to be called with:\n' +
				printExpected( expected ) + '\n' +
				'but it was called with:\n' +
				calls.map( printReceived );

		spy.assertionsNumber += 1;

		return {
			message,
			pass,
		};
	};

expect.extend(
	reduce( supportedMatchers, ( result, matcherName, methodName ) => {
		const matcherNameWith = `${ matcherName }With`;

		return {
			...result,
			[ matcherName ]: createToBeCalledMatcher( `.${ matcherName }`, methodName ),
			[ matcherNameWith ]: createToBeCalledWithMatcher( `.${ matcherNameWith }`, methodName ),
		};
	}, {} )
);
