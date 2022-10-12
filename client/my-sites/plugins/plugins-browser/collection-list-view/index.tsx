import { useI18n } from '@wordpress/react-i18n';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export type Plugin = {
	slug: string;
	name: string;
	short_description: string;
	icon: string;
};

export type Collection = {
	name: string;
	slug: 'monetization' | 'business' | 'ecommerce';
	description?: string;
	plugins: Plugin[];
	separator?: boolean;
};

export function useCollections(): Record< string, Collection > {
	const { __ } = useI18n();
	return {
		monetization: {
			name: __( 'Supercharging and monetizing your blog' ),
			slug: 'monetization',
			description: __(
				'Building a money-making blog doesn’t have to be as hard as you might think'
			),
			plugins: [
				{
					slug: 'wordpress-seo-premium',
					name: __( 'Yoast SEO Premium' ),
					icon: 'https://ps.w.org/wordpress-seo/assets/icon-256x256.png',
					short_description: __( 'Optimize your site for search engines' ),
				},
				{
					slug: 'give',
					name: __( 'GiveWP' ),
					icon: 'https://ps.w.org/give/assets/icon-256x256.jpg?rev=2659032',
					short_description: __( 'Create donation pages and collect more' ),
				},
				{
					slug: 'woothemes-sensei',
					name: __( 'Sensei Pro' ),
					icon: 'https://wordpress.com/wp-content/lib/marketplace-images/sensei-pro.svg',
					short_description: __( 'Manage and sell digital courses' ),
				},
			],
		},
		business: {
			name: __( 'Setting up your local business' ),
			slug: 'business',
			description: __( 'These plugins are here to keep your business on track' ),
			plugins: [
				{
					slug: 'wordpress-seo-premium',
					name: __( 'Yoast SEO Premium' ),
					icon: 'https://ps.w.org/wordpress-seo/assets/icon-256x256.png',
					short_description: __( 'Optimize your site for search engines' ),
				},
				{
					slug: 'woocommerce-bookings',
					name: __( 'WooCommerce Bookings ' ),
					icon: 'https://wordpress.com/wp-content/lib/marketplace-images/woocommerce-bookings.png',
					short_description: __( 'Allow customers to book appointments' ),
				},
				{
					slug: 'mailpoet',
					name: __( 'MailPoet' ),
					icon: 'https://ps.w.org/mailpoet/assets/icon-256x256.png?rev=2784430',
					short_description: __( 'Send emails and create loyal customers' ),
				},
			],
		},
		ecommerce: {
			name: __( 'Powering your online store' ),
			slug: 'ecommerce',
			description: __( 'Tools that will set you up to optimize your online business' ),
			plugins: [
				{
					slug: 'woocommerce-subscriptions',
					name: __( 'WooCommerce Subscriptions' ),
					icon: 'https://wordpress.com/wp-content/lib/marketplace-images/woocommerce-subscriptions.png',
					short_description: __( 'Let customers subscribe to your service' ),
				},
				{
					slug: 'woocommerce-xero',
					name: __( 'Xero' ),
					icon: 'https://woocommerce.com/wp-content/uploads/2012/08/xero2.png',
					short_description: __( 'Sync your site with your Xero account' ),
				},
				{
					slug: 'automatewoo',
					name: __( 'AutomateWoo' ),
					icon: 'https://wordpress.com/wp-content/lib/marketplace-images/automatewoo.png',
					short_description: __( 'Create a range of automated workflows' ),
				},
				{
					slug: 'woocommerce-shipment-tracking',
					name: __( 'Shipment tracking' ),
					icon: 'https://wordpress.com/wp-content/lib/marketplace-images/woocommerce-shipment-tracking.png',
					short_description: __( 'Provide shipment tracking information' ),
				},
				{
					slug: 'woocommerce-shipping-usps',
					name: __( 'WooCommerce USPS Shipping' ),
					icon: 'https://wordpress.com/wp-content/lib/marketplace-images/woocommerce.svg',
					short_description: __( 'Get shipping rates from the USPS API' ),
				},
				{
					slug: 'optinmonster',
					name: __( 'OptinMonster' ),
					icon: 'https://ps.w.org/optinmonster/assets/icon-256x256.png?rev=1145864',
					short_description: __( 'Monetize your website traffic' ),
				},
			],
		},
	};
}

export default function CollectionListView( {
	collection,
	siteSlug,
	sites,
}: {
	collection: 'monetization' | 'business' | 'ecommerce';
	siteSlug: string;
	sites: any;
} ): ReactElement | null {
	const selectedSite = useSelector( getSelectedSite );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSite?.ID ) );
	const isJetpackSelfHosted = isJetpack && ! isAtomic;

	const collections = useCollections();

	if ( isJetpackSelfHosted ) {
		return null;
	}

	const plugins = collections[ collection ].plugins.slice( 0, 6 );

	return (
		<PluginsBrowserList
			listName={ 'collection-' + collection }
			plugins={ plugins }
			size={ plugins.length }
			title={ collections[ collection ].name }
			subtitle={ collections[ collection ].description }
			site={ siteSlug }
			currentSites={ sites }
			variant={ PluginsBrowserListVariant.Fixed }
			showPlaceholders={ false }
			browseAllLink={ false }
			resultCount={ false }
			search={ '' }
			extended={ false }
		/>
	);
}
