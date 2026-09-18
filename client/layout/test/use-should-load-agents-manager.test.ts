/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useShouldLoadAgentsManager from '../use-should-load-agents-manager';

describe( 'useShouldLoadAgentsManager', () => {
	it( 'loads Agents Manager on site home', () => {
		const { result } = renderHook( () => useShouldLoadAgentsManager( 'home' ) );

		expect( result.current ).toBe( true );
	} );

	it.each( [ 'help', 'plugins', 'reader', undefined, null ] )(
		'does not load Agents Manager for %s',
		( sectionName ) => {
			const { result } = renderHook( () => useShouldLoadAgentsManager( sectionName ) );

			expect( result.current ).toBe( false );
		}
	);
} );
