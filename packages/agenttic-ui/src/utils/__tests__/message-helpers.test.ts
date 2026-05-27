import { describe, expect, it } from 'vitest';
import { getVisibleMessages } from '../message-helpers';
import type { Message } from '../../types';

const buildMessage = ( content: Message[ 'content' ] ): Message => ( {
	id: 'msg-1',
	role: 'agent',
	content,
	timestamp: 0,
	archived: false,
	showIcon: true,
} );

describe( 'getVisibleMessages', () => {
	it( 'strips `context` blocks', () => {
		const result = getVisibleMessages( [
			buildMessage( [
				{ type: 'text', text: 'visible' },
				{ type: 'context', text: 'hidden' },
			] ),
		] );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content ).toEqual( [
			{ type: 'text', text: 'visible' },
		] );
	} );

	it( 'strips `data` blocks (read programmatically, not rendered)', () => {
		const result = getVisibleMessages( [
			buildMessage( [
				{ type: 'text', text: 'reply' },
				{
					type: 'data',
					data: { sources: [ { title: 't', url: 'u' } ] },
				},
			] ),
		] );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content ).toEqual( [
			{ type: 'text', text: 'reply' },
		] );
	} );

	it( 'drops messages with no renderable content', () => {
		const result = getVisibleMessages( [
			buildMessage( [ { type: 'data', data: { route: 'premium' } } ] ),
			buildMessage( [ { type: 'context', text: 'hidden' } ] ),
			buildMessage( [ { type: 'text', text: 'visible' } ] ),
		] );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content ).toEqual( [
			{ type: 'text', text: 'visible' },
		] );
	} );

	it( 'preserves `text` and `component` blocks unchanged', () => {
		const Component = () => null;
		const result = getVisibleMessages( [
			buildMessage( [
				{ type: 'text', text: 'hi' },
				{ type: 'component', component: Component },
			] ),
		] );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].content ).toHaveLength( 2 );
	} );
} );
