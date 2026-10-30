import {
	getCreditsBackNotice,
	getCreditsCtaType,
	getCreditsNoticeMessage,
	getCreditsOutNotice,
	getCreditsRefusalNotice,
	getCreditsPurchaseAction,
	getCreditsPurchaseOptions,
	parseCreditsAccess,
} from '../credits-access';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	_n: ( single: string, plural: string, count: number ) => ( count === 1 ? single : plural ),
	sprintf: ( format: string, value: unknown ) => format.replace( '%s', String( value ) ),
} ) );

const UPGRADE_URL = 'https://wordpress.com/plans/123?source=wp_ai_credits';
const UPGRADE = { kind: 'upgrade', url: UPGRADE_URL } as const;
const TOP_UP_URL =
	'https://wordpress.com/checkout/123/ai-credits-lifetime:-q-100000?source=wp_ai_credits';
const TOP_UP = { kind: 'top_up', url: TOP_UP_URL } as const;
const SITE_ADMIN_HINT = {
	askToUpgrade: 'site-admin',
	purchaseHint: 'Ask a site admin to add more.',
} as const;
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
	describe( 'on a plan with an upgrade', () => {
		it( 'offers Upgrade to the plan buyer', () => {
			expect(
				getCreditsPurchaseOptions( UPGRADE, { canBuyCredits: true, canUpgrade: true } )
			).toEqual( { purchaseUrl: UPGRADE_URL, purchaseKind: 'upgrade' } );
		} );

		// The server sends `can_upgrade: true` only to admins today; if that changes, the plan answer wins.
		it( 'offers Upgrade to someone who can upgrade the plan but can’t buy credits', () => {
			expect(
				getCreditsPurchaseOptions( UPGRADE, { canBuyCredits: false, canUpgrade: true } )
			).toEqual( { purchaseUrl: UPGRADE_URL, purchaseKind: 'upgrade' } );
		} );

		it( 'points someone who can’t buy to a site admin', () => {
			expect(
				getCreditsPurchaseOptions( UPGRADE, { canBuyCredits: false, canUpgrade: false } )
			).toEqual( SITE_ADMIN_HINT );
		} );

		it( 'points an admin who didn’t buy the plan to the plan owner', () => {
			expect(
				getCreditsPurchaseOptions( UPGRADE, { canBuyCredits: true, canUpgrade: false } )
			).toEqual( { askToUpgrade: 'plan-owner', purchaseHint: PLAN_OWNER_HINT } );
		} );

		it( 'points to the plan owner when the server says only that the user can’t upgrade', () => {
			expect( getCreditsPurchaseOptions( UPGRADE, { canUpgrade: false } ) ).toEqual( {
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
			expect( getCreditsPurchaseOptions( UPGRADE, access ) ).toEqual( {} );
		} );
	} );

	describe( 'on a plan that sells a credits pack', () => {
		it.each( [
			[ 'the plan buyer', { canBuyCredits: true, canUpgrade: true } ],
			[ 'an admin who didn’t buy the plan', { canBuyCredits: true, canUpgrade: false } ],
			[ 'an admin when the server can’t tell who bought the plan', { canBuyCredits: true } ],
		] )( 'offers Add credits to %s', ( _who, access ) => {
			expect( getCreditsPurchaseOptions( TOP_UP, access ) ).toEqual( {
				purchaseUrl: TOP_UP_URL,
				purchaseKind: 'top_up',
			} );
		} );

		it.each( [
			[ 'with no plan answer', { canBuyCredits: false } ],
			[ 'even if the server says they can upgrade', { canBuyCredits: false, canUpgrade: true } ],
		] )( 'points someone who can’t buy to a site admin, %s', ( _case, access ) => {
			expect( getCreditsPurchaseOptions( TOP_UP, access ) ).toEqual( SITE_ADMIN_HINT );
		} );

		it.each( [
			[ 'no answer', undefined ],
			[ 'no flags', {} ],
			[ 'only a plan answer', { canUpgrade: true } ],
		] )( 'offers nothing when the server gives %s', ( _case, access ) => {
			expect( getCreditsPurchaseOptions( TOP_UP, access ) ).toEqual( {} );
		} );
	} );

	it.each( [
		[ 'the plan buyer', { canBuyCredits: true, canUpgrade: true } ],
		[ 'someone who can’t buy', { canBuyCredits: false, canUpgrade: false } ],
		[ 'an admin who didn’t buy the plan', { canBuyCredits: true, canUpgrade: false } ],
	] )( 'offers %s nothing on a plan without a purchase link', ( _who, access ) => {
		expect( getCreditsPurchaseOptions( undefined, access ) ).toEqual( {} );
	} );
} );

describe( 'getCreditsPurchaseAction', () => {
	it.each( [
		[ 'Upgrade', 'upgrade', UPGRADE_URL ],
		[ 'Add credits', 'top_up', TOP_UP_URL ],
	] as const )( 'labels the link %s and opens it in a new tab', ( label, purchaseKind, url ) => {
		expect( getCreditsPurchaseAction( { purchaseUrl: url, purchaseKind } ) ).toEqual( {
			label,
			href: url,
			target: '_blank',
			rel: 'noopener noreferrer',
		} );
	} );

	it( 'gives no button without a purchase link', () => {
		expect( getCreditsPurchaseAction( SITE_ADMIN_HINT ) ).toBeUndefined();
	} );
} );

describe( 'getCreditsCtaType', () => {
	it.each( [
		[ 'upgrade', 'upgrade', undefined ],
		[ 'top_up', 'top_up', undefined ],
		[ 'upgrade', 'upgrade', 'site-admin' ],
		[ 'contact_admin', undefined, 'site-admin' ],
		[ 'contact_plan_owner', undefined, 'plan-owner' ],
		[ 'none', undefined, undefined ],
	] as const )( 'reports %s', ( ctaType, purchaseKind, askToUpgrade ) => {
		expect( getCreditsCtaType( purchaseKind, askToUpgrade ) ).toBe( ctaType );
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

describe( 'getCreditsOutNotice', () => {
	it( 'stays until the balance changes, with the purchase action', () => {
		const action = { label: 'Add credits', href: TOP_UP_URL };
		expect( getCreditsOutNotice( 0, undefined, action ) ).toEqual( {
			icon: false,
			message: 'You’ve used all your site credits.',
			action,
			dismissible: false,
		} );
	} );

	it( 'points someone who can’t buy to a site admin, with no action', () => {
		expect( getCreditsOutNotice( 0, 'site-admin', undefined ) ).toEqual( {
			icon: false,
			message: 'You’ve used all your site credits. Ask a site admin to add more.',
			action: undefined,
			dismissible: false,
		} );
	} );
} );

describe( 'getCreditsBackNotice', () => {
	it( 'says so, with no action', () => {
		expect( getCreditsBackNotice() ).toEqual( {
			icon: false,
			message: 'Your site has credits again.',
			action: undefined,
			dismissible: false,
		} );
	} );

	it( 'offers the action it is given', () => {
		const action = { label: 'Continue', onClick: () => {} };
		expect( getCreditsBackNotice( action ).action ).toBe( action );
	} );
} );

describe( 'getCreditsRefusalNotice', () => {
	it( 'titles the refused message and offers the credits pack as its link', () => {
		const action = { label: 'Add credits', href: TOP_UP_URL };
		expect( getCreditsRefusalNotice( 'top_up', action, false ) ).toEqual( {
			icon: false,
			title: 'Your message wasn’t sent',
			message: 'Add credits to keep working.',
			action,
			dismissible: false,
		} );
	} );

	it( 'offers the upgrade with matching words', () => {
		const action = { label: 'Upgrade', href: UPGRADE_URL };
		expect( getCreditsRefusalNotice( 'upgrade', action, false ).message ).toBe(
			'Upgrade to keep working.'
		);
	} );

	it( 'gives someone who can’t buy the title alone', () => {
		expect( getCreditsRefusalNotice( 'top_up', undefined, false ) ).toEqual( {
			icon: false,
			title: 'Your message wasn’t sent',
			message: '',
			action: undefined,
			dismissible: false,
		} );
	} );

	it( 'titles a turn that showed output as not completed, with the same words and link', () => {
		const action = { label: 'Add credits', href: TOP_UP_URL };
		expect( getCreditsRefusalNotice( 'top_up', action, true ) ).toEqual( {
			...getCreditsRefusalNotice( 'top_up', action, false ),
			title: 'Your request didn’t complete',
		} );
	} );
} );
