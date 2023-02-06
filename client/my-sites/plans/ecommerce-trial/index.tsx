import { Button, Card } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import SegmentedControl from 'calypso/components/segmented-control';
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

const ECommerceTrialPlans = () => {
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

	const [ interval, setInterval ] = useState( 'yearly' );

	const segmentClasses = classNames( 'price-toggle' );

	const features = [
		{
			expanded: true,
			illustration: '/calypso/images/me/pattern-dark.png',
			title: translate( 'General features' ),
			subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			items: [
				{
					title: translate( 'Online store' ),
					subtitle: translate( 'All-in-one solution for starting your ecommerce store.' ),
				},
				{
					title: translate( 'Mobile app' ),
					subtitle: translate( 'Manage your store anywhere with the free WooCommerce Mobile App.' ),
				},
				{
					title: translate( '24/7 support' ),
					subtitle: translate(
						'Need help? Reach out to us anytime, anywhere. Get 24/7 phone, email, and live chat support.'
					),
				},
				{
					title: translate( 'Unlimited admin accounts' ),
					subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
				},
			],
		},
		{
			illustration: '/calypso/images/me/pattern-dark.png',
			title: translate( 'Payments' ),
			subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			items: [
				{
					title: translate( 'Credit card rate: 2.9% + 30c' ),
					subtitle: translate( 'Accept Visa, Mastercard and' ),
				},
				{
					title: translate( 'Sell in over 60 countries' ),
					subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
				},
				{
					title: translate( 'Advanced subscriptions' ),
					subtitle: translate(
						'Add subscription plans to any product – plus discounts for subscribing and a way for customers to purchase subscriptions for others.'
					),
				},
				{
					title: translate( 'Automated tax compliance' ),
					subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
				},
				{
					title: translate( 'Pre-orders' ),
					subtitle: translate( "Take orders before launches, and fill orders when you're ready." ),
				},
				{
					title: translate( 'Stripe M2 Reader' ),
					subtitle: translate(
						'Easy-to-use mobile card reader designed for fast, reliable payments.'
					),
				},
			],
		},
		{
			illustration: '/calypso/images/me/pattern-dark.png',
			title: translate( 'Product management' ),
			subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			items: [
				{
					title: translate( 'Unlimited products' ),
					subtitle: translate( 'Add unlimited products to your store.' ),
				},
				{
					title: translate( 'Offer gift cards' ),
					subtitle: translate( 'Sell and accept pre-paid, multi-purpose e-gift vouchers.' ),
				},
				{
					title: translate( 'Send back in stock notifications' ),
					subtitle: translate( 'Notify customers when your products are restocked.' ),
				},
				{
					title: translate( 'Set order limits' ),
					subtitle: translate( 'Specify min and max allowed product quantities for orders.' ),
				},
				{
					title: translate( 'Sell product bundles' ),
					subtitle: translate( 'Offer personalized product packages and bulk discounts.' ),
				},
				{
					title: translate( 'Offer customizable product kits' ),
					subtitle: translate(
						'Use Composite Products to add product kit building functionality with inventory management.'
					),
				},
				{
					title: translate( 'Import your products via CSV' ),
					subtitle: translate( 'Import, merge, and export products using a CSV file.' ),
				},
				{
					title: translate( 'Sell product add-ons' ),
					subtitle: translate( 'Enable gift wrapping/messages or custom pricing.' ),
				},
				{
					title: translate( 'Unlimited images' ),
					subtitle: translate( 'Add any number of images to your product variations.' ),
				},
				{
					title: translate( 'Product recommendations' ),
					subtitle: translate(
						'Earn more revenue with automated upsell and cross-sell product recommendations.'
					),
				},
			],
		},
		{
			illustration: '/calypso/images/me/pattern-dark.png',
			title: translate( 'Themes and customization' ),
			subtitle: translate( 'Bring your brand to life with a fully customizable storefront.' ),
			items: [
				{
					title: translate( 'Premium themes' ),
					subtitle: translate(
						'Tap into a diverse selection of beautifully designed premium themes.'
					),
				},
				{
					title: translate( 'Block-based templates' ),
					subtitle: translate(
						"Take control over your store's layout without touching a line of code."
					),
				},
				{
					title: translate( 'Cart and checkout optimization' ),
					subtitle: translate(
						'Streamline your checkout and boost conversions with the Cart and Checkout blocks.'
					),
				},
			],
		},
		{
			illustration: '/calypso/images/me/pattern-dark.png',
			title: translate( 'Marketing and growth' ),
			subtitle: 'Optimize your store for sales by adding in email and social integrations.',
			items: [
				{
					title: translate( 'Sales channels' ),
					subtitle: translate(
						'Promote and sell your products on multiple sales channels, including social media and online marketplaces.'
					),
				},
				{
					title: translate( 'Marketing automation' ),
					subtitle: translate(
						'Build custom automations so you can engage customers at every stage of their journey.'
					),
				},
				{
					title: translate( 'Abandoned cart recovery' ),
					subtitle: translate(
						'Automatically send emails to customers who leave your store without completing the checkout process.'
					),
				},
				{
					title: translate( 'Refer a friend' ),
					subtitle: translate( 'Give a free gift or coupon as a referral reward.' ),
				},
				{
					title: translate( 'Birthday coupon' ),
					subtitle: translate( 'Send customers a personalized coupon on their birthdays.' ),
				},
				{
					title: translate( 'Points and rewards' ),
					subtitle: translate( 'Reward customers for purchases and loyalty.' ),
				},
			],
		},
		{
			illustration: '/calypso/images/me/pattern-dark.png',
			title: translate( 'Shipping' ),
			subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			items: [
				{
					title: translate( 'Shipping labels' ),
					subtitle: translate( 'Save on shipping by printing labels right from your store.' ),
				},
				{
					title: translate( 'Shipping tracking' ),
					subtitle: translate( 'Provide customers with an easy way to track their shipment.' ),
				},
				{
					title: translate( 'Shipping rates' ),
					subtitle: translate(
						'Define multiple shipping rates based on location, price, weight, or other criteria.'
					),
				},
				{
					title: translate( 'Conditional shipping and payments' ),
					subtitle: translate(
						'Use conditional logic to restrict the shipping and payment options.'
					),
				},
				{
					title: translate( 'Returns and warranty' ),
					subtitle: translate(
						'Manage the RMA process, add warranties to products and let customers request/manage returns from their account.'
					),
				},
			],
		},
	];

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-trial-plan' ] } />

			<Card className="e-commerce-trial-plans__trial-card">
				<div className="e-commerce-trial-plans__trial-card-content">
					<p className="e-commerce-trial-plans__card-title">
						{ translate( 'You’re in a free trial store' ) }
					</p>
					<p className="e-commerce-trial-plans__card-subtitle">
						{ isTrialExpired
							? translate(
									'Your free trial has expired. Sign up to a plan to unlock new features and keep your store running.'
							  )
							: translate(
									'Your free trial will end in %(daysLeft)d day. Sign up to a plan by %(expirationdate)s to unlock new features and keep your store running.',
									'Your free trial will end in %(daysLeft)d days. Sign up to a plan by %(expirationdate)s to unlock new features and keep your store running.',
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

			<div className="e-commerce-trial-plans__interval-toggle-wrapper">
				<SegmentedControl compact primary={ true } className={ segmentClasses }>
					<SegmentedControl.Item
						selected={ interval === 'monthly' }
						onClick={ () => setInterval( 'monthly' ) }
					>
						<span>{ translate( 'Pay Monthly' ) }</span>
					</SegmentedControl.Item>

					<SegmentedControl.Item
						selected={ interval === 'yearly' }
						onClick={ () => setInterval( 'yearly' ) }
					>
						<span>{ translate( 'Pay Annually' ) }</span>
					</SegmentedControl.Item>
				</SegmentedControl>
			</div>

			<Card className="e-commerce-trial-plans__price-card">
				<div className="e-commerce-trial-plans__price-card-text">
					<span className="e-commerce-trial-plans__price-card-title">
						{ translate( 'Commerce' ) }
					</span>
					<span className="e-commerce-trial-plans__price-card-subtitle">
						{ translate( 'Accelerate your growth with advanced features.' ) }
					</span>
					<Button className="e-commerce-trial-plans__price-card-cta" primary>
						{ translate( 'Get Commerce' ) }
					</Button>
				</div>
				<div className="e-commerce-trial-plans__price-card-conditions">
					<span className="e-commerce-trial-plans__price-card-value">$45</span>
					<span className="e-commerce-trial-plans__price-card-interval">
						per month, $540 billed annually
					</span>
					<span className="e-commerce-trial-plans__price-card-savings">
						{ translate( 'SAVE 31% BY PAYING ANNUALLY' ) }
					</span>
				</div>
			</Card>
			<div className="e-commerce-trial-plans__features-wrapper">
				{ features.map( ( feature ) => (
					<TrialFeatureCard key={ feature.title } { ...feature } />
				) ) }
			</div>
			<div className="e-commerce-trial-plans__cta-wrapper">
				<Button className="e-commerce-trial-plans__cta is-primary">
					{ translate( 'Get Commerce' ) }
				</Button>
			</div>
		</>
	);
};

export default ECommerceTrialPlans;
