import { __ } from '@wordpress/i18n';
import pressableMark from './images/pressable.svg';
import tipaltiMark from './images/tipalti.svg';
import wordpressMark from './images/wordpress.svg';

export type CrossoverDestinationId = 'wpcom-plugins' | 'wpcom-billing' | 'pressable' | 'tipalti';

export interface CrossoverDestination {
	/** The product the agency lands in, as it names itself. */
	product: string;
	/** The product's mark: round, or a wordmark at the same height. */
	mark: string;
	title: string;
	/** What the agency does there, one sentence. */
	description: string;
	/** The handoff modal's last line: how to tell where you are, or what stays here. */
	hint: string;
}

export function getCrossoverDestination( id: CrossoverDestinationId ): CrossoverDestination {
	switch ( id ) {
		case 'wpcom-plugins':
			return {
				product: 'WordPress.com',
				mark: wordpressMark,
				title: __( 'Manage plugins on WordPress.com' ),
				description: __( 'Install, activate, and schedule plugin updates across your sites.' ),
				hint: __( 'You’ll know you’re on WordPress.com by the WordPress logo at the top left.' ),
			};
		case 'wpcom-billing':
			return {
				product: 'WordPress.com',
				mark: wordpressMark,
				title: __( 'Manage billing on WordPress.com' ),
				description: __(
					'Your payment methods, billing history, and tax details are on WordPress.com.'
				),
				hint: __( 'You’ll know you’re on WordPress.com by the WordPress logo at the top left.' ),
			};
		case 'tipalti':
			return {
				product: 'Tipalti',
				mark: tipaltiMark,
				title: __( 'Manage payouts on Tipalti' ),
				description: __( 'Add or update your bank details and tax form with Tipalti.' ),
				hint: __( 'Your payment status on this page comes from Tipalti.' ),
			};
		case 'pressable':
			return {
				product: 'Pressable',
				mark: pressableMark,
				title: __( 'Manage hosting on Pressable' ),
				description: __(
					'Create Pressable sites and manage your plan in the Pressable dashboard.'
				),
				hint: __( 'Your Pressable plan’s usage also shows here, in Marketplace › Hosting.' ),
			};
	}
}
