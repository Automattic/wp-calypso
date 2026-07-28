import { getFeedbackConfig } from '../config';
import { FeedbackType } from '../types';

describe( 'getFeedbackConfig', () => {
	it( 'returns the MemberInviteSent config with an interpolated email', () => {
		const config = getFeedbackConfig( FeedbackType.MemberInviteSent );
		expect( config ).toBeDefined();
		expect( config!.title ).toBe( 'Invite emailed!' );
		expect( config!.getDescription( { email: 'a@b.com' } ) ).toContain( 'a@b.com' );
		expect( config!.suggestion?.options ).toHaveLength( 4 );
		expect( config!.defaultReturnTo ).toBe( '/team' );
	} );

	it( 'returns undefined for an unknown type', () => {
		expect( getFeedbackConfig( 'nope' ) ).toBeUndefined();
	} );
} );
