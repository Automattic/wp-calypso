/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import ZendeskChatWidget from '../index';

describe( 'ZendeskChatWidget', () => {
	test( 'should not include a script tag when no chat id is passed', () => {
		const { container } = render( <ZendeskChatWidget /> );
		expect( container.getElementsByTagName( 'script' ).length ).toBe( 0 );
	} );

	test( 'should contain the script tag and have the correct id', () => {
		const { container } = render( <ZendeskChatWidget chatKey="some-chat-id" /> );
		const scriptTags = container.getElementsByTagName( 'script' );
		expect( scriptTags.length ).toBe( 1 );
		expect( scriptTags[ 0 ].id ).toBe( 'ze-snippet' );
	} );
} );
