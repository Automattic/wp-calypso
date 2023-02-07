import { Button, Card } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import {
	getCurrentPlan,
	getECommerceTrialDaysLeft,
	getECommerceTrialExpiration,
	isECommerceTrialExpired,
} from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import DoughnutChart from '../doughnut-chart';
import TrialFeatureCard from './trial-feature-card';

import './style.scss';

const ECommerceTrialPlansPage = () => {
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) ) || -1;

	const { currentPlan, eCommerceTrialDaysLeft, isTrialExpired, eCommerceTrialExpiration } =
		useSelector( ( state ) => ( {
			currentPlan: getCurrentPlan( state, selectedSiteId ),
			isTrialExpired: isECommerceTrialExpired( state, selectedSiteId ),
			eCommerceTrialDaysLeft: Math.round( getECommerceTrialDaysLeft( state, selectedSiteId ) || 0 ),
			eCommerceTrialExpiration: getECommerceTrialExpiration( state, selectedSiteId ),
		} ) );

	const locale = useLocale();
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const trialStart = moment( currentPlan?.subscribedDate );
	const trialEnd = moment( currentPlan?.expiryDate );
	const trialDuration = trialEnd.diff( trialStart, 'days' );

	/**
	 * Trial progress from 0 to 1
	 */
	const trialProgress = 1 - eCommerceTrialDaysLeft / trialDuration;
	const eCommerceTrialDaysLeftToDisplay = isTrialExpired ? 0 : eCommerceTrialDaysLeft;

	// moment.js doesn't have a format option to display the long form in a localized way without the year
	// https://github.com/moment/moment/issues/3341
	const readableExpirationDate = eCommerceTrialExpiration?.toDate().toLocaleDateString( locale, {
		month: 'long',
		day: 'numeric',
	} );

	const features = [
		{
			expanded: true,
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/general-features.png',
			title: 'General features',
			subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			items: [
				{
					title: 'Online store',
					subtitle: 'All-in-one solution for starting your ecommerce store.',
				},
				{
					title: 'Mobile app',
					subtitle: 'Manage your store anywhere with the free WooCommerce Mobile App.',
				},
				{
					title: '24/7 support',
					subtitle:
						'Need help? Reach out to us anytime, anywhere. Get 24/7 phone, email, and live chat support.',
				},
				{
					title: 'Unlimited admin accounts',
					subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
				},
			],
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/payments.png',
			title: 'Payments',
			subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			items: [
				{
					title: 'Credit card rate: 2.9% + 30c',
					subtitle: 'Accept Visa, Mastercard and',
				},
				{
					title: 'Sell in over 60 countries',
					subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
				},
				{
					title: 'Advanced subscriptions',
					subtitle:
						'Add subscription plans to any product – plus discounts for subscribing and a way for customers to purchase subscriptions for others.',
				},
				{
					title: 'Automated tax compliance',
					subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
				},
				{
					title: 'Pre-orders',
					subtitle: "Take orders before launches, and fill orders when you're ready.",
				},
				{
					title: 'Stripe M2 Reader',
					subtitle: 'Easy-to-use mobile card reader designed for fast, reliable payments.',
				},
			],
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/product-management.png',
			title: 'Product management',
			subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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
					title: 'Sales channels',
					subtitle:
						'Promote and sell your products on multiple sales channels, including social media and online marketplaces.',
				},
				{
					title: 'Marketing automation',
					subtitle:
						'Build custom automations so you can engage customers at every stage of their journey.',
				},
				{
					title: 'Abandoned cart recovery',
					subtitle:
						'Automatically send emails to customers who leave your store without completing the checkout process.',
				},
				{
					title: 'Refer a friend',
					subtitle: 'Give a free gift or coupon as a referral reward.',
				},
				{
					title: 'Birthday coupon',
					subtitle: 'Send customers a personalized coupon on their birthdays.',
				},
				{
					title: 'Points and rewards',
					subtitle: 'Reward customers for purchases and loyalty.',
				},
			],
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/shipping2.png',
			title: 'Shipping',
			subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			items: [
				{
					title: 'Shipping labels',
					subtitle: 'Save on shipping by printing labels right from your store.',
				},
				{
					title: 'Shipping tracking',
					subtitle: 'Provide customers with an easy way to track their shipment.',
				},
				{
					title: 'Shipping rates',
					subtitle:
						'Define multiple shipping rates based on location, price, weight, or other criteria.',
				},
				{
					title: 'Conditional shipping and payments',
					subtitle: 'Use conditional logic to restrict the shipping and payment options.',
				},
				{
					title: 'Returns and warranty',
					subtitle:
						'Manage the RMA process, add warranties to products and let customers request/manage returns from their account.',
				},
			],
		},
	];

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-ecommerce-trial-plan' ] } />

			<Card className="e-commerce-trial-plans__trial-card">
				<div className="e-commerce-trial-plans__trial-card-content">
					<p className="e-commerce-trial-plans__card-title">
						{ translate( 'You’re in a free trial' ) }
					</p>
					<p className="e-commerce-trial-plans__card-subtitle">
						{ isTrialExpired
							? translate(
									'Your free trial has expired. Sign up to a plan to unlock new features and keep your store running.'
							  )
							: translate(
									'Your free trial will end in %(daysLeft)d day. Upgrade to a plan by %(expirationdate)s to unlock new features and start selling.',
									'Your free trial will end in %(daysLeft)d days. Upgrade to a plan by %(expirationdate)s to unlock new features and start selling.',
									{
										count: eCommerceTrialDaysLeftToDisplay,
										args: {
											daysLeft: eCommerceTrialDaysLeftToDisplay,
											expirationdate: readableExpirationDate,
										},
									}
							  ) }
					</p>
				</div>
				<div className="e-commerce-trial-plans__chart-wrapper">
					<DoughnutChart
						progress={ trialProgress }
						text={ eCommerceTrialDaysLeftToDisplay?.toString() }
					/>
					<br />
					<span className="e-commerce-trial-plans__chart-label">
						{ isTrialExpired
							? translate( 'Your free trial has expired' )
							: translate( 'day left in trial', 'days left in trial', {
									count: eCommerceTrialDaysLeftToDisplay,
							  } ) }
					</span>
				</div>
			</Card>

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
					<span className="e-commerce-trial-plans__price-card-value">
						<span className="e-commerce-trial-plans__price-card-value-symbol">$</span>
						{
							// TODO: make it dynamic
							'45'
						}
					</span>
					<span className="e-commerce-trial-plans__price-card-interval">
						{
							// TODO: translate when final copy is available
							'per month, $540 billed annually'
						}
					</span>
					<span className="e-commerce-trial-plans__price-card-savings">
						{
							// TODO: translate when final copy is available
							'SAVE 31% BY PAYING ANNUALLY'
						}
					</span>
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
