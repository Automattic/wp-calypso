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
} );
