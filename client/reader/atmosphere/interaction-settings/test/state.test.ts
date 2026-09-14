import { DEFAULT_REPLY_ALLOW, applyReplyAllowRadio, toggleComboFlag } from '../state';

describe( 'interaction-settings state transitions', () => {
	it( 'has anyone as the default replyAllow', () => {
		expect( DEFAULT_REPLY_ALLOW ).toEqual( { kind: 'anyone' } );
	} );

	it( 'switching to Anyone clears any combo flags', () => {
		const next = applyReplyAllowRadio( 'anyone' );
		expect( next ).toEqual( { kind: 'anyone' } );
	} );

	it( 'switching to Nobody clears any combo flags', () => {
		const next = applyReplyAllowRadio( 'nobody' );
		expect( next ).toEqual( { kind: 'nobody' } );
	} );

	it( 'checking a combo flag from anyone transitions to combo', () => {
		const next = toggleComboFlag( { kind: 'anyone' }, 'following', true );
		expect( next ).toEqual( {
			kind: 'combo',
			follower: false,
			following: true,
			mention: false,
		} );
	} );

	it( 'checking a combo flag while already combo extends the combo', () => {
		const next = toggleComboFlag(
			{ kind: 'combo', follower: true, following: false, mention: false },
			'mention',
			true
		);
		expect( next ).toEqual( {
			kind: 'combo',
			follower: true,
			following: false,
			mention: true,
		} );
	} );

	it( 'unchecking the last combo flag falls back to anyone', () => {
		const next = toggleComboFlag(
			{ kind: 'combo', follower: false, following: true, mention: false },
			'following',
			false
		);
		expect( next ).toEqual( { kind: 'anyone' } );
	} );

	it( 'unchecking a combo flag while others remain stays in combo', () => {
		const next = toggleComboFlag(
			{ kind: 'combo', follower: true, following: true, mention: false },
			'following',
			false
		);
		expect( next ).toEqual( {
			kind: 'combo',
			follower: true,
			following: false,
			mention: false,
		} );
	} );

	it( 'toggling a combo flag has no effect when current is nobody', () => {
		const current = { kind: 'nobody' as const };
		const next = toggleComboFlag( current, 'follower', true );
		expect( next ).toBe( current );
	} );
} );
