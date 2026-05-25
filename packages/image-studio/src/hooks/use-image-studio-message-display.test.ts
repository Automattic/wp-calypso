import { renderHook } from '@testing-library/react';
import { useImageStudioMessageDisplay } from './use-image-studio-message-display';
import type { AgentMessage } from '../types/agenttic';

// Helper to create test messages with only the properties we need
const createMessages = ( msgs: Array< { role: string; timestamp: number } > ): AgentMessage[] =>
	msgs as AgentMessage[];

describe( 'useImageStudioMessageDisplay', () => {
	describe( 'when last message is from agent (display not enabled)', () => {
		it( 'returns empty array', () => {
			const messages = createMessages( [
				{ role: 'user', timestamp: 1000 },
				{ role: 'agent', timestamp: 2000 },
			] );

			const { result } = renderHook( () => useImageStudioMessageDisplay( messages ) );

			expect( result.current ).toEqual( [] );
		} );

		it( 'returns empty array when messages is undefined', () => {
			const { result } = renderHook( () => useImageStudioMessageDisplay( undefined ) );

			expect( result.current ).toEqual( [] );
		} );

		it( 'returns empty array when messages is empty', () => {
			const { result } = renderHook( () => useImageStudioMessageDisplay( [] ) );

			expect( result.current ).toEqual( [] );
		} );
	} );

	describe( 'when last message is from user (display is enabled)', () => {
		it( 'returns only last user message', () => {
			const messages = createMessages( [
				{ role: 'user', timestamp: 1000 },
				{ role: 'agent', timestamp: 2000 },
				{ role: 'user', timestamp: 3000 },
			] );

			const { result } = renderHook( () => useImageStudioMessageDisplay( messages ) );

			expect( result.current ).toEqual( [ { role: 'user', timestamp: 3000 } ] );
		} );

		it( 'returns only one user message when no agent messages exist', () => {
			const messages = createMessages( [
				{ role: 'user', timestamp: 1000 },
				{ role: 'user', timestamp: 2000 },
			] );

			const { result } = renderHook( () => useImageStudioMessageDisplay( messages ) );

			expect( result.current ).toEqual( [ { role: 'user', timestamp: 2000 } ] );
		} );
	} );

	describe( 'when display is enabled and agent replies', () => {
		it( 'returns last user and agent messages', () => {
			const initialMessages = createMessages( [ { role: 'user', timestamp: 1000 } ] );
			const updatedMessages = createMessages( [
				{ role: 'user', timestamp: 1000 },
				{ role: 'agent', timestamp: 2000 },
			] );

			const { result, rerender } = renderHook(
				( { messages } ) => useImageStudioMessageDisplay( messages ),
				{ initialProps: { messages: initialMessages } }
			);

			expect( result.current ).toEqual( [ { role: 'user', timestamp: 1000 } ] );

			rerender( { messages: updatedMessages } );

			expect( result.current ).toEqual( [
				{ role: 'user', timestamp: 1000 },
				{ role: 'agent', timestamp: 2000 },
			] );
		} );

		it( 'returns last user and agent after multiple exchanges', () => {
			const initialMessages = createMessages( [ { role: 'user', timestamp: 1000 } ] );
			const afterFirstReply = createMessages( [
				{ role: 'user', timestamp: 1000 },
				{ role: 'agent', timestamp: 2000 },
			] );
			const afterSecondUser = createMessages( [
				{ role: 'user', timestamp: 1000 },
				{ role: 'agent', timestamp: 2000 },
				{ role: 'user', timestamp: 3000 },
			] );
			const afterSecondReply = createMessages( [
				{ role: 'user', timestamp: 1000 },
				{ role: 'agent', timestamp: 2000 },
				{ role: 'user', timestamp: 3000 },
				{ role: 'agent', timestamp: 4000 },
			] );

			const { result, rerender } = renderHook(
				( { messages } ) => useImageStudioMessageDisplay( messages ),
				{ initialProps: { messages: initialMessages } }
			);

			expect( result.current ).toEqual( [ { role: 'user', timestamp: 1000 } ] );

			rerender( { messages: afterFirstReply } );
			expect( result.current ).toEqual( [
				{ role: 'user', timestamp: 1000 },
				{ role: 'agent', timestamp: 2000 },
			] );

			rerender( { messages: afterSecondUser } );
			expect( result.current ).toEqual( [ { role: 'user', timestamp: 3000 } ] );

			rerender( { messages: afterSecondReply } );
			expect( result.current ).toEqual( [
				{ role: 'user', timestamp: 3000 },
				{ role: 'agent', timestamp: 4000 },
			] );
		} );
	} );
} );
