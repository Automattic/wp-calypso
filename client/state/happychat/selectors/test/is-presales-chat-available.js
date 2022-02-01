import isPresalesChatAvailable from '../is-presales-chat-available';

describe( '#isPresalesChatAvailable()', () => {
	test( 'should return false if presales chat is not available', () => {
		const isPresaleAvailable = isPresalesChatAvailable( {
			happychat: {
				user: {
					availability: {
						presale: false,
					},
				},
			},
		} );
		expect( isPresaleAvailable ).toBe( false );
	} );
	test( 'should return true if presales chat is available', () => {
		const isPresaleAvailable = isPresalesChatAvailable( {
			happychat: {
				user: {
					availability: {
						presale: true,
					},
				},
			},
		} );
		expect( isPresaleAvailable ).toBe( true );
	} );
} );
