import { __ } from '@wordpress/i18n';
import { plugins, currencyDollar, globe, wordpress, chartBar } from '@wordpress/icons';
import { buildDashboardLink } from '../../app/routing';
import { PRESSABLE_AGENCY_URL } from '../marketplace/hosting/lib/pressable-plans';
import pressableMark from './images/pressable.svg';
import wordpressMark from './images/wordpress.svg';

export type CrossoverDestinationId = 'wpcom-plugins' | 'wpcom-billing' | 'pressable';

export interface CrossoverDestination {
	url: string;
	/** The product the agency lands in, as it names itself. */
	product: string;
	mark: string;
	title: string;
	/** What the agency does there. */
	description: string;
	descriptionIcon: React.JSX.Element;
	/** How to tell where they landed, or what stays here. */
	hint: string;
	hintIcon: React.JSX.Element;
}

export function getCrossoverDestination( id: CrossoverDestinationId ): CrossoverDestination {
	const wpcom = {
		product: 'WordPress.com',
		mark: wordpressMark,
		hint: __( 'You’ll know you’re on WordPress.com by the WordPress logo at the top left.' ),
		hintIcon: wordpress,
	};

	switch ( id ) {
		case 'wpcom-plugins':
			return {
				...wpcom,
				url: buildDashboardLink( 'dotcom', '/plugins' ),
				title: __( 'Manage plugins on WordPress.com' ),
				description: __( 'Install, activate, and schedule plugin updates across your sites.' ),
				descriptionIcon: plugins,
			};
		case 'wpcom-billing':
			return {
				...wpcom,
				url: buildDashboardLink( 'dotcom', '/me/billing' ),
				title: __( 'Manage billing on WordPress.com' ),
				description: __(
					'Your payment methods, billing history, and tax details are on WordPress.com.'
				),
				descriptionIcon: currencyDollar,
			};
		case 'pressable':
			return {
				url: PRESSABLE_AGENCY_URL,
				product: 'Pressable',
				mark: pressableMark,
				title: __( 'Manage hosting on Pressable' ),
				description: __(
					'Create Pressable sites and manage your plan in the Pressable dashboard.'
				),
				descriptionIcon: globe,
				hint: __( 'Your Pressable plan’s usage also shows here, in Marketplace › Hosting.' ),
				hintIcon: chartBar,
			};
	}
}
