import { getPlans, PLAN_ECOMMERCE, PLAN_ECOMMERCE_MONTHLY } from '@automattic/calypso-products';
import { Button, Card } from '@automattic/components';
import { getCurrencyObject } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getPlanRawPrice, getPlan } from 'calypso/state/plans/selectors';
import ECommerceTrialBanner from './ecommerce-trial-banner';
import TrialFeatureCard from './trial-feature-card';

import './style.scss';

const ECommerceTrialPlansPage = () => {
	const translate = useTranslate();

	const eCommercePlanAnnual = getPlans()[ PLAN_ECOMMERCE ];
	const eCommercePlanMonthly = getPlans()[ PLAN_ECOMMERCE_MONTHLY ];

	const eCommercePlanPrices = useSelector( ( state ) => ( {
		annualPlanPrice: getPlanRawPrice( state, eCommercePlanAnnual.getProductId(), false ) || 0,
		annualPlanMonthlyPrice: getPlanRawPrice( state, eCommercePlanAnnual.getProductId(), true ) || 0,
		monthlyPlanPrice: getPlanRawPrice( state, eCommercePlanMonthly.getProductId() ) || 0,
		currencyCode: getPlan( state, eCommercePlanAnnual.getProductId() )?.currency_code || '',
	} ) );

	const { symbol: currencySymbol } = getCurrencyObject( 0, eCommercePlanPrices.currencyCode );

	// Defaulting to annual while we don't add the toggle
	const isAnnualSubscription = true;

	const percentageSavings = Math.floor(
		( 1 - eCommercePlanPrices.annualPlanMonthlyPrice / eCommercePlanPrices.monthlyPlanPrice ) * 100
	);

	const features = [
		{
			expanded: true,
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/general-features.png',
			title: 'General features',
			subtitle: 'Everything you need to grow your business.',
			items: [
				{
					title: 'Sell the simple way',
					subtitle:
						'Your store includes everything you need to launch quickly and grow over time – all in one turnkey package.',
				},
				{
					title: 'Manage on the go',
					subtitle:
						'Process orders and manage your store anywhere with the WooCommerce Mobile App.',
				},
				{
					title: 'Get support 24/7',
					subtitle: 'Need help? Reach out anytime via email or chat.',
				},
				{
					title: 'Have unlimited admin accounts',
					subtitle: 'Add as many staff accounts as you need to help run your business.',
				},
			],
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/payments.png',
			title: 'Payments',
			subtitle: 'Quickly and easily accept payments.',
			items: [
				{
					title: 'Give your customers more ways to pay.',
					subtitle:
						'Accept all major credit and debit cards, plus popular options like Apple Pay and Google Pay.',
				},
				{
					title: 'Sell in over 60 countries',
					subtitle: 'Get paid in more than 100 currencies from all over the world.',
				},
				{
					title: 'Offer subscriptions',
					subtitle:
						'Add a subscription for any product or service, including the ability to set subscription discounts, signup fees, free trials, or expiration periods.',
				},
				{
					title: 'Automate tax collection',
					subtitle: 'Automatically calculate how much sales tax should be collected at checkout.',
				},
				{
					title: 'Sell in person',
					subtitle:
						'Use a mobile card reader to take payments in a store, at a popup, or wherever your business takes you.',
				},
			],
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/product-management.png',
			title: 'Product management',
			subtitle: 'Simplify the way you manage, sell and promote your products.',
			items: [
				{
					title: 'Unlimited products',
					subtitle: 'Add unlimited products to your store.',
				},
				{
					title: 'Offer gift cards',
					subtitle: 'Sell and accept pre-paid, multi-purpose e-gift vouchers.',
				},
				{
					title: 'Send back in stock notifications',
					subtitle: 'Notify customers when your products are restocked.',
				},
				{
					title: 'Set order limits',
					subtitle: 'Specify min and max allowed product quantities for orders.',
				},
				{
					title: 'Sell product bundles',
					subtitle: 'Offer personalized product packages and bulk discounts.',
				},
				{
					title: 'Offer customizable product kits',
					subtitle:
						'Use Composite Products to add product kit building functionality with inventory management.',
				},
				{
					title: 'Import your products via CSV',
					subtitle: 'Import, merge, and export products using a CSV file.',
				},
				{
					title: 'Sell product add-ons',
					subtitle: 'Enable gift wrapping/messages or custom pricing.',
				},
				{
					title: 'Unlimited images',
					subtitle: 'Add any number of images to your product variations.',
				},
				{
					title: 'Product recommendations',
					subtitle:
						'Earn more revenue with automated upsell and cross-sell product recommendations.',
				},
				{
					title: 'Take pre-orders',
					subtitle: 'Let customers order products before they’re available.',
				},
			],
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/customization.png',
			title: 'Themes and customization',
			subtitle: 'Bring your brand to life with a fully customizable storefront.',
			items: [
				{
					title: 'Premium themes',
					subtitle: 'Tap into a diverse selection of beautifully designed premium themes.',
				},
				{
					title: 'Block-based templates',
					subtitle: "Take control over your store's layout without touching a line of code.",
				},
				{
					title: 'Cart and checkout optimization',
					subtitle:
						'Streamline your checkout and boost conversions with the Cart and Checkout blocks.',
				},
			],
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/growth.png',
			title: 'Marketing and growth',
			subtitle: 'Optimize your store for sales by adding in email and social integrations.',
			items: [
				{
					title: 'Sell everywhere',
					subtitle:
						'Promote and sell your products on popular social media platforms and marketplaces.',
				},
				{
					title: 'Automate your marketing',
					subtitle: 'Build custom email automations to keep customers and prospects engaged.',
				},
				{
					title: 'Recover abandoned carts',
					subtitle:
						'Drive more sales by automatically emailing customers who leave your store without checking out.',
				},
				{
					title: 'Encourage referrals',
					subtitle: 'Offer free gifts or coupons when your customers refer new shoppers.',
				},
				{
					title: 'Send birthday coupons',
					subtitle:
						'Automatically email your customers a birthday discount to keep them coming back.',
				},
				{
					title: 'Drive loyalty',
					subtitle: 'Keep your loyal customers loyal with a rewards program.',
				},
			],
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/shipping2.png',
			title: 'Shipping',
			subtitle: 'Streamline your fulfillment with integrated shipping.',
			items: [
				{
					title: 'Print shipping labels',
					subtitle: 'Print shipping labels from your store to save time and money.',
				},
				{
					title: 'Offer shipment tracking',
					subtitle: 'Provide customers with an easy way to track their shipment.',
				},
				{
					title: 'Customize shipping rates',
					subtitle:
						'Define multiple shipping rates based on location, price, weight, or other criteria.',
				},
				{
					title: 'Set conditional shipping',
					subtitle: 'Restrict shipping and payment options using conditional logic.',
				},
				{
					title: 'Simplify returns and exchanges',
					subtitle:
						'Manage the RMA process, add warranties to products and let customers request/manage returns from their account.',
				},
			],
		},
	];

	const priceContent = isAnnualSubscription
		? translate(
				'{{monthlyPriceWrapper}}{{currencySymbol}}%(currency)s{{/currencySymbol}}%(monthlyPrice)s{{/monthlyPriceWrapper}} {{priceDescription}}per month, %(annualPrice)s billed annually{{/priceDescription}}',
				{
					args: {
						currency: currencySymbol,
						monthlyPrice: eCommercePlanPrices.annualPlanMonthlyPrice,
						annualPrice: eCommercePlanPrices.annualPlanPrice,
					},
					components: {
						monthlyPriceWrapper: <span className="e-commerce-trial-plans__price-card-value" />,
						priceDescription: <span className="e-commerce-trial-plans__price-card-interval" />,
						currencySymbol: <span className="e-commerce-trial-plans__price-card-value-symbol" />,
					},
				}
		  )
		: translate(
				'{{monthlyPriceWrapper}}{{currencySymbol}}%(currency)s{{/currencySymbol}}%(monthlyPrice)s{{/monthlyPriceWrapper}} {{priceDescription}}per month{{/priceDescription}}',
				{
					args: {
						currency: currencySymbol,
						monthlyPrice: eCommercePlanPrices.monthlyPlanPrice,
					},
					components: {
						monthlyPriceWrapper: <span className="e-commerce-trial-plans__price-card-value" />,
						priceDescription: <span className="e-commerce-trial-plans__price-card-interval" />,
						currencySymbol: <span className="e-commerce-trial-plans__price-card-value-symbol" />,
					},
				}
		  );

	const annualUpsellContent = isAnnualSubscription && (
		<span className="e-commerce-trial-plans__price-card-savings">
			{ translate( 'Save %(percentageSavings)s%% by paying annually', {
				args: { percentageSavings },
			} ) }
		</span>
	);

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-ecommerce-trial-plan' ] } />

			<div className="e-commerce-trial-plans__banner-wrapper">
				<ECommerceTrialBanner />
			</div>

			<Card className="e-commerce-trial-plans__price-card">
				<div className="e-commerce-trial-plans__price-card-text">
					<span className="e-commerce-trial-plans__price-card-title">
						{
							// TODO: translate when final copy is available
							'Commerce'
						}
					</span>
					<span className="e-commerce-trial-plans__price-card-subtitle">
						{ translate( 'Accelerate your growth with advanced features.' ) }
					</span>
				</div>
				<div className="e-commerce-trial-plans__price-card-conditions">
					{ priceContent }
					{ annualUpsellContent }
				</div>
				<div className="e-commerce-trial-plans__price-card-cta-wrapper">
					<Button className="e-commerce-trial-plans__price-card-cta" primary>
						{ translate( 'Upgrade now' ) }
					</Button>
				</div>
			</Card>

			<div className="e-commerce-trial-plans__features-wrapper">
				{ features.map( ( feature ) => (
					<TrialFeatureCard key={ feature.title } { ...feature } />
				) ) }
			</div>
			<div className="e-commerce-trial-plans__cta-wrapper">
				<Button className="e-commerce-trial-plans__cta is-primary">
					{ translate( 'Upgrade now' ) }
				</Button>
			</div>
		</>
	);
};

export default ECommerceTrialPlansPage;
