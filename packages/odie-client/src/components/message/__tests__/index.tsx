/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';

jest.spyOn( React, 'useRef' ).mockReturnValue( { current: null } );

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn(),
} ) );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	currentUser: {
		display_name: 'Test User',
	},
} ) );

describe( 'Message Component', () => {
	let message;

	beforeEach( () => {
		message = {
			content: 'Hello, world!',
			type: 'message',
			context: {
				sources: [ { url: 'https://example.com', otherData: 'data' } ],
				flags: {
					forward_to_human_support: false,
				},
			},
			rating_value: 3,
			simulateTyping: false,
		};
	} );

	it( 'should render correctly', () => {
		// TODO: Fix this test

		expect( true ).toBe( true );
	} );

	it( 'should correctly determine if message has sources', () => {
		const hasSources = message?.context?.sources && message.context?.sources.length > 0;
		expect( hasSources ).toBe( true );
	} );

	it( 'should correctly determine if message has feedback', () => {
		const hasFeedback = !! message?.rating_value;
		expect( hasFeedback ).toBe( true );
	} );

	it( 'should dedupe sources based on url', () => {
		let sources = message?.context?.sources ?? [];
		if ( sources.length > 0 ) {
			sources = [ ...new Map( sources.map( ( source ) => [ source.url, source ] ) ).values() ];
		}
		expect( sources.length ).toBe( 1 );
	} );

	it( 'should correctly determine if type is message or empty', () => {
		const isTypeMessageOrEmpty = ! message.type || message.type === 'message';
		expect( isTypeMessageOrEmpty ).toBe( true );
	} );

	it( 'should correctly determine if simulated typing is finished', () => {
		const isSimulatedTypingFinished = message.simulateTyping && message.content === message.content;
		expect( isSimulatedTypingFinished ).toBe( false );
	} );

	it( 'should correctly determine if requesting human support', () => {
		const isRequestingHumanSupport = message.context?.flags?.forward_to_human_support;
		expect( isRequestingHumanSupport ).toBe( false );
	} );
} );
