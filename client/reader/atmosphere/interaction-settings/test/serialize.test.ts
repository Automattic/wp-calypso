import { serializeInteractionSettings, summarizeForTracks } from '../serialize';

describe( 'serializeInteractionSettings', () => {
	it( 'returns null when all defaults (anyone + quotes on)', () => {
		expect( serializeInteractionSettings( { kind: 'anyone' }, true ) ).toBeNull();
	} );

	it( 'serializes nobody', () => {
		expect( serializeInteractionSettings( { kind: 'nobody' }, true ) ).toEqual( {
			reply_allow: { kind: 'nobody' },
		} );
	} );

	it( 'serializes a single combo flag', () => {
		const wire = serializeInteractionSettings(
			{ kind: 'combo', follower: false, following: true, mention: false },
			true
		);
		expect( wire ).toEqual( {
			reply_allow: { kind: 'combo', following: true },
		} );
	} );

	it( 'serializes multiple combo flags', () => {
		const wire = serializeInteractionSettings(
			{ kind: 'combo', follower: true, following: false, mention: true },
			true
		);
		expect( wire ).toEqual( {
			reply_allow: { kind: 'combo', follower: true, mention: true },
		} );
	} );

	it( 'collapses a combo with no truthy flags to anyone (returns null when quotes also on)', () => {
		expect(
			serializeInteractionSettings(
				{ kind: 'combo', follower: false, following: false, mention: false },
				true
			)
		).toBeNull();
	} );

	it( 'serializes allow_quotes: false alongside replyAllow defaults', () => {
		expect( serializeInteractionSettings( { kind: 'anyone' }, false ) ).toEqual( {
			allow_quotes: false,
		} );
	} );

	it( 'serializes both', () => {
		expect(
			serializeInteractionSettings(
				{ kind: 'combo', follower: true, following: false, mention: false },
				false
			)
		).toEqual( {
			reply_allow: { kind: 'combo', follower: true },
			allow_quotes: false,
		} );
	} );
} );

describe( 'summarizeForTracks', () => {
	it( 'returns an empty object when all defaults', () => {
		expect( summarizeForTracks( { kind: 'anyone' }, true ) ).toEqual( {} );
	} );

	it( 'includes reply_allow_kind and allow_quotes for combo + quotes off', () => {
		expect(
			summarizeForTracks(
				{ kind: 'combo', follower: true, following: false, mention: false },
				false
			)
		).toEqual( {
			reply_allow_kind: 'combo',
			combo_follower: true,
			combo_following: false,
			combo_mention: false,
			allow_quotes: false,
		} );
	} );

	it( 'includes reply_allow_kind: nobody when nobody-only', () => {
		expect( summarizeForTracks( { kind: 'nobody' }, true ) ).toEqual( {
			reply_allow_kind: 'nobody',
		} );
	} );
} );
