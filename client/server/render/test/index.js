/**
 * Internal dependencies
 */
import { shouldServerSideRender, setShouldServerSideRender } from '..';

/**
 * A mutable hashmap that is used to create the current context (i.e. the values set here can be used as return
 * values for some specific methods that are being called). Each test can override these values by calling the remock
 * function.
 *
 * @see remock function for the default values.
 *
 * @type {{ojbect}}
 */
let mockReturnValues = {};

/**
 * Updates the values returned by the mocks. Combines the given parameters with the default ones, such that the the
 * tests can focus on what they really want to change and express that in the code.
 *
 * @see mockReturnValues
 *
 * @param {{object}} newReturnValues A key value set of properties that are combined with the defaults.
 */
function remock( newReturnValues ) {
	mockReturnValues = Object.assign(
		{
			isDefaultLocale: true,
			isSectionIsomorphic: true,
			configServerSideRender: true,
		},
		newReturnValues
	);
}

jest.mock( 'lib/i18n-utils', () => {
	return {
		isDefaultLocale: () => mockReturnValues.isDefaultLocale,
	};
} );

jest.mock( 'state/ui/selectors', () => {
	return {
		isSectionIsomorphic: () => mockReturnValues.isSectionIsomorphic,
	};
} );

jest.mock( 'config', () => {
	const fn = () => {};
	fn.isEnabled = ( feature_key ) =>
		feature_key === 'server-side-rendering' ? mockReturnValues.configServerSideRender : false;
	return fn;
} );

const ssrCompatibleContext = {
	layout: 'hello',
	user: null,
	store: {
		getState: () => {},
	},
	lang: 'en',
};

const ssrEnabledContext = {
	...ssrCompatibleContext,
	serverSideRender: true,
};

const ssrDisabledContext = {
	...ssrCompatibleContext,
	serverSideRender: false,
};

describe( 'shouldServerSideRender', () => {
	beforeEach( () => remock() );

	test( 'feature-flag server-side-render should enable SSR (default behavior)', () => {
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( true );
	} );

	test( 'feature-flag server-side-render should disable SSR', () => {
		remock( { configServerSideRender: false } );
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( false );
	} );

	test( 'context.serverSideRender should alter the result', () => {
		expect( shouldServerSideRender( ssrCompatibleContext ) ).toBe( false ); // due to undefined
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( true );
		expect( shouldServerSideRender( ssrDisabledContext ) ).toBe( false );
	} );

	test( 'context.layout should alter the result', () => {
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( true );

		const SsrEnabledContextWithoutLayout = {
			...ssrEnabledContext,
			layout: undefined,
		};
		expect( shouldServerSideRender( SsrEnabledContextWithoutLayout ) ).toBe( false );
	} );

	test( 'context.user should alter the result', () => {
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( true );

		const ssrEnabledContextWithUser = {
			...ssrEnabledContext,
			user: {
				name: 'hello-world',
			},
		};
		expect( shouldServerSideRender( ssrEnabledContextWithUser ) ).toBe( false );
	} );

	test( 'isSectionIsomorphic should alter the result', () => {
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( true );

		remock( { isSectionIsomorphic: false } );
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( false );
	} );

	test( 'isDefaultLocale should alter the result', () => {
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( true );

		remock( { isDefaultLocale: false } );
		expect( shouldServerSideRender( ssrEnabledContext ) ).toBe( false );
	} );
} );

describe( 'setShouldServerSideRender', () => {
	test( 'when query is empty, then sets context.serverSideRender to TRUE - and calls next()', () => {
		const next = jest.fn();
		const contextWithoutQueryKeys = {
			query: {},
		};

		setShouldServerSideRender( contextWithoutQueryKeys, next );
		expect( contextWithoutQueryKeys.serverSideRender ).toBe( true );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'when query has values, then sets context.serverSideRender to FALSE - and calls next()', () => {
		const next = jest.fn();
		const contextWithQueryKeys = {
			query: {
				hello: 'world',
			},
		};

		setShouldServerSideRender( contextWithQueryKeys, next );
		expect( contextWithQueryKeys.serverSideRender ).toBe( false );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );
} );
