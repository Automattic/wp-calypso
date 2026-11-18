/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import useCopyAction from '../use-copy-action';
import type { UIMessage } from '@automattic/agenttic-client';

vi.mock(
	'@wordpress/element',
	async () => await vi.importActual< typeof import( 'react' ) >( 'react' )
);
vi.mock( '../../components/copy-action-button', () => ( { default: () => null } ) );
vi.mock( '@wordpress/i18n', () => ( { __: ( text: string ) => text } ) );

const createMessage = ( id: string, role: 'user' | 'agent', text: string ): UIMessage => ( {
	id,
	role,
	content: [ { type: 'text', text } ],
	timestamp: 0,
	archived: false,
	showIcon: true,
} );

describe( 'useCopyAction', () => {
	it( 'offers copy on an agent message with text', () => {
		const { result } = renderHook( () => useCopyAction() );

		expect( result.current( createMessage( 'm1', 'agent', 'Hello' ) ) ).toEqual( [
			expect.objectContaining( { componentProps: { text: 'Hello', messageId: 'm1' } } ),
		] );
	} );

	it( 'offers nothing on a user message', () => {
		const { result } = renderHook( () => useCopyAction() );

		expect( result.current( createMessage( 'm1', 'user', 'Hello' ) ) ).toEqual( [] );
	} );

	it( 'offers nothing on the browser’s own answer to /credits', () => {
		const { result } = renderHook( () => useCopyAction() );

		expect(
			result.current( createMessage( 'credits-command-1', 'agent', 'Here’s where it stands.' ) )
		).toEqual( [] );
	} );
} );
