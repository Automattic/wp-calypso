import { convertBigSkyMessageToUIMessage } from '../convert-big-sky-message';
import type { BigSkyMessage } from '../../types';

describe( 'convertBigSkyMessageToUIMessage', () => {
	it( 'maps the assistant role and second timestamps to the UI format', () => {
		const message = convertBigSkyMessageToUIMessage( {
			id: 'message-1',
			role: 'assistant',
			content: [ { type: 'text', text: 'Hi' } ],
			created_at: 1700000000,
		} as BigSkyMessage );

		expect( message ).toMatchObject( {
			id: 'message-1',
			role: 'agent',
			timestamp: 1700000000000,
			archived: false,
			showIcon: true,
		} );
	} );

	it( 'keeps the content and undeclared provider fields, such as the site build `context`', () => {
		const content = [ { type: 'text' as const, text: 'Building your site' } ];
		const context = { flags: { site_build: true } };

		const message = convertBigSkyMessageToUIMessage( {
			id: 'message-2',
			role: 'user',
			content,
			created_at: 1700000000,
			context,
		} as BigSkyMessage );

		expect( message ).toMatchObject( { id: 'message-2', role: 'user', content, context } );
	} );

	it( 'lists the editor empty-view suggestions under a message that asks for them', () => {
		const text = { type: 'text' as const, text: 'Your site is ready!' };

		const message = convertBigSkyMessageToUIMessage( {
			id: 'message-3',
			role: 'assistant',
			content: [ text ],
			created_at: 1700000000,
			hasEditorEmptyViewSuggestions: true,
		} );

		expect( message.content ).toEqual( [
			text,
			{
				type: 'component',
				component: expect.any( Function ),
				componentProps: { messageId: 'message-3' },
			},
		] );
	} );
} );
