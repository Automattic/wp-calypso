/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import React from 'react';
import defaultCalypsoI18n from '../src';
import I18NContext from '../src/context';
import useFixMe from '../src/use-fix-me';

describe( 'useFixMe', () => {
	beforeEach( () => {
		defaultCalypsoI18n.setLocale( {
			'': {
				localeSlug: 'en',
			},
		} );
		jest.clearAllMocks();
	} );

	afterEach( () => {
		jest.clearAllMocks();
		defaultCalypsoI18n.configure(); // ensure everything is reset
	} );

	test( 'returns a new method bound whenever i18n locale changes', () => {
		const wrapper = ( { children } ) => (
			<I18NContext.Provider value={ defaultCalypsoI18n }>{ children }</I18NContext.Provider>
		);
		const { result } = renderHook( () => useFixMe(), { wrapper } );
		const initialFixMe = result.current;

		act( () =>
			defaultCalypsoI18n.setLocale( {
				'': {
					localeSlug: 'fr',
				},
			} )
		);

		expect( result.current ).not.toBe( initialFixMe );
	} );

	test( 'cleans up event listeners on unmount', () => {
		const wrapper = ( { children } ) => (
			<I18NContext.Provider value={ defaultCalypsoI18n }>{ children }</I18NContext.Provider>
		);
		const { unmount } = renderHook( () => useFixMe(), { wrapper } );

		// Spy on the off method to ensure it's called
		const offSpy = jest.spyOn( defaultCalypsoI18n, 'off' );

		unmount();
		expect( offSpy ).toHaveBeenCalled();
	} );
} );
