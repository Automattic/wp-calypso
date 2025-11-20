import { Message } from '../../../types';
import { getMessageUniqueIdentifier } from '../utils/get-message-unique-identifier';

describe( 'getMessageUniqueIdentifier', () => {
	it( 'returns message.metadata.temporary_id when present', () => {
		const message: Message = {
			content: 'test',
			role: 'user',
			type: 'message',
			metadata: {
				temporary_id: 'temp-123',
			},
		};

		expect( getMessageUniqueIdentifier( message ) ).toBe( 'temp-123' );
	} );

	it( 'returns message.message_id when temporary_id is not present', () => {
		const message: Message = {
			content: 'test',
			role: 'user',
			type: 'message',
			message_id: 456,
			metadata: {},
		};

		expect( getMessageUniqueIdentifier( message ) ).toBe( 456 );
	} );

	it( 'returns message.internal_message_id when temporary_id and message_id are not present', () => {
		const message: Message = {
			content: 'test',
			role: 'user',
			type: 'message',
			internal_message_id: 'internal-789',
			metadata: {},
		};

		expect( getMessageUniqueIdentifier( message ) ).toBe( 'internal-789' );
	} );

	it( 'returns message.metadata.local_timestamp when no other identifier is present but local_timestamp is', () => {
		const message: Message = {
			content: 'test',
			role: 'user',
			type: 'message',
			metadata: {
				local_timestamp: 1234567890,
			},
		};

		expect( getMessageUniqueIdentifier( message ) ).toBe( 1234567890 );
	} );

	it( 'returns the fallback string when no other identifier is present', () => {
		const message: Message = {
			content: 'test',
			role: 'user',
			type: 'message',
			metadata: {},
		};

		expect( getMessageUniqueIdentifier( message, 'fallback-value' ) ).toBe( 'fallback-value' );
	} );

	it( 'returns undefined when no identifier is present and no fallback is provided', () => {
		const message: Message = {
			content: 'test',
			role: 'user',
			type: 'message',
			metadata: {},
		};

		expect( getMessageUniqueIdentifier( message ) ).toBeUndefined();
	} );
} );
