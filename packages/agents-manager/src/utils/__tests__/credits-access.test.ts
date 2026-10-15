import {
	getCreditsCtaType,
	getCreditsNoticeMessage,
	getCreditsPurchaseOptions,
	parseCreditsAccess,
} from '../credits-access';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	_n: ( single: string, plural: string, count: number ) => ( count === 1 ? single : plural ),
	sprintf: ( format: string, value: unknown ) => format.replace( '%s', String( value ) ),
} ) );

const UPGRADE_URL = 'https://wordpress.com/plans/123?source=wp_ai_credits';
const PLAN_OWNER_HINT =
	'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.';

describe( 'parseCreditsAccess', () => {
	it( 'reads both flags from the balance response', () => {
		expect( parseCreditsAccess( { can_buy_credits: true, can_upgrade: false } ) ).toEqual( {
			canBuyCredits: true,
			canUpgrade: false,
		} );
	} );

	it.each( [
		[ 'missing', {} ],
		[ 'null', { can_buy_credits: null, can_upgrade: null } ],
		[ 'not booleans', { can_buy_credits: 'yes', can_upgrade: 1 } ],
	] )( 'leaves out flags that are %s', ( _case, data ) => {
		expect( parseCreditsAccess( data ) ).toEqual( {
			canBuyCredits: undefined,
			canUpgrade: undefined,
		} );
	} );

	it.each( [ undefined, null, 'nope', [ true ] ] )( 'knows nothing from %p', ( data ) => {
		expect( parseCreditsAccess( data ) ).toEqual( {
			canBuyCredits: undefined,
			canUpgrade: undefined,
		} );
	} );
} );

describe( 'getCreditsPurchaseOptions', () => {
	it( 'offers Upgrade to the plan buyer', () => {
		expect(
			getCreditsPurchaseOptions( UPGRADE_URL, { canBuyCredits: true, canUpgrade: true } )
		).toEqual( { upgradeUrl: UPGRADE_URL } );
	} );

	// The server sends `can_upgrade: true` only to admins today; if that changes, the plan answer wins.
	it( 'offers Upgrade to someone who can upgrade the plan but can’t buy credits', () => {
		expect(
			getCreditsPurchaseOptions( UPGRADE_URL, { canBuyCredits: false, canUpgrade: true } )
		).toEqual( { upgradeUrl: UPGRADE_URL } );
	} );

	it( 'points someone who can’t buy to a site admin', () => {
		expect(
			getCreditsPurchaseOptions( UPGRADE_URL, { canBuyCredits: false, canUpgrade: false } )
		).toEqual( { askToUpgrade: 'site-admin', purchaseHint: 'Ask a site admin to add more.' } );
	} );

	it( 'points an admin who didn’t buy the plan to the plan owner', () => {
		expect(
			getCreditsPurchaseOptions( UPGRADE_URL, { canBuyCredits: true, canUpgrade: false } )
		).toEqual( { askToUpgrade: 'plan-owner', purchaseHint: PLAN_OWNER_HINT } );
	} );

	it( 'points to the plan owner when the server says only that the user can’t upgrade', () => {
		expect( getCreditsPurchaseOptions( UPGRADE_URL, { canUpgrade: false } ) ).toEqual( {
			askToUpgrade: 'plan-owner',
			purchaseHint: PLAN_OWNER_HINT,
		} );
	} );

	it.each( [
		[ 'no answer', undefined ],
		[ 'no flags', {} ],
		[ 'no plan answer to an admin', { canBuyCredits: true } ],
		[ 'no plan answer to someone who can’t buy', { canBuyCredits: false } ],
	] )( 'offers nothing when the server gives %s', ( _case, access ) => {
		expect( getCreditsPurchaseOptions( UPGRADE_URL, access ) ).toEqual( {} );
	} );

	it.each( [
		[ 'the plan buyer', { canBuyCredits: true, canUpgrade: true } ],
		[ 'someone who can’t buy', { canBuyCredits: false, canUpgrade: false } ],
		[ 'an admin who didn’t buy the plan', { canBuyCredits: true, canUpgrade: false } ],
	] )( 'offers %s nothing on a plan without an upgrade', ( _who, access ) => {
		expect( getCreditsPurchaseOptions( undefined, access ) ).toEqual( {} );
	} );
} );

describe( 'getCreditsCtaType', () => {
	it.each( [
		[ 'upgrade', true, undefined ],
		[ 'upgrade', true, 'site-admin' ],
		[ 'contact_admin', false, 'site-admin' ],
		[ 'contact_plan_owner', false, 'plan-owner' ],
		[ 'none', false, undefined ],
	] as const )( 'reports %s', ( ctaType, hasUpgradeLink, askToUpgrade ) => {
		expect( getCreditsCtaType( hasUpgradeLink, askToUpgrade ) ).toBe( ctaType );
	} );
} );

describe( 'getCreditsNoticeMessage', () => {
	it.each( [
		[ 'the plan buyer', undefined, 'You’ve used all your site credits.' ],
		[
			'someone who can’t buy',
			'site-admin',
			'You’ve used all your site credits. Ask a site admin to add more.',
		],
		[
			'an admin who didn’t buy the plan',
			'plan-owner',
			'You’ve used all your site credits. Ask the plan owner to upgrade.',
		],
	] as const )( 'tells %s the credits are all used', ( _who, askToUpgrade, message ) => {
		expect( getCreditsNoticeMessage( 'out', 0, askToUpgrade ) ).toBe( message );
	} );

	it.each( [
		[ 'the plan buyer', undefined, '6k credits left.' ],
		[ 'someone who can’t buy', 'site-admin', '6k credits left. Ask a site admin to add more.' ],
		[
			'an admin who didn’t buy the plan',
			'plan-owner',
			'6k credits left. Ask the plan owner to upgrade.',
		],
	] as const )( 'tells %s how many credits are left', ( _who, askToUpgrade, message ) => {
		expect( getCreditsNoticeMessage( 'low', 6_000, askToUpgrade ) ).toBe( message );
	} );

	it( 'uses the singular for the last credit', () => {
		expect( getCreditsNoticeMessage( 'low', 1, 'site-admin' ) ).toBe(
			'1 credit left. Ask a site admin to add more.'
		);
	} );
} );
