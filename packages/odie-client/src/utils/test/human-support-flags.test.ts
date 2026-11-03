import {
	getHumanSupportFlags,
	getLatestHumanSupportFlags,
	NO_HUMAN_SUPPORT_FLAGS,
	withHumanSupportFlags,
} from '../human-support-flags';
import type { Message } from '../../types';

const botMessage = ( flags: NonNullable< Message[ 'context' ] >[ 'flags' ] ): Message =>
	( {
		content: 'Let me connect you with a Happiness Engineer.',
		role: 'bot',
		type: 'message',
		context: { site_id: null, flags },
	} ) as Message;

describe( 'getHumanSupportFlags', () => {
	it( "reads the bot's flags", () => {
		expect(
			getHumanSupportFlags(
				botMessage( {
					forward_to_human_support: true,
					is_emergency: true,
					emergency_type: 'checkout_broken',
					route_to_email: false,
				} )
			)
		).toEqual( { isEmergency: true, emergencyType: 'checkout_broken', routeToEmail: false } );
	} );

	it( 'defaults to no flags', () => {
		expect( getHumanSupportFlags( botMessage( { forward_to_human_support: true } ) ) ).toEqual(
			NO_HUMAN_SUPPORT_FLAGS
		);
		expect( getHumanSupportFlags() ).toEqual( NO_HUMAN_SUPPORT_FLAGS );
	} );
} );

describe( 'getLatestHumanSupportFlags', () => {
	it( 'uses the latest message that asked for a human', () => {
		const messages = [
			botMessage( { forward_to_human_support: true, route_to_email: true } ),
			botMessage( { forward_to_human_support: true, is_emergency: true } ),
			botMessage( { show_ai_avatar: true } ),
		];

		expect( getLatestHumanSupportFlags( messages ) ).toEqual( {
			isEmergency: true,
			emergencyType: null,
			routeToEmail: false,
		} );
	} );

	it( 'has no flags when the bot never asked for a human', () => {
		expect( getLatestHumanSupportFlags( [ botMessage( { show_ai_avatar: true } ) ] ) ).toEqual(
			NO_HUMAN_SUPPORT_FLAGS
		);
		expect( getLatestHumanSupportFlags() ).toEqual( NO_HUMAN_SUPPORT_FLAGS );
	} );
} );

describe( 'withHumanSupportFlags', () => {
	const prompt = botMessage( { forward_to_human_support: true } );

	it( "carries the bot's flags onto a message shown in its place", () => {
		const message = withHumanSupportFlags(
			prompt,
			botMessage( {
				forward_to_human_support: true,
				is_emergency: true,
				emergency_type: 'site_down',
			} )
		);

		expect( message.context?.flags ).toEqual( {
			forward_to_human_support: true,
			is_emergency: true,
			emergency_type: 'site_down',
		} );
		// A request started from that message then keeps them.
		expect( getLatestHumanSupportFlags( [ message ] ) ).toEqual( {
			isEmergency: true,
			emergencyType: 'site_down',
			routeToEmail: false,
		} );
	} );

	it( 'leaves the message as it is when the bot sent no flags', () => {
		expect(
			withHumanSupportFlags( prompt, botMessage( { forward_to_human_support: true } ) ).context
				?.flags
		).toEqual( { forward_to_human_support: true } );
	} );
} );
