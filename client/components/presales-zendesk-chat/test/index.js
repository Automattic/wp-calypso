/**
 * @jest-environment jsdom
 */

import { loadScript } from '@automattic/load-script';
import { render } from '@testing-library/react';
import ZendeskChatWidget from '../index';

jest.mock( '@automattic/load-script', () => ( {
	loadScript: jest.fn( () => Promise.resolve() ),
} ) );

describe( 'ZendeskChatWidget', () => {
	beforeEach( () => {
		loadScript.mockReset();
	} );

	test( 'should not call loadScript when no chat key is passed', () => {
		render( <ZendeskChatWidget /> );
		expect( loadScript ).not.toHaveBeenCalled();
	} );

	test( 'should call loadScript with the correct params', () => {
		render( <ZendeskChatWidget chatKey="some-chat-id" /> );
		expect( loadScript ).toHaveBeenCalledWith( expect.stringMatching( /\/snippet.js/ ), undefined, {
			id: 'ze-snippet',
		} );
	} );
} );
