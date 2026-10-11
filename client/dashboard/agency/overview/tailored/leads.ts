/**
 * PROTOTYPE — proof of concept only.
 *
 * Logic for the Client leads card's empty state below Pro: the unlock
 * thresholds and the IAR methods that fit this agency best. The leads
 * themselves live in `../../leads/lead-data.ts`.
 * Thresholds mirror the tier ladder in `../../tiers/constants.ts`.
 */
import { __ } from '@wordpress/i18n';
import { TARGET_INFLUENCED_REVENUE } from '../../tiers/constants';
import type { SignupProfile } from './signup-profile';

export const LEAD_UNLOCKS = {
	directory: TARGET_INFLUENCED_REVENUE[ 'agency-partner' ],
	qualifiedLeads: TARGET_INFLUENCED_REVENUE[ 'pro-agency-partner' ],
};

export type IarMethodId = 'hosting' | 'referrals' | 'woopayments';

export interface IarMethod {
	id: IarMethodId;
	title: string;
	description: string;
	actionLabel: string;
	href: string;
}

export interface IarMethodLinks {
	wpcomHosting: string;
	pressableHosting: string;
	referrals: string;
	woopayments: string;
}

const SITES_21_PLUS = [ '21-50', '51-100', '101-500', '500+' ];
const SITES_51_PLUS = [ '51-100', '101-500', '500+' ];

/**
 * The top 3 ways for this agency to grow IAR, best fit first. Signals lift a
 * method; ties fall back to hosting, referrals, then WooPayments.
 */
export function getIarMethods(
	profile: SignupProfile | null,
	links: IarMethodLinks,
	limit = 3
): IarMethod[] {
	const goals = profile?.goals ?? [];
	const managesManySites = SITES_21_PLUS.includes( profile?.managedSites ?? '' );
	const usesPressable = SITES_51_PLUS.includes( profile?.managedSites ?? '' );
	const offersEcommerce = !! profile?.servicesOffered.includes( 'ecommerce_development' );

	const methods: ( IarMethod & { score: number } )[] = [
		{
			id: 'hosting',
			title: usesPressable
				? __( 'Move clients onto a Pressable plan' )
				: __( 'Buy WordPress.com hosting in bulk' ),
			description: __( 'Each dollar spent on hosting adds a dollar of IAR.' ),
			actionLabel: __( 'Compare hosting' ),
			href: usesPressable ? links.pressableHosting : links.wpcomHosting,
			score: ( managesManySites ? 2 : 0 ) + ( goals.includes( 'better_hosting' ) ? 2 : 0 ),
		},
		{
			id: 'referrals',
			title: __( 'Refer products to clients' ),
			description: __( 'Client purchases through your referral cart count dollar for dollar.' ),
			actionLabel: __( 'Make a referral' ),
			href: links.referrals,
			score: goals.includes( 'passive_income' ) ? 3 : 0,
		},
		{
			id: 'woopayments',
			title: __( 'Add WooPayments to client stores' ),
			description: __( 'Every $100 of payment volume adds $1 of IAR.' ),
			actionLabel: __( 'Set up WooPayments' ),
			href: links.woopayments,
			score: ( offersEcommerce ? 2 : 0 ) + ( goals.includes( 'passive_income' ) ? 1 : 0 ),
		},
	];

	return methods
		.map( ( method, index ) => ( { method, index } ) )
		.sort( ( a, b ) => b.method.score - a.method.score || a.index - b.index )
		.slice( 0, limit )
		.map( ( { method: { id, title, description, actionLabel, href } } ) => ( {
			id,
			title,
			description,
			actionLabel,
			href,
		} ) );
}
