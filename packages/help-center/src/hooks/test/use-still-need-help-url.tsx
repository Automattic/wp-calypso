/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import React from 'react';
import { HelpCenterRequiredContextProvider } from '../../contexts/HelpCenterContext';
import { useStillNeedHelpURL } from '../use-still-need-help-url';
import type { HelpCenterProduct } from '../../feature-config';

jest.mock( '../use-should-use-wapuu', () => ( {
	useShouldUseWapuu: () => true,
} ) );

function createWrapper( product?: HelpCenterProduct ) {
	return function Wrapper( { children }: { children: React.ReactNode } ) {
		return (
			<HelpCenterRequiredContextProvider
				value={ {
					// useStillNeedHelpURL never reads the user.
					currentUser: undefined as never,
					sectionName: 'help-center',
					product,
				} }
			>
				<>{ children }</>
			</HelpCenterRequiredContextProvider>
		);
	};
}

describe( 'useStillNeedHelpURL', () => {
	it( 'sends A4A partners to the contact form', () => {
		const { result } = renderHook( () => useStillNeedHelpURL(), {
			wrapper: createWrapper( 'a4a' ),
		} );

		expect( result.current.url ).toBe( '/contact-form' );
	} );

	it( 'sends the default product to the AI assistant', () => {
		const { result } = renderHook( () => useStillNeedHelpURL(), {
			wrapper: createWrapper(),
		} );

		expect( result.current.url ).toBe( '/odie' );
	} );
} );
