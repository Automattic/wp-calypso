import { translate as i18nTranslate } from 'i18n-calypso';
import customization from 'calypso/assets/images/plans/wpcom/ecommerce-trial/customization.png';
import generalFeatures from 'calypso/assets/images/plans/wpcom/ecommerce-trial/general-features.png';
import growth from 'calypso/assets/images/plans/wpcom/ecommerce-trial/growth.png';
import payments from 'calypso/assets/images/plans/wpcom/ecommerce-trial/payments.png';
import productManagement from 'calypso/assets/images/plans/wpcom/ecommerce-trial/product-management.png';
import shipping from 'calypso/assets/images/plans/wpcom/ecommerce-trial/shipping.png';
import type { WooExpressMediumPlanFeatureSet } from 'calypso/my-sites/plans/components/trial-feature-card';

type WooExpressMediumFeatureSetProps = {
	translate: typeof i18nTranslate;
	interval: 'monthly' | 'yearly';
};

/*
 * Note that this file includes multiple sets of features:
 *  - getWooExpressMediumFeatureSets: the features for upsells while in the trial.
 *  - getWooExpressMediumFeatureSetsAfterTrial: the features for upsells after the trial has expired.
 */

export const getWooExpressMediumFeatureSets = ( {
	translate,
}: WooExpressMediumFeatureSetProps ): WooExpressMediumPlanFeatureSet[] => {
	return [
		{
			expanded: true,
			illustration: generalFeatures,
			title: translate( 'General features', { textOnly: true } ),
			subtitle: translate( 'Everything you need to grow your business.' ),
			items: [
				{
					title: translate( 'Sell the simple way', { textOnly: true } ),
					subtitle: translate(
						'Your store includes everything you need to launch quickly and grow over time – all in one turnkey package.'
					),
				},
				{
					title: translate( 'Manage on the go', { textOnly: true } ),
					subtitle: translate(
						'Process orders and manage your store anywhere with the WooCommerce Mobile App.'
					),
				},
				{
					title: translate( 'Get support 24/7', { textOnly: true } ),
					subtitle: translate( 'Need help? Reach out anytime.' ),
				},
				{
					title: translate( 'Have unlimited admin accounts', { textOnly: true } ),
					subtitle: translate(
						'Add as many staff accounts as you need to help run your business.'
					),
				},
			],
		},
		{
			illustration: payments,
			title: translate( 'Payments', { textOnly: true } ),
			subtitle: translate( 'Quickly and easily accept payments.' ),
			items: [
				{
					title: translate( 'Give your customers more ways to pay.', { textOnly: true } ),
					subtitle: translate(
						'Accept all major credit and debit cards, plus popular options like Apple Pay and Google Pay.'
					),
				},
				{
					title: translate( 'Sell in over 60 countries', { textOnly: true } ),
					subtitle: translate( 'Get paid in more than 100 currencies from all over the world.' ),
				},
				{
					title: translate( 'Offer subscriptions', { textOnly: true } ),
					subtitle: translate(
						'Add a subscription for any product or service, including the ability to set subscription discounts, signup fees, free trials, or expiration periods.'
					),
				},
				{
					title: translate( 'Automate tax collection', { textOnly: true } ),
					subtitle: translate(
						'Automatically calculate how much sales tax should be collected at checkout.'
					),
				},
				{
					title: translate( 'Sell in person', { textOnly: true } ),
					subtitle: translate(
						'Use a mobile card reader to take payments in a store, at a popup, or wherever your business takes you.'
					),
				},
			],
		},
		{
			illustration: productManagement,
			title: translate( 'Product management', { textOnly: true } ),
			subtitle: translate( 'Simplify the way you manage, sell and promote your products.' ),
			items: [
				{
					title: translate( 'Unlimited products', { textOnly: true } ),
					subtitle: translate( 'Add unlimited products to your store.' ),
				},
				{
					title: translate( 'Offer gift cards', { textOnly: true } ),
					subtitle: translate( 'Sell and accept pre-paid, multi-purpose e-gift vouchers.' ),
				},
				{
					title: translate( 'Send back in stock notifications', { textOnly: true } ),
					subtitle: translate( 'Notify customers when your products are restocked.' ),
				},
				{
					title: translate( 'Set order limits', { textOnly: true } ),
					subtitle: translate( 'Specify min and max allowed product quantities for orders.' ),
				},
				{
					title: translate( 'Sell product bundles', { textOnly: true } ),
					subtitle: translate( 'Offer personalized product packages and bulk discounts.' ),
				},
				{
					title: translate( 'Offer customizable product kits', { textOnly: true } ),
					subtitle: translate(
						'Use Composite Products to add product kit building functionality with inventory management.'
					),
				},
				{
					title: translate( 'Import your products via CSV', { textOnly: true } ),
					subtitle: translate( 'Import, merge, and export products using a CSV file.' ),
				},
				{
					title: translate( 'Sell product add-ons', { textOnly: true } ),
					subtitle: translate( 'Enable gift wrapping/messages or custom pricing.' ),
				},
				{
					title: translate( 'Product recommendations', { textOnly: true } ),
					subtitle: translate(
						'Earn more revenue with automated upsell and cross-sell product recommendations.'
					),
				},
			],
		},
		{
			illustration: customization,
			title: translate( 'Themes and customization', { textOnly: true } ),
			subtitle: translate( 'Bring your brand to life with a fully customizable storefront.' ),
			items: [
				{
					title: translate( 'Premium themes', { textOnly: true } ),
					subtitle: translate(
						'Tap into a diverse selection of beautifully designed premium themes.'
					),
				},
				{
					title: translate( 'Block-based templates', { textOnly: true } ),
					subtitle: translate(
						"Take control over your store's layout without touching a line of code."
					),
				},
				{
					title: translate( 'Cart and checkout optimization', { textOnly: true } ),
					subtitle: translate(
						'Streamline your checkout and boost conversions with the Cart and Checkout blocks.'
					),
				},
			],
		},
		{
			illustration: growth,
			title: translate( 'Marketing and growth', { textOnly: true } ),
			subtitle: translate(
				'Optimize your store for sales by adding in email and social integrations.'
			),
			items: [
				{
					title: translate( 'Sell everywhere', { textOnly: true } ),
					subtitle: translate(
						'Promote and sell your products on popular social media platforms and marketplaces.'
					),
				},
				{
					title: translate( 'Automate your marketing', { textOnly: true } ),
					subtitle: translate(
						'Build custom email automations to keep customers and prospects engaged.'
					),
				},
				{
					title: translate( 'Recover abandoned carts', { textOnly: true } ),
					subtitle: translate(
						'Drive more sales by automatically emailing customers who leave your store without checking out.'
					),
				},
				{
					title: translate( 'Encourage referrals', { textOnly: true } ),
					subtitle: translate(
						'Offer free gifts or coupons when your customers refer new shoppers.'
					),
				},
				{
					title: translate( 'Send birthday coupons', { textOnly: true } ),
					subtitle: translate(
						'Automatically email your customers a birthday discount to keep them coming back.'
					),
				},
				{
					title: translate( 'Drive loyalty', { textOnly: true } ),
					subtitle: translate( 'Keep your loyal customers loyal with a rewards program.' ),
				},
			],
		},
		{
			illustration: shipping,
			title: translate( 'Shipping', { textOnly: true } ),
			subtitle: translate( 'Streamline your fulfillment with integrated shipping.' ),
			items: [
				{
					title: translate( 'Print shipping labels', { textOnly: true } ),
					subtitle: translate( 'Print shipping labels from your store to save time and money.' ),
				},
				{
					title: translate( 'Offer shipment tracking', { textOnly: true } ),
					subtitle: translate( 'Provide customers with an easy way to track their shipment.' ),
				},
				{
					title: translate( 'Customize shipping rates', { textOnly: true } ),
					subtitle: translate(
						'Define multiple shipping rates based on location, price, weight, or other criteria.'
					),
				},
				{
					title: translate( 'Set conditional shipping', { textOnly: true } ),
					subtitle: translate( 'Restrict shipping and payment options using conditional logic.' ),
				},
				{
					title: translate( 'Simplify returns and exchanges', { textOnly: true } ),
					subtitle: translate(
						'Manage the return process, add warranties to products and let customers request/manage returns from their account.'
					),
				},
			],
		},
	];
};

export const getExpiredTrialWooExpressMediumFeatureSets = ( {
	translate,
}: WooExpressMediumFeatureSetProps ): WooExpressMediumPlanFeatureSet[] => {
	return [
		{
			expanded: true,
			illustration: generalFeatures,
			title: translate( 'Get everything you need for success', { textOnly: true } ),
			subtitle: translate( 'All the tools you need to start growing your business are included.' ),
			items: [
				{
					title: translate( 'Start making sales', { textOnly: true } ),
					subtitle: translate(
						'Purchase a plan to keep building and launch when you’re ready, or publish your store immediately. '
					),
				},
				{
					title: translate( 'Priority support 24/7', { textOnly: true } ),
					subtitle: translate( 'Need help? Reach out to our Woo specialists anytime.' ),
				},
				{
					title: translate( 'Get unlimited admin accounts', { textOnly: true } ),
					subtitle: translate(
						'Add as many staff accounts as you need to help run your business.'
					),
				},
				{
					title: translate( 'Customize your look with premium themes and simple editing.', {
						textOnly: true,
					} ),
					subtitle: translate(
						'Choose from a selection of beautiful themes, then customize without touching a line of code.'
					),
				},
				{
					title: translate( 'Get found online', { textOnly: true } ),
					subtitle: translate(
						'Promote and sell your products on popular social media platforms and marketplaces.'
					),
				},
				{
					title: translate( 'Sell in person', { textOnly: true } ),
					subtitle: translate(
						'Use a mobile card reader to take payments in a store, at a popup, or wherever your business takes you.'
					),
				},
				{
					title: translate( 'Automate your marketing', { textOnly: true } ),
					subtitle: translate(
						'Build custom email automations to keep customers and prospects engaged.'
					),
				},
				{
					title: translate( 'Simplify shipping', { textOnly: true } ),
					subtitle: translate( 'Print shipping labels from your store to save time and money.' ),
				},
				{
					title: translate( 'Own your store forever', { textOnly: true } ),
					subtitle: translate(
						'Your site is open source, meaning you’re always in control of your business.'
					),
				},
			],
		},
		{
			illustration: payments,
			title: translate( 'Payments', { textOnly: true } ),
			subtitle: translate( 'Quickly and easily accept payments.' ),
			items: [
				{
					title: translate( 'Give your customers more ways to pay.', { textOnly: true } ),
					subtitle: translate(
						'Accept all major credit and debit cards, plus popular options like Apple Pay and Google Pay.'
					),
				},
				{
					title: translate( 'Go global', { textOnly: true } ),
					subtitle: translate(
						'Sell in 60+ countries and take payments in more than 100 currencies.'
					),
				},
				{
					title: translate( 'Offer subscriptions', { textOnly: true } ),
					subtitle: translate(
						'Add a subscription for any product or service, including the ability to set subscription discounts, signup fees, free trials, or expiration periods.'
					),
				},
				{
					title: translate( 'Automate tax collection', { textOnly: true } ),
					subtitle: translate(
						'Automatically calculate how much sales tax should be collected at checkout.'
					),
				},
				{
					title: translate( 'Sell in person', { textOnly: true } ),
					subtitle: translate(
						'Use a mobile card reader to take payments in a store, at a popup, or wherever your business takes you.'
					),
				},
			],
		},
		{
			illustration: productManagement,
			title: translate( 'Product management', { textOnly: true } ),
			subtitle: translate( 'Simplify the way you manage, sell and promote your products.' ),
			items: [
				{
					title: translate( 'Manage on the go', { textOnly: true } ),
					subtitle: translate(
						'Process orders and manage your store anywhere with the WooCommerce Mobile App.'
					),
				},
				{
					title: translate( 'Unlimited products', { textOnly: true } ),
					subtitle: translate( 'Add as many products as you want to your store.' ),
				},
				{
					title: translate( 'Offer gift cards', { textOnly: true } ),
					subtitle: translate( 'Sell and accept pre-paid, multi-purpose e-gift vouchers.' ),
				},
				{
					title: translate( 'Send back in stock notifications', { textOnly: true } ),
					subtitle: translate( 'Notify customers when your products are restocked.' ),
				},
				{
					title: translate( 'Set order limits', { textOnly: true } ),
					subtitle: translate( 'Specify min and max allowed product quantities for orders.' ),
				},
				{
					title: translate( 'Sell product bundles', { textOnly: true } ),
					subtitle: translate( 'Offer personalized product packages and bulk discounts.' ),
				},
				{
					title: translate( 'Offer customizable product kits', { textOnly: true } ),
					subtitle: translate(
						'Use Composite Products to add product kit building functionality with inventory management.'
					),
				},
				{
					title: translate( 'Quickly import products', { textOnly: true } ),
					subtitle: translate( 'Import, merge, and export products using a CSV file.' ),
				},
				{
					title: translate( 'Sell product add-ons', { textOnly: true } ),
					subtitle: translate( 'Enable gift wrapping/messages or custom pricing.' ),
				},
				{
					title: translate( 'Unlimited images', { textOnly: true } ),
					subtitle: translate( 'Add any number of images to your product variations.' ),
				},
				{
					title: translate( 'Product recommendations', { textOnly: true } ),
					subtitle: translate(
						'Earn more revenue with automated upsell and cross-sell product recommendations.'
					),
				},
				{
					title: translate( 'Take pre-orders', { textOnly: true } ),
					subtitle: translate( 'Let customers order products before they’re available.' ),
				},
			],
		},
		{
			illustration: customization,
			title: translate( 'Themes and customization', { textOnly: true } ),
			subtitle: translate( 'Bring your brand to life with a fully customizable storefront.' ),
			items: [
				{
					title: translate( 'Premium themes', { textOnly: true } ),
					subtitle: translate(
						'Tap into a diverse selection of beautifully designed premium themes.'
					),
				},
				{
					title: translate( 'Simple customization', { textOnly: true } ),
					subtitle: translate(
						"Take control over your store's layout without touching a line of code."
					),
				},
				{
					title: translate( 'Cart and checkout optimization', { textOnly: true } ),
					subtitle: translate(
						'Streamline your checkout and boost conversions with simplified editing of your shopping cart and checkout pages.'
					),
				},
			],
		},
		{
			illustration: growth,
			title: translate( 'Marketing and growth', { textOnly: true } ),
			subtitle: translate(
				'Optimize your store for sales by adding in email and social integrations.'
			),
			items: [
				{
					title: translate( 'Sell everywhere', { textOnly: true } ),
					subtitle: translate(
						'Promote and sell your products on popular social media platforms and marketplaces.'
					),
				},
				{
					title: translate( 'Automate your marketing', { textOnly: true } ),
					subtitle: translate(
						'Build custom email automations to keep customers and prospects engaged.'
					),
				},
				{
					title: translate( 'Recover abandoned carts', { textOnly: true } ),
					subtitle: translate(
						'Drive more sales by automatically emailing customers who leave your store without checking out.'
					),
				},
				{
					title: translate( 'Encourage referrals', { textOnly: true } ),
					subtitle: translate(
						'Offer free gifts or coupons when your customers refer new shoppers.'
					),
				},
				{
					title: translate( 'Send birthday coupons', { textOnly: true } ),
					subtitle: translate(
						'Automatically email your customers a birthday discount to keep them coming back.'
					),
				},
				{
					title: translate( 'Drive loyalty', { textOnly: true } ),
					subtitle: translate( 'Keep your loyal customers loyal with a rewards program.' ),
				},
			],
		},
		{
			illustration: shipping,
			title: translate( 'Shipping', { textOnly: true } ),
			subtitle: translate( 'Streamline your fulfillment with integrated shipping.' ),
			items: [
				{
					title: translate( 'Shipping labels, simplified', { textOnly: true } ),
					subtitle: translate( 'Print shipping labels from your store to save time and money.' ),
				},
				{
					title: translate( 'Offer shipment tracking', { textOnly: true } ),
					subtitle: translate( 'Provide customers with an easy way to track their shipment.' ),
				},
				{
					title: translate( 'Customize shipping rates', { textOnly: true } ),
					subtitle: translate(
						'Define multiple shipping rates based on location, price, weight, or other criteria.'
					),
				},
				{
					title: translate( 'Set conditional shipping', { textOnly: true } ),
					subtitle: translate( 'Restrict shipping and payment options using conditional logic.' ),
				},
				{
					title: translate( 'Simplify returns and exchanges', { textOnly: true } ),
					subtitle: translate(
						'Manage the RMA process, add warranties to products and let customers request/manage returns from their account.'
					),
				},
			],
		},
	];
};
